import { PayRun } from "xero-node/dist/gen/model/payroll-au/payRun.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

async function getPayrollAuPayRun(payRunID: string): Promise<PayRun | null> {
  await xeroClient.authenticate();

  const response = await xeroClient.payrollAUApi.getPayRun(
    xeroClient.tenantId,
    payRunID,
    getClientHeaders(),
  );

  return response.body.payRuns?.[0] ?? null;
}

export async function getXeroPayrollAuPayRun(
  payRunID: string,
): Promise<XeroClientResponse<PayRun | null>> {
  try {
    const payRun = await getPayrollAuPayRun(payRunID);

    return {
      result: payRun,
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
