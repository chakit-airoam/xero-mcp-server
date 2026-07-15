import { z } from "zod";

import { getXeroPayrollAuPayslip } from "../../handlers/get-xero-payroll-au-payslip.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const GetPayrollAuPayslipTool = CreateXeroTool(
  "get-payroll-au-payslip",
  "Retrieve a Xero Payroll AU payslip by payslipID for verification. This is read-only.",
  { payslipID: z.string().describe("Xero Payroll AU payslip ID.") },
  async ({ payslipID }) => {
    const response = await getXeroPayrollAuPayslip(payslipID);

    if (response.isError) {
      return { content: [{ type: "text" as const, text: `Error retrieving Payroll AU payslip: ${response.error}` }] };
    }
    if (!response.result) {
      return { content: [{ type: "text" as const, text: `No Payroll AU payslip found with ID: ${payslipID}` }] };
    }

    return { content: [{ type: "text" as const, text: JSON.stringify(response.result, null, 2) }] };
  },
);

export default GetPayrollAuPayslipTool;
