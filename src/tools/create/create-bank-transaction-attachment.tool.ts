import { z } from "zod";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";
import { createXeroBankTransactionAttachment } from "../../handlers/create-xero-bank-transaction-attachment.handler.js";

const CreateBankTransactionAttachmentTool = CreateXeroTool(
  "create-bank-transaction-attachment",
  "Attach a local file to an existing Xero bank transaction. Use this after creating a spend-money bank transaction when the original receipt or invoice file is available on disk.",
  {
    bankTransactionId: z.string(),
    filePath: z.string().describe("Absolute local path to the receipt, invoice, or other attachment file."),
    fileName: z.string().optional().describe("Optional attachment filename to use in Xero. Defaults to the basename of filePath."),
    contentType: z.string().optional().describe("Optional MIME type such as image/jpeg, image/png, or application/pdf."),
  },
  async ({ bankTransactionId, filePath, fileName, contentType }) => {
    const result = await createXeroBankTransactionAttachment(
      bankTransactionId,
      filePath,
      fileName,
      contentType
    );

    if (result.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error creating bank transaction attachment: ${result.error}`,
          },
        ],
      };
    }

    const attachments = result.result.attachments || [];

    return {
      content: [
        {
          type: "text" as const,
          text: [
            "Bank transaction attachment created successfully.",
            `Bank transaction ID: ${bankTransactionId}`,
            `File name: ${fileName || filePath.split("/").pop()}`,
            `Attachment count returned: ${attachments.length}`,
          ].join("\n"),
        },
      ],
    };
  }
);

export default CreateBankTransactionAttachmentTool;
