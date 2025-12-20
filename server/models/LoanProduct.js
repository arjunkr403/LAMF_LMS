import mongoose from "mongoose";

const loanProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["EQUITY", "DEBT", "HYBRID"],
      required: true,
    },
    maxLTV: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      description: "Maximum Loan-to-Value percentage (e.g., 50 for 50%)",
    },
    interestRate: {
      type: Number,
      required: true,
      description: "Annual Interest Rate Percentage",
    },
    minLoanAmount: {
      type: Number,
      required: true,
    },
    maxLoanAmount: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("LoanProduct", loanProductSchema);
