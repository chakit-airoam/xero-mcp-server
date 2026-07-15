import { z } from "zod";
import { Timesheet } from "xero-node/dist/gen/model/payroll-au/timesheet.js";

import { createXeroPayrollAuTimesheet } from "../../handlers/create-xero-payroll-au-timesheet.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const CreatePayrollAuTimesheetTool = CreateXeroTool(
  "create-payroll-au-timesheet",
  `Create a new timesheet in Xero Payroll AU.
Use numberOfUnits as the daily hours array for the timesheet period, e.g. 7 weekdays at 7.6 hours each from 2026-07-01 to 2026-07-09 is [7.6, 7.6, 7.6, 7.6, 7.6, 7.6, 7.6].`,
  {
    employeeID: z.string().describe("Xero employee ID."),
    startDate: z.string().describe("Timesheet period start date in YYYY-MM-DD format."),
    endDate: z.string().describe("Timesheet period end date in YYYY-MM-DD format."),
    status: z.literal("DRAFT").optional().describe("Defaults to a draft timesheet."),
    timesheetLines: z.array(
      z.object({
        earningsRateID: z.string().describe("Xero earnings rate ID."),
        trackingItemID: z.string().optional().describe("Optional payroll tracking option ID."),
        numberOfUnits: z.array(z.number()).describe("Daily units/hours for the period."),
      }),
    ),
  },
  async (timesheet) => {
    const response = await createXeroPayrollAuTimesheet(timesheet as Timesheet);

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error creating Payroll AU timesheet: ${response.error}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Payroll AU timesheet created: ${response.result?.timesheetID ?? "unknown ID"}`,
        },
      ],
    };
  },
);

export default CreatePayrollAuTimesheetTool;
