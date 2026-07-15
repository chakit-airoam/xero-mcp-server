import { PayRun } from "xero-node/dist/gen/model/payroll-au/payRun.js";
import { PayRunStatus } from "xero-node/dist/gen/model/payroll-au/payRunStatus.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

async function postPayrollAuPayRun(payRunID: string): Promise<PayRun | null> {
  await xeroClient.authenticate();

  const existing = await xeroClient.payrollAUApi.getPayRun(
    xeroClient.tenantId,
    payRunID,
    getClientHeaders(),
  );
  const payRun = existing.body.payRuns?.[0];

  if (!payRun) {
    throw new Error(`Payroll AU pay run not found: ${payRunID}`);
  }
  if (payRun.payRunStatus !== PayRunStatus.DRAFT) {
    throw new Error("Only DRAFT Payroll AU pay runs can be posted");
  }
  if (!payRun.payslips?.length || !payRun.wages || payRun.wages <= 0) {
    throw new Error("Refusing to post a pay run without payslips and a non-zero wages total");
  }

  const response = await xeroClient.payrollAUApi.updatePayRun(
    xeroClient.tenantId,
    payRunID,
    [{
      payrollCalendarID: payRun.payrollCalendarID,
      payRunPeriodStartDate: payRun.payRunPeriodStartDate,
      payRunPeriodEndDate: payRun.payRunPeriodEndDate,
      paymentDate: payRun.paymentDate,
      payslipMessage: payRun.payslipMessage,
      payRunStatus: PayRunStatus.POSTED,
    }],
    undefined,
    getClientHeaders(),
  );

  const postedPayRun = response.body.payRuns?.[0] ?? null;
  if (postedPayRun?.payRunStatus !== PayRunStatus.POSTED) {
    throw new Error("Xero did not confirm the pay run as POSTED");
  }

  return postedPayRun;
}

export async function postXeroPayrollAuPayRun(
  payRunID: string,
): Promise<XeroClientResponse<PayRun | null>> {
  try {
    return { result: await postPayrollAuPayRun(payRunID), isError: false, error: null };
  } catch (error) {
    return { result: null, isError: true, error: formatError(error) };
  }
}
