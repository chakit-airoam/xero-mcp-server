import { z } from "zod";
import { PayRunStatus } from "xero-node/dist/gen/model/payroll-au/payRunStatus.js";

import { listXeroPayrollAuPayRuns } from "../../handlers/list-xero-payroll-au-pay-runs.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const ListPayrollAuPayRunsTool = CreateXeroTool(
  "list-payroll-au-pay-runs",
  "List Xero Payroll AU pay runs. This is read-only and can filter by payroll calendar, period dates, and status.",
  {
    payrollCalendarID: z.string().optional().describe("Optional Xero payroll calendar ID filter."),
    startDate: z.string().optional().describe("Optional pay run period start date filter, YYYY-MM-DD."),
    endDate: z.string().optional().describe("Optional pay run period end date filter, YYYY-MM-DD."),
    status: z.enum(["DRAFT", "POSTED"]).optional().describe("Optional Xero pay run status filter."),
  },
  async ({ payrollCalendarID, startDate, endDate, status }) => {
    const response = await listXeroPayrollAuPayRuns(
      payrollCalendarID,
      startDate,
      endDate,
      status as PayRunStatus | undefined,
    );

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error listing Payroll AU pay runs: ${response.error}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${response.result?.length ?? 0} Payroll AU pay runs:`,
        },
        ...(response.result?.map((payRun) => ({
          type: "text" as const,
          text: JSON.stringify(
            {
              payRunID: payRun.payRunID,
              payrollCalendarID: payRun.payrollCalendarID,
              payRunPeriodStartDate: payRun.payRunPeriodStartDate,
              payRunPeriodEndDate: payRun.payRunPeriodEndDate,
              paymentDate: payRun.paymentDate,
              payRunStatus: payRun.payRunStatus,
              employeeCount: payRun.payslips?.length ?? 0,
              wages: payRun.wages,
              tax: payRun.tax,
              super: payRun._super,
              netPay: payRun.netPay,
            },
            null,
            2,
          ),
        })) ?? []),
      ],
    };
  },
);

export default ListPayrollAuPayRunsTool;
