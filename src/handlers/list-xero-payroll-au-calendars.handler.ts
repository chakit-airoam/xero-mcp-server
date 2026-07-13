import { PayrollCalendar } from "xero-node/dist/gen/model/payroll-au/payrollCalendar.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

async function getPayrollAuCalendars(): Promise<PayrollCalendar[]> {
  await xeroClient.authenticate();

  const response = await xeroClient.payrollAUApi.getPayrollCalendars(
    xeroClient.tenantId,
    undefined,
    undefined,
    undefined,
    undefined,
    getClientHeaders(),
  );

  return response.body.payrollCalendars ?? [];
}

export async function listXeroPayrollAuCalendars(): Promise<
  XeroClientResponse<PayrollCalendar[]>
> {
  try {
    const calendars = await getPayrollAuCalendars();

    return {
      result: calendars,
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
