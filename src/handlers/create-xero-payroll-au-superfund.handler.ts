import { SuperFund } from "xero-node/dist/gen/model/payroll-au/superFund.js";
import { SuperFundType } from "xero-node/dist/gen/model/payroll-au/superFundType.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

function normalise(value?: string): string {
  return (value ?? "").replace(/\s+/g, "").toUpperCase();
}

function matchesSuperfund(superfund: SuperFund, aBN?: string, uSI?: string): boolean {
  const requestedAbn = normalise(aBN);
  const requestedUsi = normalise(uSI);

  return Boolean(
    (requestedAbn && normalise(superfund.aBN) === requestedAbn) ||
      (requestedUsi && normalise(superfund.uSI) === requestedUsi),
  );
}

async function listConfiguredSuperfunds(): Promise<SuperFund[]> {
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

async function validateRegulatedSuperfundProduct(aBN?: string, uSI?: string): Promise<void> {
  const response = await xeroClient.payrollAUApi.getSuperfundProducts(
    xeroClient.tenantId,
    aBN,
    uSI,
    getClientHeaders(),
  );

  const products = response.body.superFundProducts ?? [];
  const matchedProduct = products.find(
    (product) =>
      (!aBN || normalise(product.aBN) === normalise(aBN)) &&
      (!uSI || normalise(product.uSI) === normalise(uSI)),
  );

  if (!matchedProduct) {
    throw new Error("No matching regulated Payroll AU superfund product found for the supplied ABN/USI.");
  }
}

async function createPayrollAuSuperfund(
  name: string,
  aBN: string,
  uSI: string,
): Promise<{ superfund: SuperFund; created: boolean }> {
  await xeroClient.authenticate();

  const configuredSuperfunds = await listConfiguredSuperfunds();
  const existingSuperfund = configuredSuperfunds.find((superfund) =>
    matchesSuperfund(superfund, aBN, uSI),
  );

  if (existingSuperfund) {
    return {
      superfund: existingSuperfund,
      created: false,
    };
  }

  await validateRegulatedSuperfundProduct(aBN, uSI);

  const response = await xeroClient.payrollAUApi.createSuperfund(
    xeroClient.tenantId,
    [
      {
        type: SuperFundType.REGULATED,
        name,
        aBN,
        uSI,
      },
    ],
    undefined,
    getClientHeaders(),
  );

  const superfund = response.body.superFunds?.[0];

  if (!superfund) {
    throw new Error("Payroll AU superfund creation failed.");
  }

  return {
    superfund,
    created: true,
  };
}

export async function createXeroPayrollAuSuperfund(
  name: string,
  aBN: string,
  uSI: string,
): Promise<XeroClientResponse<{ superfund: SuperFund; created: boolean }>> {
  try {
    const result = await createPayrollAuSuperfund(name, aBN, uSI);

    return {
      result,
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
