import { z } from "zod";
import { PayslipLines } from "xero-node/dist/gen/model/payroll-au/payslipLines.js";

import { updateXeroPayrollAuPayslip } from "../../handlers/update-xero-payroll-au-payslip.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const earningsLineSchema = z.object({
  earningsRateID: z.string(),
  calculationType: z.enum(["USEEARNINGSRATE", "ENTEREARNINGSRATE", "ANNUALSALARY"]).optional(),
  annualSalary: z.number().optional(),
  numberOfUnitsPerWeek: z.number().optional(),
  ratePerUnit: z.number().optional(),
  normalNumberOfUnits: z.number().optional(),
  amount: z.number().optional(),
  numberOfUnits: z.number().optional(),
  fixedAmount: z.number().optional(),
});

const UpdatePayrollAuPayslipTool = CreateXeroTool(
  "update-payroll-au-payslip",
  `Update line arrays on a payslip in a DRAFT Xero Payroll AU pay run only.
Retrieve the payslip first. Any provided line array replaces that entire array; include every line that must remain. This tool cannot post, pay, file, or finalise a pay run.`,
  {
    payslipID: z.string().describe("Xero Payroll AU payslip ID."),
    earningsLines: z.array(earningsLineSchema).optional(),
    leaveEarningsLines: z.array(z.object({
      earningsRateID: z.string().optional(), ratePerUnit: z.number().optional(), numberOfUnits: z.number().optional(),
      payOutType: z.enum(["DEFAULT", "CASHEDOUT"]).optional(),
    })).optional(),
    timesheetEarningsLines: z.array(earningsLineSchema).optional(),
    deductionLines: z.array(z.object({
      deductionTypeID: z.string(), calculationType: z.enum(["FIXEDAMOUNT", "PRETAX", "POSTTAX"]).optional(),
      amount: z.number().optional(), percentage: z.number().optional(), numberOfUnits: z.number().optional(),
    })).optional(),
    leaveAccrualLines: z.array(z.object({
      leaveTypeID: z.string().optional(), numberOfUnits: z.number().optional(), autoCalculate: z.boolean().optional(),
    })).optional(),
    reimbursementLines: z.array(z.object({
      reimbursementTypeID: z.string().optional(), amount: z.number().optional(), description: z.string().max(50).optional(), expenseAccount: z.string().optional(),
    })).optional(),
    superannuationLines: z.array(z.object({
      superMembershipID: z.string().optional(), contributionType: z.enum(["SGC", "SALARYSACRIFICE", "EMPLOYERADDITIONAL", "EMPLOYEE"]).optional(),
      calculationType: z.enum(["FIXEDAMOUNT", "PERCENTAGEOFEARNINGS", "STATUTORY"]).optional(), minimumMonthlyEarnings: z.number().optional(),
      expenseAccountCode: z.string().optional(), liabilityAccountCode: z.string().optional(), paymentDateForThisPeriod: z.string().optional(),
      percentage: z.number().optional(), amount: z.number().optional(),
    })).optional(),
    taxLines: z.array(z.object({
      payslipTaxLineID: z.string().optional(), amount: z.number().optional(), taxTypeName: z.string().optional(), description: z.string().optional(),
      manualTaxType: z.enum(["PAYGMANUAL", "ETPOMANUAL", "ETPRMANUAL", "SCHEDULE5MANUAL", "SCHEDULE5STSLMANUAL", "SCHEDULE4MANUAL"]).optional(),
      liabilityAccount: z.string().optional(),
    })).optional(),
  },
  async ({ payslipID, ...payslipLines }) => {
    if (Object.keys(payslipLines).length === 0) {
      return { content: [{ type: "text" as const, text: "Provide at least one complete payslip line array to update." }] };
    }

    const response = await updateXeroPayrollAuPayslip(payslipID, payslipLines as PayslipLines);

    if (response.isError) {
      return { content: [{ type: "text" as const, text: `Error updating Payroll AU payslip: ${response.error}` }] };
    }

    return { content: [{ type: "text" as const, text: JSON.stringify(response.result, null, 2) }] };
  },
);

export default UpdatePayrollAuPayslipTool;
