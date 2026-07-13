import { listXeroPayrollAuCalendars } from "../../handlers/list-xero-payroll-au-calendars.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const ListPayrollAuCalendarsTool = CreateXeroTool(
  "list-payroll-au-calendars",
  "List Payroll AU calendars in Xero, including payrollCalendarID, name, calendar type, start date, and payment date.",
  {},
  async () => {
    const response = await listXeroPayrollAuCalendars();

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error listing Payroll AU calendars: ${response.error}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${response.result?.length ?? 0} Payroll AU calendars:`,
        },
        ...(response.result?.map((calendar) => ({
          type: "text" as const,
          text: [
            `Payroll Calendar ID: ${calendar.payrollCalendarID}`,
            calendar.name ? `Name: ${calendar.name}` : null,
            calendar.calendarType ? `Type: ${calendar.calendarType}` : null,
            calendar.startDate ? `Start Date: ${calendar.startDate}` : null,
            calendar.paymentDate ? `Payment Date: ${calendar.paymentDate}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
        })) ?? []),
      ],
    };
  },
);

export default ListPayrollAuCalendarsTool;
