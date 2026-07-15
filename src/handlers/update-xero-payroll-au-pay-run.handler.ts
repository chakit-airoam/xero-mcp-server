import { PayRun } from "xero-node/dist/gen/model/payroll-au/payRun.js";
import { PayRunStatus } from "xero-node/dist/gen/model/payroll-au/payRunStatus.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

async function updatePayrollAuPayRun(payRunID: string, changes: PayRun): Promise<PayRun | null> {
  await xeroClient.authenticate();

  const existing = await xeroClient.payrollAUApi.getPayRun(
    xeroClient.tenantId,
    payRunID,
    getClientHeaders(),
  );
  const existingPayRun = existing.body.payRuns?.[0];

  if (!existingPayRun) {
    throw new Error(`Payroll AU pay run not found: ${payRunID}`);
  }
  if (existingPayRun.payRunStatus !== PayRunStatus.DRAFT) {
    throw new Error("Only DRAFT Payroll AU pay runs can be updated");
  }

  const response = await xeroClient.payrollAUApi.updatePayRun(
    xeroClient.tenantId,
    payRunID,
    [{
      payrollCalendarID: existingPayRun.payrollCalendarID,
      payRunPeriodStartDate: changes.payRunPeriodStartDate ?? existingPayRun.payRunPeriodStartDate,
      payRunPeriodEndDate: changes.payRunPeriodEndDate ?? existingPayRun.payRunPeriodEndDate,
      paymentDate: changes.paymentDate ?? existingPayRun.paymentDate,
      payslipMessage: changes.payslipMessage ?? existingPayRun.payslipMessage,
      payRunStatus: PayRunStatus.DRAFT,
    }],
    undefined,
    getClientHeaders(),
  );

  return response.body.payRuns?.[0] ?? null;
}

export async function updateXeroPayrollAuPayRun(
  payRunID: string,
  changes: PayRun,
): Promise<XeroClientResponse<PayRun | null>> {
  try {
    return { result: await updatePayrollAuPayRun(payRunID, changes), isError: false, error: null };
  } catch (error) {
    return { result: null, isError: true, error: formatError(error) };
  }
}
