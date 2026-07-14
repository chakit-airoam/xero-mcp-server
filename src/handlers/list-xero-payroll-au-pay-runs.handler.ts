import { PayRun } from "xero-node/dist/gen/model/payroll-au/payRun.js";
import { PayRunStatus } from "xero-node/dist/gen/model/payroll-au/payRunStatus.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

function matchesFilter(
  payRun: PayRun,
  payrollCalendarID?: string,
  startDate?: string,
  endDate?: string,
  status?: PayRunStatus,
): boolean {
  return (
    (!payrollCalendarID || payRun.payrollCalendarID === payrollCalendarID) &&
    (!startDate || payRun.payRunPeriodStartDate === startDate) &&
    (!endDate || payRun.payRunPeriodEndDate === endDate) &&
    (!status || payRun.payRunStatus === status)
  );
}

async function listPayrollAuPayRuns(
  payrollCalendarID?: string,
  startDate?: string,
  endDate?: string,
  status?: PayRunStatus,
): Promise<PayRun[]> {
  await xeroClient.authenticate();

  const response = await xeroClient.payrollAUApi.getPayRuns(
    xeroClient.tenantId,
    undefined,
    undefined,
    undefined,
    undefined,
    getClientHeaders(),
  );

  return (response.body.payRuns ?? []).filter((payRun) =>
    matchesFilter(payRun, payrollCalendarID, startDate, endDate, status),
  );
}

export async function listXeroPayrollAuPayRuns(
  payrollCalendarID?: string,
  startDate?: string,
  endDate?: string,
  status?: PayRunStatus,
): Promise<XeroClientResponse<PayRun[]>> {
  try {
    const payRuns = await listPayrollAuPayRuns(payrollCalendarID, startDate, endDate, status);

    return {
      result: payRuns,
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
