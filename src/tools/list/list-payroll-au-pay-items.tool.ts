import { listXeroPayrollAuPayItems } from "../../handlers/list-xero-payroll-au-pay-items.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const ListPayrollAuPayItemsTool = CreateXeroTool(
  "list-payroll-au-pay-items",
  "List Payroll AU pay items in Xero. Use this to find ordinary earnings rate IDs before creating or updating an AU employee or timesheet.",
  {},
  async () => {
    const response = await listXeroPayrollAuPayItems();

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error listing Payroll AU pay items: ${response.error}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response.result ?? {}, null, 2),
        },
      ],
    };
  },
);

export default ListPayrollAuPayItemsTool;
