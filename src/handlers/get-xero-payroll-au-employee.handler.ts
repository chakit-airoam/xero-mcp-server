import { Employee } from "xero-node/dist/gen/model/payroll-au/employee.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

async function getPayrollAuEmployee(employeeID: string): Promise<Employee | null> {
  await xeroClient.authenticate();

  const response = await xeroClient.payrollAUApi.getEmployee(
    xeroClient.tenantId,
    employeeID,
    getClientHeaders(),
  );

  return response.body.employees?.[0] ?? null;
}

export async function getXeroPayrollAuEmployee(
  employeeID: string,
): Promise<XeroClientResponse<Employee | null>> {
  try {
    const employee = await getPayrollAuEmployee(employeeID);

    return {
      result: employee,
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
