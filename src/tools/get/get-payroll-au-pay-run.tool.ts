import { z } from "zod";

import { getXeroPayrollAuPayRun } from "../../handlers/get-xero-payroll-au-pay-run.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const GetPayrollAuPayRunTool = CreateXeroTool(
  "get-payroll-au-pay-run",
  "Retrieve a Xero Payroll AU pay run by payRunID. This is read-only.",
  {
    payRunID: z.string().describe("Xero Payroll AU pay run ID."),
  },
  async ({ payRunID }) => {
    const response = await getXeroPayrollAuPayRun(payRunID);

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error retrieving Payroll AU pay run: ${response.error}`,
          },
        ],
      };
    }

    if (!response.result) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No Payroll AU pay run found with ID: ${payRunID}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response.result, null, 2),
        },
      ],
    };
  },
);

export default GetPayrollAuPayRunTool;
