import { z } from "zod";

import { createXeroPayrollAuSuperfund } from "../../handlers/create-xero-payroll-au-superfund.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const CreatePayrollAuSuperfundTool = CreateXeroTool(
  "create-payroll-au-superfund",
  "Create a regulated Payroll AU superfund in the current Xero organisation. The tool is idempotent: it returns an existing configured superfund when ABN or USI already matches.",
  {
    name: z.string().describe("Super fund name, e.g. AustralianSuper."),
    aBN: z.string().describe("Regulated super fund ABN, with or without spaces."),
    uSI: z.string().describe("Regulated super fund USI."),
  },
  async ({ name, aBN, uSI }) => {
    const response = await createXeroPayrollAuSuperfund(name, aBN, uSI);

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error creating Payroll AU superfund: ${response.error}`,
          },
        ],
      };
    }

    const result = response.result;
    const superfund = result?.superfund;

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              superFundID: superfund?.superFundID,
              name: superfund?.name,
              aBN: superfund?.aBN,
              uSI: superfund?.uSI,
              type: superfund?.type,
              created: result?.created ?? false,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

export default CreatePayrollAuSuperfundTool;
