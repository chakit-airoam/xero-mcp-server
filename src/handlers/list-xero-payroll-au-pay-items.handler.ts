import { PayItem } from "xero-node/dist/gen/model/payroll-au/payItem.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

async function getPayrollAuPayItems(): Promise<PayItem | null> {
  await xeroClient.authenticate();

  const response = await xeroClient.payrollAUApi.getPayItems(
    xeroClient.tenantId,
    undefined,
    undefined,
    undefined,
    undefined,
    getClientHeaders(),
  );

  return response.body.payItems ?? null;
}

export async function listXeroPayrollAuPayItems(): Promise<
  XeroClientResponse<PayItem | null>
> {
  try {
    const payItems = await getPayrollAuPayItems();

    return {
      result: payItems,
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
