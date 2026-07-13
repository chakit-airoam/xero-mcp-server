import { Timesheet } from "xero-node/dist/gen/model/payroll-au/timesheet.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

async function createPayrollAuTimesheet(timesheet: Timesheet): Promise<Timesheet | null> {
  await xeroClient.authenticate();

  const response = await xeroClient.payrollAUApi.createTimesheet(
    xeroClient.tenantId,
    [timesheet],
    undefined,
    getClientHeaders(),
  );

  return response.body.timesheets?.[0] ?? null;
}

export async function createXeroPayrollAuTimesheet(
  timesheet: Timesheet,
): Promise<XeroClientResponse<Timesheet | null>> {
  try {
    const newTimesheet = await createPayrollAuTimesheet(timesheet);

    return {
      result: newTimesheet,
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
