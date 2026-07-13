import { SuperFund } from "xero-node/dist/gen/model/payroll-au/superFund.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

async function getPayrollAuSuperfunds(): Promise<SuperFund[]> {
  await xeroClient.authenticate();

  const response = await xeroClient.payrollAUApi.getSuperfunds(
    xeroClient.tenantId,
    undefined,
    undefined,
    undefined,
    undefined,
    getClientHeaders(),
  );

  return response.body.superFunds ?? [];
}

export async function listXeroPayrollAuSuperfunds(): Promise<
  XeroClientResponse<SuperFund[]>
> {
  try {
    const superfunds = await getPayrollAuSuperfunds();

    return {
      result: superfunds,
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
