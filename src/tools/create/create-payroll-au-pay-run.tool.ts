import { z } from "zod";
import { PayRun } from "xero-node/dist/gen/model/payroll-au/payRun.js";

import { createXeroPayrollAuPayRun } from "../../handlers/create-xero-payroll-au-pay-run.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const CreatePayrollAuPayRunTool = CreateXeroTool(
  "create-payroll-au-pay-run",
  `Create a draft Xero Payroll AU pay run.
This tool only creates a pay run. It does not post, approve, pay, file, or finalise the pay run.`,
  {
    payrollCalendarID: z.string().describe("Xero payroll calendar ID."),
    payRunPeriodStartDate: z.string().describe("Pay run period start date in YYYY-MM-DD format."),
    payRunPeriodEndDate: z.string().describe("Pay run period end date in YYYY-MM-DD format."),
    paymentDate: z.string().describe("Payment date in YYYY-MM-DD format."),
    payslipMessage: z.string().optional().describe("Optional payslip message."),
  },
  async (payRun) => {
    const response = await createXeroPayrollAuPayRun(payRun as PayRun);

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error creating Payroll AU pay run: ${response.error}`,
          },
        ],
      };
    }

    const createdPayRun = response.result;

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              payRunID: createdPayRun?.payRunID,
              payrollCalendarID: createdPayRun?.payrollCalendarID,
              payRunPeriodStartDate: createdPayRun?.payRunPeriodStartDate,
              payRunPeriodEndDate: createdPayRun?.payRunPeriodEndDate,
              paymentDate: createdPayRun?.paymentDate,
              payRunStatus: createdPayRun?.payRunStatus,
              wages: createdPayRun?.wages,
              tax: createdPayRun?.tax,
              super: createdPayRun?._super,
              netPay: createdPayRun?.netPay,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

export default CreatePayrollAuPayRunTool;
