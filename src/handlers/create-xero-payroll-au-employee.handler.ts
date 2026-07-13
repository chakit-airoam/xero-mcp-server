import { Employee } from "xero-node/dist/gen/model/payroll-au/employee.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

async function createPayrollAuEmployee(employee: Employee): Promise<Employee | null> {
  await xeroClient.authenticate();

  const response = await xeroClient.payrollAUApi.createEmployee(
    xeroClient.tenantId,
    [employee],
    undefined,
    getClientHeaders(),
  );

  return response.body.employees?.[0] ?? null;
}

export async function createXeroPayrollAuEmployee(
  employee: Employee,
): Promise<XeroClientResponse<Employee | null>> {
  try {
    const newEmployee = await createPayrollAuEmployee(employee);

    return {
      result: newEmployee,
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
