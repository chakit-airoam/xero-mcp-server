import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { xeroClient } from "../clients/xero-client.js";
import { XeroClientResponse } from "../types/tool-response.js";
import { Attachments } from "xero-node";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";

function inferContentType(fileName: string): string {
  const extension = path.extname(fileName).toLowerCase();

  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

async function createBankTransactionAttachment(
  bankTransactionId: string,
  filePath: string,
  fileName?: string,
  contentType?: string
): Promise<Attachments> {
  await xeroClient.authenticate();

  const attachmentFileName = fileName || path.basename(filePath);
  const attachmentContentType = contentType || inferContentType(attachmentFileName);
  const file = fs.createReadStream(filePath);

  const response = await xeroClient.accountingApi.updateBankTransactionAttachmentByFileName(
    xeroClient.tenantId,
    bankTransactionId,
    attachmentFileName,
    file,
    randomUUID(),
    {
      headers: {
        ...getClientHeaders().headers,
        "Content-Type": attachmentContentType,
      },
    }
  );

  return response.body;
}

export async function createXeroBankTransactionAttachment(
  bankTransactionId: string,
  filePath: string,
  fileName?: string,
  contentType?: string
): Promise<XeroClientResponse<Attachments>> {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Attachment file does not exist: ${filePath}`);
    }

    const attachments = await createBankTransactionAttachment(
      bankTransactionId,
      filePath,
      fileName,
      contentType
    );

    return {
      result: attachments,
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
