import mongoose from "mongoose";

const collateralSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
      required: true,
    },
    amcName: {
      type: String,
      required: true,
    },
    schemeName: {
      type: String,
      required: true,
    },
    isin: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["EQUITY", "DEBT", "LIQUID", "HYBRID"],
      required: true,
    },
    unitsPledged: {
      type: Number,
      required: true,
    },
    unitNav: {
      type: Number,
      required: true,
    },
    totalValue: {
      type: Number,
      required: true,
    },
    ltvApplied: {
      type: Number,
      required: true,
    },
    lendingValue: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Collateral", collateralSchema);
