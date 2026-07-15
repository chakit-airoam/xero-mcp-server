import { Timesheet } from "xero-node/dist/gen/model/payroll-au/timesheet.js";
import { TimesheetStatus } from "xero-node/dist/gen/model/payroll-au/timesheetStatus.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

async function updatePayrollAuTimesheet(
  timesheetID: string,
  timesheet: Timesheet,
): Promise<Timesheet | null> {
  await xeroClient.authenticate();

  const existing = await xeroClient.payrollAUApi.getTimesheet(
    xeroClient.tenantId,
    timesheetID,
    getClientHeaders(),
  );
  const existingTimesheet = existing.body.timesheet;

  if (!existingTimesheet) {
    throw new Error(`Payroll AU timesheet not found: ${timesheetID}`);
  }
  if (existingTimesheet.status !== TimesheetStatus.DRAFT) {
    throw new Error("Only DRAFT Payroll AU timesheets can be updated");
  }

  const response = await xeroClient.payrollAUApi.updateTimesheet(
    xeroClient.tenantId,
    timesheetID,
    [{
      employeeID: existingTimesheet.employeeID,
      startDate: existingTimesheet.startDate,
      endDate: existingTimesheet.endDate,
      status: TimesheetStatus.DRAFT,
      timesheetLines: timesheet.timesheetLines,
    }],
    undefined,
    getClientHeaders(),
  );

  return response.body.timesheets?.[0] ?? null;
}

export async function updateXeroPayrollAuTimesheet(
  timesheetID: string,
  timesheet: Timesheet,
): Promise<XeroClientResponse<Timesheet | null>> {
  try {
    return { result: await updatePayrollAuTimesheet(timesheetID, timesheet), isError: false, error: null };
  } catch (error) {
    return { result: null, isError: true, error: formatError(error) };
  }
}
