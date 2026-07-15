import { Timesheet } from "xero-node/dist/gen/model/payroll-au/timesheet.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

async function getPayrollAuTimesheet(timesheetID: string): Promise<Timesheet | null> {
  await xeroClient.authenticate();

  const response = await xeroClient.payrollAUApi.getTimesheet(
    xeroClient.tenantId,
    timesheetID,
    getClientHeaders(),
  );

  return response.body.timesheet ?? null;
}

export async function getXeroPayrollAuTimesheet(
  timesheetID: string,
): Promise<XeroClientResponse<Timesheet | null>> {
  try {
    return { result: await getPayrollAuTimesheet(timesheetID), isError: false, error: null };
  } catch (error) {
    return { result: null, isError: true, error: formatError(error) };
  }
}
