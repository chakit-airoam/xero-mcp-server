import { PayRunStatus } from "xero-node/dist/gen/model/payroll-au/payRunStatus.js";
import { Payslip } from "xero-node/dist/gen/model/payroll-au/payslip.js";
import { PayslipLines } from "xero-node/dist/gen/model/payroll-au/payslipLines.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

function findDraftPayRunForPayslip(payRuns: Array<{ payRunStatus?: PayRunStatus; payslips?: Array<{ payslipID?: string }> }>, payslipID: string): boolean {
  return payRuns.some((payRun) =>
    payRun.payRunStatus === PayRunStatus.DRAFT &&
    payRun.payslips?.some((payslip) => payslip.payslipID === payslipID),
  );
}

async function updatePayrollAuPayslip(
  payslipID: string,
  payslipLines: PayslipLines,
): Promise<Payslip | null> {
  await xeroClient.authenticate();

  const payRuns = await xeroClient.payrollAUApi.getPayRuns(
    xeroClient.tenantId,
    undefined,
    undefined,
    undefined,
    undefined,
    getClientHeaders(),
  );

  if (!findDraftPayRunForPayslip(payRuns.body.payRuns ?? [], payslipID)) {
    throw new Error("Payslip must belong to a DRAFT Payroll AU pay run before it can be updated");
  }

  const response = await xeroClient.payrollAUApi.updatePayslip(
    xeroClient.tenantId,
    payslipID,
    [payslipLines],
    undefined,
    getClientHeaders(),
  );

  return response.body.payslips?.[0] ?? null;
}

export async function updateXeroPayrollAuPayslip(
  payslipID: string,
  payslipLines: PayslipLines,
): Promise<XeroClientResponse<Payslip | null>> {
  try {
    return { result: await updatePayrollAuPayslip(payslipID, payslipLines), isError: false, error: null };
  } catch (error) {
    return { result: null, isError: true, error: formatError(error) };
  }
}
