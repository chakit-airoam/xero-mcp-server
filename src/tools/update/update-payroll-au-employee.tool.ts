import { z } from "zod";
import { Employee } from "xero-node/dist/gen/model/payroll-au/employee.js";

import { updateXeroPayrollAuEmployee } from "../../handlers/update-xero-payroll-au-employee.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const homeAddressSchema = z.object({
  addressLine1: z.string().describe("Employee home address line 1."),
  addressLine2: z.string().optional().describe("Employee home address line 2."),
  city: z.string().optional().describe("Employee suburb/city."),
  region: z.enum(["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]).optional(),
  postalCode: z.string().optional().describe("Employee postcode."),
  country: z.string().optional().describe("Employee country, e.g. Australia."),
});

const bankAccountSchema = z.object({
  statementText: z.string().optional(),
  accountName: z.string().optional(),
  bSB: z.string().describe("BSB number."),
  accountNumber: z.string().describe("Bank account number."),
  remainder: z.boolean().optional().describe("Set true for the remaining pay account."),
  amount: z.number().optional(),
});

const taxDeclarationSchema = z.object({
  employmentBasis: z
    .enum(["FULLTIME", "PARTTIME", "CASUAL", "LABOURHIRE", "SUPERINCOMESTREAM", "NONEMPLOYEE"])
    .optional(),
  taxFileNumber: z.string().optional(),
  australianResidentForTaxPurposes: z.boolean().optional(),
  residencyStatus: z.enum(["AUSTRALIANRESIDENT", "FOREIGNRESIDENT", "WORKINGHOLIDAYMAKER"]).optional(),
  taxScaleType: z
    .enum([
      "REGULAR",
      "ACTORSARTISTSENTERTAINERS",
      "HORTICULTURISTORSHEARER",
      "SENIORORPENSIONER",
      "WORKINGHOLIDAYMAKER",
      "FOREIGN",
    ])
    .optional(),
  taxFreeThresholdClaimed: z.boolean().optional(),
  hasHELPDebt: z.boolean().optional(),
  hasSFSSDebt: z.boolean().optional(),
  hasTradeSupportLoanDebt: z.boolean().optional(),
  hasLoanOrStudentDebt: z.boolean().optional(),
});

const superMembershipSchema = z.object({
  superFundID: z.string().describe("Xero super fund ID. This is not the fund ABN."),
  employeeNumber: z.string().describe("Employee member number at the super fund."),
});

const payTemplateSchema = z.object({
  earningsLines: z
    .array(
      z.object({
        earningsRateID: z.string(),
        annualSalary: z.number().optional(),
        numberOfUnitsPerWeek: z.number().optional(),
        ratePerUnit: z.number().optional(),
      }),
    )
    .optional(),
});

const leaveLineSchema = z.object({
  leaveTypeID: z.string().optional().describe("Xero Payroll AU leave type ID."),
  calculationType: z
    .enum([
      "NOCALCULATIONREQUIRED",
      "FIXEDAMOUNTEACHPERIOD",
      "ENTERRATEINPAYTEMPLATE",
      "BASEDONORDINARYEARNINGS",
    ])
    .optional(),
  entitlementFinalPayPayoutType: z.enum(["NOTPAIDOUT", "PAIDOUT"]).optional(),
  employmentTerminationPaymentType: z.enum(["O", "R"]).optional(),
  includeSuperannuationGuaranteeContribution: z.boolean().optional(),
  numberOfUnits: z.number().optional(),
  annualNumberOfUnits: z.number().optional(),
  fullTimeNumberOfUnitsPerPeriod: z.number().optional(),
});

const UpdatePayrollAuEmployeeTool = CreateXeroTool(
  "update-payroll-au-employee",
  `Update an existing employee in Xero Payroll AU.
Use this for Australian payroll employees only. Send only the fields that need to change.`,
  {
    employeeID: z.string().describe("Xero employee ID."),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    dateOfBirth: z.string().optional().describe("Date of birth in YYYY-MM-DD format."),
    startDate: z.string().optional().describe("Employment start date in YYYY-MM-DD format."),
    email: z.string().email().optional(),
    gender: z.enum(["N", "M", "F", "I"]).optional(),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    jobTitle: z.string().optional(),
    classification: z.string().optional(),
    ordinaryEarningsRateID: z.string().optional(),
    payrollCalendarID: z.string().optional(),
    status: z.enum(["ACTIVE", "TERMINATED"]).optional(),
    terminationDate: z.string().optional().describe("Required when setting status to TERMINATED."),
    terminationReason: z.enum(["V", "I", "D", "R", "F", "C", "T"]).optional(),
    employeeGroupName: z.string().optional(),
    employmentType: z.enum(["EMPLOYEE", "CONTRACTOR"]).optional(),
    incomeType: z
      .enum(["SALARYANDWAGES", "WORKINGHOLIDAYMAKER", "NONEMPLOYEE", "CLOSELYHELDPAYEES", "LABOURHIRE"])
      .optional(),
    countryOfResidence: z.string().optional().describe("ISO 3166-1 alpha-2 country code, e.g. AU."),
    homeAddress: homeAddressSchema.optional(),
    bankAccounts: z.array(bankAccountSchema).optional(),
    taxDeclaration: taxDeclarationSchema.optional(),
    superMemberships: z.array(superMembershipSchema).optional(),
    payTemplate: payTemplateSchema.optional(),
    leaveLines: z.array(leaveLineSchema).optional(),
  },
  async ({ employeeID, ...employee }) => {
    const response = await updateXeroPayrollAuEmployee(employeeID, employee as Employee);

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error updating Payroll AU employee: ${response.error}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Payroll AU employee updated: ${response.result?.employeeID ?? employeeID}`,
        },
      ],
    };
  },
);

export default UpdatePayrollAuEmployeeTool;
