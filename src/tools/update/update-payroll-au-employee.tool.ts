import { z } from "zod";
import { Employee } from "xero-node/dist/gen/model/payroll-au/employee.js";

import { updateXeroPayrollAuEmployee } from "../../handlers/update-xero-payroll-au-employee.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const UpdatePayrollAuEmployeeTool = CreateXeroTool(
  "update-payroll-au-employee",
  `Update an existing employee in Xero Payroll AU.
Use this for Australian payroll employees only. Send only the fields that need to change.`,
  {
    employeeID: z.string().describe("Xero employee ID."),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    dateOfBirth: z.string().optional().describe("Date of birth in YYYY-MM-DD format."),
    startDate: z.string().optional().describe("Employment start date in YYYY-MM-DD format."),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    jobTitle: z.string().optional(),
    ordinaryEarningsRateID: z.string().optional(),
    payrollCalendarID: z.string().optional(),
  },
  async ({ employeeID, ...employee }) => {
    const response = await updateXeroPayrollAuEmployee(employeeID, employee as Employee);

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error updating Payroll AU employee: ${response.error}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Payroll AU employee updated: ${response.result?.employeeID ?? employeeID}`,
        },
      ],
    };
  },
);

export default UpdatePayrollAuEmployeeTool;
