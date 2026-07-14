import { z } from "zod";
import { Employee } from "xero-node/dist/gen/model/payroll-au/employee.js";

import { getXeroPayrollAuEmployee } from "../../handlers/get-xero-payroll-au-employee.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

function mask(value?: string, visible = 3): string | undefined {
  if (!value) {
    return value;
  }

  const compactValue = value.replace(/\s+/g, "");
  if (compactValue.length <= visible) {
    return "*".repeat(compactValue.length);
  }

  return `${"*".repeat(Math.max(compactValue.length - visible, 0))}${compactValue.slice(-visible)}`;
}

function maskEmployee(employee: Employee): Record<string, unknown> {
  return {
    ...employee,
    bankAccounts: employee.bankAccounts?.map((account) => ({
      ...account,
      bSB: mask(account.bSB, 2),
      accountNumber: mask(account.accountNumber, 3),
    })),
    taxDeclaration: employee.taxDeclaration
      ? {
          ...employee.taxDeclaration,
          taxFileNumber: mask(employee.taxDeclaration.taxFileNumber, 3),
        }
      : undefined,
    superMemberships: employee.superMemberships?.map((membership) => ({
      ...membership,
      employeeNumber: mask(membership.employeeNumber, 3),
    })),
  };
}

const GetPayrollAuEmployeeTool = CreateXeroTool(
  "get-payroll-au-employee",
  "Retrieve a complete Xero Payroll AU employee record by employee ID. Sensitive identifiers such as TFN, bank account number, BSB, and super member number are masked in output.",
  {
    employeeID: z.string().describe("Xero Payroll AU employee ID."),
  },
  async ({ employeeID }) => {
    const response = await getXeroPayrollAuEmployee(employeeID);

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error retrieving Payroll AU employee: ${response.error}`,
          },
        ],
      };
    }

    if (!response.result) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No Payroll AU employee found with ID: ${employeeID}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(maskEmployee(response.result), null, 2),
        },
      ],
    };
  },
);

export default GetPayrollAuEmployeeTool;
