import { SuperFundProduct } from "xero-node/dist/gen/model/payroll-au/superFundProduct.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

async function getPayrollAuSuperfundProducts(
  aBN?: string,
  uSI?: string,
): Promise<SuperFundProduct[]> {
  await xeroClient.authenticate();

  const response = await xeroClient.payrollAUApi.getSuperfundProducts(
    xeroClient.tenantId,
    aBN,
    uSI,
    getClientHeaders(),
  );

  return response.body.superFundProducts ?? [];
}

export async function listXeroPayrollAuSuperfundProducts(
  aBN?: string,
  uSI?: string,
): Promise<XeroClientResponse<SuperFundProduct[]>> {
  try {
    const products = await getPayrollAuSuperfundProducts(aBN, uSI);

    return {
      result: products,
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
