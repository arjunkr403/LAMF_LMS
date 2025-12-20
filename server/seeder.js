import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import LoanProduct from "./models/LoanProduct.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await LoanProduct.deleteMany();
    await User.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    const adminUser = await User.create({
      email: "admin@lamf.com",
      passwordHash: passwordHash,
      role: "ADMIN",
      profile: {
        firstName: "System",
        lastName: "Admin",
        panCard: "ABCDE1234F",
        phone: "9999999999",
      },
    });

    await User.deleteMany({ email: "admin@lamf.com" }); // Cleanup if partial

    const admin = new User({
      email: "admin@lamf.com",
      passwordHash: "password123", // Will be hashed by pre-save
      role: "ADMIN",
      profile: {
        firstName: "System",
        lastName: "Admin",
        panCard: "ABCDE1234F",
        phone: "9999999999",
      },
    });
    await admin.save();

    const borrower = new User({
      email: "user@example.com",
      passwordHash: "password123",
      role: "BORROWER",
      profile: {
        firstName: "John",
        lastName: "Doe",
        panCard: "ABCDE5678G",
        phone: "8888888888",
      },
    });
    await borrower.save();

    const products = [
      {
        name: "Standard Equity LAMF",
        type: "EQUITY",
        maxLTV: 50,
        interestRate: 10.5,
        minLoanAmount: 25000,
        maxLoanAmount: 5000000,
      },
      {
        name: "Bluechip Debt Advantage",
        type: "DEBT",
        maxLTV: 80,
        interestRate: 8.5,
        minLoanAmount: 50000,
        maxLoanAmount: 10000000,
      },
      {
        name: "Hybrid Flexi Loan",
        type: "HYBRID",
        maxLTV: 65,
        interestRate: 9.75,
        minLoanAmount: 25000,
        maxLoanAmount: 7500000,
      },
    ];

    await LoanProduct.insertMany(products);

    console.log("Data Imported!");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
