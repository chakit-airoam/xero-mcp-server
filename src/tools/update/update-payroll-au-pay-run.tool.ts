import { z } from "zod";
import { PayRun } from "xero-node/dist/gen/model/payroll-au/payRun.js";

import { updateXeroPayrollAuPayRun } from "../../handlers/update-xero-payroll-au-pay-run.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const UpdatePayrollAuPayRunTool = CreateXeroTool(
  "update-payroll-au-pay-run",
  `Update the period dates, payment date, or payslip message of a DRAFT Xero Payroll AU pay run.
This tool refuses posted pay runs and cannot post, pay, file, or finalise a pay run.`,
  {
    payRunID: z.string().describe("Xero Payroll AU pay run ID."),
    payRunPeriodStartDate: z.string().optional().describe("Updated period start date, YYYY-MM-DD."),
    payRunPeriodEndDate: z.string().optional().describe("Updated period end date, YYYY-MM-DD."),
    paymentDate: z.string().optional().describe("Updated payment date, YYYY-MM-DD."),
    payslipMessage: z.string().optional().describe("Updated payslip message."),
  },
  async ({ payRunID, ...changes }) => {
    if (Object.keys(changes).length === 0) {
      return { content: [{ type: "text" as const, text: "Provide at least one editable pay run field to update." }] };
    }

    const response = await updateXeroPayrollAuPayRun(payRunID, changes as PayRun);

    if (response.isError) {
      return { content: [{ type: "text" as const, text: `Error updating Payroll AU pay run: ${response.error}` }] };
    }

    return { content: [{ type: "text" as const, text: JSON.stringify(response.result, null, 2) }] };
  },
);

export default UpdatePayrollAuPayRunTool;
