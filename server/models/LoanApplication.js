import mongoose from "mongoose";

const loanApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanProduct",
      required: true,
    },
    requestedLoanAmount: {
      type: Number,
      required: true,
    },
    totalCollateralValue: {
      type: Number,
      required: true,
    },
    eligibleLoanAmount: {
      type: Number,
      required: true,
    },
    calculatedLTV: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "SUBMITTED",
        "UNDER_REVIEW",
        "APPROVED",
        "REJECTED",
        "DISBURSED",
      ],
      default: "DRAFT",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("LoanApplication", loanApplicationSchema);
