import { z } from "zod";
import { TimesheetStatus } from "xero-node/dist/gen/model/payroll-au/timesheetStatus.js";

import { listXeroPayrollAuTimesheets } from "../../handlers/list-xero-payroll-au-timesheets.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const ListPayrollAuTimesheetsTool = CreateXeroTool(
  "list-payroll-au-timesheets",
  "List Xero Payroll AU timesheets. Use this before creating a timesheet to avoid duplicates. This is read-only.",
  {
    employeeID: z.string().optional().describe("Optional Xero employee ID filter."),
    startDate: z.string().optional().describe("Optional period start date filter, YYYY-MM-DD."),
    endDate: z.string().optional().describe("Optional period end date filter, YYYY-MM-DD."),
    status: z.enum(["DRAFT", "PROCESSED", "APPROVED", "REJECTED", "REQUESTED"]).optional(),
  },
  async ({ employeeID, startDate, endDate, status }) => {
    const response = await listXeroPayrollAuTimesheets(
      employeeID,
      startDate,
      endDate,
      status === undefined ? undefined : TimesheetStatus[status],
    );

    if (response.isError) {
      return { content: [{ type: "text" as const, text: `Error listing Payroll AU timesheets: ${response.error}` }] };
    }

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify(response.result ?? [], null, 2),
      }],
    };
  },
);

export default ListPayrollAuTimesheetsTool;
