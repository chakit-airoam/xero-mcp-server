import { Payslip } from "xero-node/dist/gen/model/payroll-au/payslip.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

async function getPayrollAuPayslip(payslipID: string): Promise<Payslip | null> {
  await xeroClient.authenticate();

  const response = await xeroClient.payrollAUApi.getPayslip(
    xeroClient.tenantId,
    payslipID,
    getClientHeaders(),
  );

  return response.body.payslip ?? null;
}

export async function getXeroPayrollAuPayslip(
  payslipID: string,
): Promise<XeroClientResponse<Payslip | null>> {
  try {
    return { result: await getPayrollAuPayslip(payslipID), isError: false, error: null };
  } catch (error) {
    return { result: null, isError: true, error: formatError(error) };
  }
}
