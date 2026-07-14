import { PayRun } from "xero-node/dist/gen/model/payroll-au/payRun.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

async function createPayrollAuPayRun(payRun: PayRun): Promise<PayRun | null> {
  await xeroClient.authenticate();

  const response = await xeroClient.payrollAUApi.createPayRun(
    xeroClient.tenantId,
    [payRun],
    undefined,
    getClientHeaders(),
  );

  return response.body.payRuns?.[0] ?? null;
}

export async function createXeroPayrollAuPayRun(
  payRun: PayRun,
): Promise<XeroClientResponse<PayRun | null>> {
  try {
    const createdPayRun = await createPayrollAuPayRun(payRun);

    return {
      result: createdPayRun,
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
