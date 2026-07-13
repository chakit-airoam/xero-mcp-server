import { z } from "zod";

import {
  listXeroPayrollAuSuperfundProducts,
} from "../../handlers/list-xero-payroll-au-superfund-products.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const ListPayrollAuSuperfundProductsTool = CreateXeroTool(
  "list-payroll-au-superfund-products",
  "Search Payroll AU regulated superfund products by ABN or USI. This returns fund product data; employee memberships still need a Xero superFundID from list-payroll-au-superfunds.",
  {
    aBN: z.string().optional().describe("Regulated super fund ABN."),
    uSI: z.string().optional().describe("Regulated super fund USI."),
  },
  async ({ aBN, uSI }) => {
    const response = await listXeroPayrollAuSuperfundProducts(aBN, uSI);

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error listing Payroll AU superfund products: ${response.error}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${response.result?.length ?? 0} Payroll AU superfund products:`,
        },
        ...(response.result?.map((product) => ({
          type: "text" as const,
          text: [
            product.productName ? `Product: ${product.productName}` : null,
            product.aBN ? `ABN: ${product.aBN}` : null,
            product.uSI ? `USI: ${product.uSI}` : null,
            product.sPIN ? `SPIN: ${product.sPIN}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
        })) ?? []),
      ],
    };
  },
);

export default ListPayrollAuSuperfundProductsTool;
