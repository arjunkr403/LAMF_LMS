import dotenv from "dotenv";
import connectDB from "./config/db.js";
import LoanProduct from "./models/LoanProduct.js";
import User from "./models/User.js";
import LoanApplication from "./models/LoanApplication.js";
import Collateral from "./models/Collateral.js";

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await Collateral.deleteMany();
    await LoanApplication.deleteMany();
    await LoanProduct.deleteMany();
    await User.deleteMany();
    console.log("Cleared existing data...");

    // --- USERS ---
    const admin = new User({ email: "admin@lamf.com", passwordHash: "password123", role: "ADMIN", profile: { firstName: "Priya", lastName: "Sharma", panCard: "ABCPS1234F", phone: "9999999999" } });
    await admin.save();

    const borrower1 = new User({ email: "rahul.verma@example.com", passwordHash: "password123", role: "BORROWER", profile: { firstName: "Rahul", lastName: "Verma", panCard: "BRVRA5678G", phone: "9876543210" } });
    await borrower1.save();

    const borrower2 = new User({ email: "anita.patel@example.com", passwordHash: "password123", role: "BORROWER", profile: { firstName: "Anita", lastName: "Patel", panCard: "CPAT6789H", phone: "8765432109" } });
    await borrower2.save();

    const borrower3 = new User({ email: "suresh.nair@example.com", passwordHash: "password123", role: "BORROWER", profile: { firstName: "Suresh", lastName: "Nair", panCard: "SNAIK9012J", phone: "7654321098" } });
    await borrower3.save();

    console.log("Users created...");

    // --- PRODUCTS (6 realistic LAMF products) ---
    const products = await LoanProduct.insertMany([
      {
        name: "Standard Equity LAMF",
        type: "EQUITY",
        maxLTV: 50,
        interestRate: 10.5,
        minLoanAmount: 25000,
        maxLoanAmount: 5000000,
        isActive: true,
      },
      {
        name: "Bluechip Debt Advantage",
        type: "DEBT",
        maxLTV: 80,
        interestRate: 8.5,
        minLoanAmount: 50000,
        maxLoanAmount: 10000000,
        isActive: true,
      },
      {
        name: "Hybrid Flexi Loan",
        type: "HYBRID",
        maxLTV: 65,
        interestRate: 9.75,
        minLoanAmount: 25000,
        maxLoanAmount: 7500000,
        isActive: true,
      },
      {
        name: "Nifty 50 Index Pledge",
        type: "EQUITY",
        maxLTV: 55,
        interestRate: 9.99,
        minLoanAmount: 50000,
        maxLoanAmount: 20000000,
        isActive: true,
      },
      {
        name: "Overnight & Liquid Fund Credit",
        type: "DEBT",
        maxLTV: 85,
        interestRate: 7.75,
        minLoanAmount: 100000,
        maxLoanAmount: 50000000,
        isActive: true,
      },
      {
        name: "Conservative Hybrid Secure",
        type: "HYBRID",
        maxLTV: 70,
        interestRate: 9.25,
        minLoanAmount: 30000,
        maxLoanAmount: 5000000,
        isActive: true,
      },
    ]);

    console.log("Products created...");

    // --- APPLICATIONS ---
    const ts = Date.now();
    const appData = [
      // Rahul - APPROVED
      {
        appFields: { applicationId: `LAMF-${ts}-001`, applicant: borrower1._id, product: products[0]._id, requestedLoanAmount: 200000, totalCollateralValue: 500000, eligibleLoanAmount: 250000, calculatedLTV: 40, status: "APPROVED", createdBy: borrower1._id, adminRemarks: "Collateral verified. LTV within limits." },
        collateral: [
          { amcName: "HDFC Mutual Fund", schemeName: "HDFC Top 100 Fund - Direct Growth", isin: "INF179K01VQ8", category: "EQUITY", unitsPledged: 1500, unitNav: 200, totalValue: 300000, ltvApplied: 50, lendingValue: 150000 },
          { amcName: "ICICI Prudential", schemeName: "ICICI Pru Bluechip Fund - Direct Growth", isin: "INF109K01Z13", category: "EQUITY", unitsPledged: 1000, unitNav: 200, totalValue: 200000, ltvApplied: 50, lendingValue: 100000 },
        ],
      },
      // Rahul - REJECTED
      {
        appFields: { applicationId: `LAMF-${ts}-002`, applicant: borrower1._id, product: products[2]._id, requestedLoanAmount: 350000, totalCollateralValue: 400000, eligibleLoanAmount: 260000, calculatedLTV: 87.5, status: "REJECTED", createdBy: borrower1._id, adminRemarks: "LTV exceeds permitted limit for hybrid category." },
        collateral: [
          { amcName: "SBI Mutual Fund", schemeName: "SBI Balanced Advantage Fund - Direct Growth", isin: "INF200K01LF2", category: "HYBRID", unitsPledged: 2000, unitNav: 200, totalValue: 400000, ltvApplied: 65, lendingValue: 260000 },
        ],
      },
      // Rahul - SUBMITTED (pending)
      {
        appFields: { applicationId: `LAMF-${ts}-003`, applicant: borrower1._id, product: products[1]._id, requestedLoanAmount: 500000, totalCollateralValue: 800000, eligibleLoanAmount: 640000, calculatedLTV: 62.5, status: "SUBMITTED", createdBy: borrower1._id },
        collateral: [
          { amcName: "Nippon India MF", schemeName: "Nippon India Liquid Fund - Direct Growth", isin: "INF204K01YV5", category: "DEBT", unitsPledged: 3000, unitNav: 160, totalValue: 480000, ltvApplied: 80, lendingValue: 384000 },
          { amcName: "Aditya Birla Sun Life", schemeName: "ABSL Corporate Bond Fund - Direct Growth", isin: "INF209K01UN9", category: "DEBT", unitsPledged: 2000, unitNav: 160, totalValue: 320000, ltvApplied: 80, lendingValue: 256000 },
        ],
      },
      // Anita - DISBURSED
      {
        appFields: { applicationId: `LAMF-${ts}-004`, applicant: borrower2._id, product: products[0]._id, requestedLoanAmount: 150000, totalCollateralValue: 400000, eligibleLoanAmount: 200000, calculatedLTV: 37.5, status: "DISBURSED", createdBy: borrower2._id, adminRemarks: "Loan disbursed to registered bank account." },
        collateral: [
          { amcName: "Axis Mutual Fund", schemeName: "Axis Bluechip Fund - Direct Growth", isin: "INF846K01EW2", category: "EQUITY", unitsPledged: 2500, unitNav: 160, totalValue: 400000, ltvApplied: 50, lendingValue: 200000 },
        ],
      },
      // Anita - UNDER_REVIEW
      {
        appFields: { applicationId: `LAMF-${ts}-005`, applicant: borrower2._id, product: products[3]._id, requestedLoanAmount: 600000, totalCollateralValue: 1200000, eligibleLoanAmount: 660000, calculatedLTV: 50, status: "UNDER_REVIEW", createdBy: borrower2._id },
        collateral: [
          { amcName: "Mirae Asset", schemeName: "Mirae Asset Large Cap Fund - Direct Growth", isin: "INF769K01DM0", category: "EQUITY", unitsPledged: 4000, unitNav: 200, totalValue: 800000, ltvApplied: 55, lendingValue: 440000 },
          { amcName: "Kotak Mahindra MF", schemeName: "Kotak Bluechip Fund - Direct Growth", isin: "INF174K01LS2", category: "EQUITY", unitsPledged: 2000, unitNav: 200, totalValue: 400000, ltvApplied: 55, lendingValue: 220000 },
        ],
      },
      // Suresh - SUBMITTED
      {
        appFields: { applicationId: `LAMF-${ts}-006`, applicant: borrower3._id, product: products[4]._id, requestedLoanAmount: 2000000, totalCollateralValue: 3000000, eligibleLoanAmount: 2550000, calculatedLTV: 66.7, status: "SUBMITTED", createdBy: borrower3._id },
        collateral: [
          { amcName: "DSP Mutual Fund", schemeName: "DSP Overnight Fund - Direct Growth", isin: "INF740K01RR1", category: "DEBT", unitsPledged: 15000, unitNav: 120, totalValue: 1800000, ltvApplied: 85, lendingValue: 1530000 },
          { amcName: "Franklin Templeton", schemeName: "Franklin India Ultra Short Bond - Direct", isin: "INF090I01JR6", category: "DEBT", unitsPledged: 10000, unitNav: 120, totalValue: 1200000, ltvApplied: 85, lendingValue: 1020000 },
        ],
      },
    ];

    for (const entry of appData) {
      const app = await LoanApplication.create(entry.appFields);
      await Collateral.insertMany(entry.collateral.map(c => ({ ...c, application: app._id })));
    }

    console.log("Applications & collateral created...");
    console.log("\n✅ Data Seeded Successfully!");
    console.log("------------------------------------------");
    console.log("Admin:     admin@lamf.com              / password123");
    console.log("Borrower1: rahul.verma@example.com     / password123");
    console.log("Borrower2: anita.patel@example.com     / password123");
    console.log("Borrower3: suresh.nair@example.com     / password123");
    console.log("------------------------------------------");
    console.log("Products:  6 loan products seeded");
    console.log("Apps:      6 applications across all statuses");
    process.exit();
  } catch (error) {
    console.error(`Seeder Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
