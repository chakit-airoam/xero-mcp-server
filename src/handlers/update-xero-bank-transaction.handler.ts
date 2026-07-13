import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";
import { BankTransaction, LineAmountTypes, LineItem, LineItemTracking } from "xero-node";

interface BankTransactionLineItem {
  lineItemID?: string;
  description: string;
  quantity: number;
  unitAmount: number;
  accountCode: string;
  taxType: string;
  tracking?: LineItemTracking[];
}

type BankTransactionType = "RECEIVE" | "SPEND";
type BankTransactionLineAmountTypes = "Exclusive" | "Inclusive" | "NoTax";

function editableLineItems(lineItems: Array<BankTransactionLineItem | LineItem> = []): LineItem[] {
  return lineItems.map((lineItem) => ({
    lineItemID: lineItem.lineItemID,
    description: lineItem.description,
    quantity: lineItem.quantity,
    unitAmount: lineItem.unitAmount,
    accountCode: lineItem.accountCode,
    taxType: lineItem.taxType,
    tracking: lineItem.tracking,
  }));
}

async function getBankTransaction(bankTransactionId: string): Promise<BankTransaction | undefined> {
  await xeroClient.authenticate();

  const response = await xeroClient.accountingApi.getBankTransaction(
    xeroClient.tenantId, // xeroTenantId
    bankTransactionId, // bankTransactionID
    undefined, // unitdp
    getClientHeaders() // options
  );

  return response.body.bankTransactions?.[0];
}

async function updateBankTransaction(
  bankTransactionId: string,
  existingBankTransaction: BankTransaction,
  type?: BankTransactionType,
  contactId?: string,
  lineItems?: BankTransactionLineItem[],
  lineAmountTypes?: BankTransactionLineAmountTypes,
  reference?: string,
  date?: string
): Promise<BankTransaction | undefined> {
  const bankTransaction: BankTransaction = {
    bankTransactionID: bankTransactionId,
    type: type ? BankTransaction.TypeEnum[type] : existingBankTransaction.type,
    bankAccount: existingBankTransaction.bankAccount,
    contact: contactId ? { contactID: contactId } : existingBankTransaction.contact,
    lineItems: editableLineItems(lineItems ?? existingBankTransaction.lineItems),
    lineAmountTypes: lineAmountTypes
      ? LineAmountTypes[lineAmountTypes]
      : existingBankTransaction.lineAmountTypes,
    reference: reference ? reference : existingBankTransaction.reference,
    date: date ? date : existingBankTransaction.date,
    status: existingBankTransaction.status
  };

  const response = await xeroClient.accountingApi.updateBankTransaction(
    xeroClient.tenantId, // xeroTenantId
    bankTransactionId, // bankTransactionID
    { bankTransactions: [bankTransaction] }, // bankTransactions
    undefined, // unitdp
    undefined, // idempotencyKey
    getClientHeaders() // options
  );

  return response.body.bankTransactions?.[0];
}

export async function updateXeroBankTransaction(
  bankTransactionId: string,
  type?: BankTransactionType,
  contactId?: string,
  lineItems?: BankTransactionLineItem[],
  lineAmountTypes?: BankTransactionLineAmountTypes,
  reference?: string,
  date?: string
): Promise<XeroClientResponse<BankTransaction>> {
  try {
    const existingBankTransaction = await getBankTransaction(bankTransactionId);

    if (!existingBankTransaction) {
      throw new Error(`Could not find bank transaction`);
    }

    const updatedBankTransaction = await updateBankTransaction(
      bankTransactionId,
      existingBankTransaction,
      type,
      contactId,
      lineItems,
      lineAmountTypes,
      reference,
      date
    );

    if (!updatedBankTransaction) {
      throw new Error(`Failed to update bank transaction`);
    }

    return {
      result: updatedBankTransaction,
      isError: false,
      error: null
    };
  } catch (error) {
    return {
      result: null,
      isError: true,
      error: formatError(error),
    };
  }
}
