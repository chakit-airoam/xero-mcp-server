import { listXeroPayrollAuSuperfunds } from "../../handlers/list-xero-payroll-au-superfunds.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const ListPayrollAuSuperfundsTool = CreateXeroTool(
  "list-payroll-au-superfunds",
  "List Payroll AU superfund records already configured in Xero, including the internal superFundID needed for employee super memberships.",
  {},
  async () => {
    const response = await listXeroPayrollAuSuperfunds();

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error listing Payroll AU superfunds: ${response.error}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${response.result?.length ?? 0} Payroll AU superfunds:`,
        },
        ...(response.result?.map((superfund) => ({
          type: "text" as const,
          text: [
            `Super Fund ID: ${superfund.superFundID}`,
            superfund.name ? `Name: ${superfund.name}` : null,
            superfund.aBN ? `ABN: ${superfund.aBN}` : null,
            superfund.uSI ? `USI: ${superfund.uSI}` : null,
            superfund.type ? `Type: ${superfund.type}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
        })) ?? []),
      ],
    };
  },
);

export default ListPayrollAuSuperfundsTool;
