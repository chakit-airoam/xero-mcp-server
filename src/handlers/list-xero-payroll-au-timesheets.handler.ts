import { Timesheet } from "xero-node/dist/gen/model/payroll-au/timesheet.js";
import { TimesheetStatus } from "xero-node/dist/gen/model/payroll-au/timesheetStatus.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

function matchesFilter(
  timesheet: Timesheet,
  employeeID?: string,
  startDate?: string,
  endDate?: string,
  status?: TimesheetStatus,
): boolean {
  return (
    (!employeeID || timesheet.employeeID === employeeID) &&
    (!startDate || timesheet.startDate === startDate) &&
    (!endDate || timesheet.endDate === endDate) &&
    (status === undefined || timesheet.status === status)
  );
}

async function listPayrollAuTimesheets(
  employeeID?: string,
  startDate?: string,
  endDate?: string,
  status?: TimesheetStatus,
): Promise<Timesheet[]> {
  await xeroClient.authenticate();

  const response = await xeroClient.payrollAUApi.getTimesheets(
    xeroClient.tenantId,
    undefined,
    undefined,
    undefined,
    undefined,
    getClientHeaders(),
  );

  return (response.body.timesheets ?? []).filter((timesheet) =>
    matchesFilter(timesheet, employeeID, startDate, endDate, status),
  );
}

export async function listXeroPayrollAuTimesheets(
  employeeID?: string,
  startDate?: string,
  endDate?: string,
  status?: TimesheetStatus,
): Promise<XeroClientResponse<Timesheet[]>> {
  try {
    return {
      result: await listPayrollAuTimesheets(employeeID, startDate, endDate, status),
      isError: false,
      error: null,
    };
  } catch (error) {
    return {
      result: null,
      isError: true,
      error: formatError(error),
    };
  }
}
