import { z } from "zod";
import { Timesheet } from "xero-node/dist/gen/model/payroll-au/timesheet.js";

import { updateXeroPayrollAuTimesheet } from "../../handlers/update-xero-payroll-au-timesheet.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const UpdatePayrollAuTimesheetTool = CreateXeroTool(
  "update-payroll-au-timesheet",
  `Replace the lines of a DRAFT Xero Payroll AU timesheet.
Retrieve the timesheet first, then provide the complete intended timesheetLines array. This tool cannot modify processed or approved timesheets.`,
  {
    timesheetID: z.string().describe("Xero Payroll AU timesheet ID."),
    timesheetLines: z.array(z.object({
      earningsRateID: z.string().optional(),
      trackingItemID: z.string().optional(),
      numberOfUnits: z.array(z.number()).optional(),
    })).min(1).describe("Complete replacement set of timesheet lines."),
  },
  async ({ timesheetID, timesheetLines }) => {
    const response = await updateXeroPayrollAuTimesheet(
      timesheetID,
      { timesheetLines } as Timesheet,
    );

    if (response.isError) {
      return { content: [{ type: "text" as const, text: `Error updating Payroll AU timesheet: ${response.error}` }] };
    }

    return { content: [{ type: "text" as const, text: JSON.stringify(response.result, null, 2) }] };
  },
);

export default UpdatePayrollAuTimesheetTool;
