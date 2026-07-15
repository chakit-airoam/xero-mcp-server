import { z } from "zod";

import { getXeroPayrollAuTimesheet } from "../../handlers/get-xero-payroll-au-timesheet.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const GetPayrollAuTimesheetTool = CreateXeroTool(
  "get-payroll-au-timesheet",
  "Retrieve a Xero Payroll AU timesheet by timesheetID. This is read-only.",
  { timesheetID: z.string().describe("Xero Payroll AU timesheet ID.") },
  async ({ timesheetID }) => {
    const response = await getXeroPayrollAuTimesheet(timesheetID);

    if (response.isError) {
      return { content: [{ type: "text" as const, text: `Error retrieving Payroll AU timesheet: ${response.error}` }] };
    }
    if (!response.result) {
      return { content: [{ type: "text" as const, text: `No Payroll AU timesheet found with ID: ${timesheetID}` }] };
    }

    return { content: [{ type: "text" as const, text: JSON.stringify(response.result, null, 2) }] };
  },
);

export default GetPayrollAuTimesheetTool;
