import { z } from "zod";

import { postXeroPayrollAuPayRun } from "../../handlers/post-xero-payroll-au-pay-run.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const PostPayrollAuPayRunTool = CreateXeroTool(
  "post-payroll-au-pay-run",
  `Post an existing DRAFT Xero Payroll AU pay run.
This is a consequential financial action: it creates the payroll journals in Xero. Use only when the user explicitly asks to post this exact pay run after reviewing totals. The tool refuses non-draft, zero-wage, or payslip-free pay runs.`,
  {
    payRunID: z.string().describe("Exact Xero Payroll AU DRAFT pay run ID to post."),
  },
  async ({ payRunID }) => {
    const response = await postXeroPayrollAuPayRun(payRunID);

    if (response.isError) {
      return { content: [{ type: "text" as const, text: `Error posting Payroll AU pay run: ${response.error}` }] };
    }

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          payRunID: response.result?.payRunID,
          payRunStatus: response.result?.payRunStatus,
          paymentDate: response.result?.paymentDate,
          wages: response.result?.wages,
          tax: response.result?.tax,
          super: response.result?._super,
          netPay: response.result?.netPay,
        }, null, 2),
      }],
    };
  },
);

export default PostPayrollAuPayRunTool;
