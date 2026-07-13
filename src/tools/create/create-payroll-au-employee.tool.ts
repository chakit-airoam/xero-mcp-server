import { z } from "zod";
import { Employee } from "xero-node/dist/gen/model/payroll-au/employee.js";

import { createXeroPayrollAuEmployee } from "../../handlers/create-xero-payroll-au-employee.handler.js";
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

const CreatePayrollAuEmployeeTool = CreateXeroTool(
  "create-payroll-au-employee",
  `Create a new employee in Xero Payroll AU.
Use this for Australian payroll employees only. Required fields are firstName, lastName, and dateOfBirth. Use list-payroll-au-calendars and list-payroll-au-pay-items first when payrollCalendarID or ordinaryEarningsRateID are not known.`,
  {
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.string().describe("Date of birth in YYYY-MM-DD format."),
    startDate: z.string().optional().describe("Employment start date in YYYY-MM-DD format."),
    title: z.string().optional(),
    middleNames: z.string().optional(),
    email: z.string().email().optional(),
    gender: z.enum(["N", "M", "F", "I"]).optional(),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    jobTitle: z.string().optional(),
    classification: z.string().optional(),
    ordinaryEarningsRateID: z.string().optional(),
    payrollCalendarID: z.string().optional(),
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
  },
  async (employee) => {
    const response = await createXeroPayrollAuEmployee(employee as Employee);

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error creating Payroll AU employee: ${response.error}`,
          },
        ],
      };
    }

    const createdEmployee = response.result;

    return {
      content: [
        {
          type: "text" as const,
          text: [
            "Payroll AU employee created.",
            createdEmployee?.employeeID ? `Employee ID: ${createdEmployee.employeeID}` : null,
            createdEmployee?.firstName && createdEmployee?.lastName
              ? `Name: ${createdEmployee.firstName} ${createdEmployee.lastName}`
              : null,
            createdEmployee?.email ? `Email: ${createdEmployee.email}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
    };
  },
);

export default CreatePayrollAuEmployeeTool;
