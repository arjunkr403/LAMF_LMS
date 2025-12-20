import LoanApplication from "../models/LoanApplication.js";
import Collateral from "../models/Collateral.js";
import LoanProduct from "../models/LoanProduct.js";
import mongoose from "mongoose";

// @desc    Create a new loan application
// @route   POST /api/applications
// @access  Private
const createApplication = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, requestedLoanAmount, collateral } = req.body;

    // 1. Validate Product
    const product = await LoanProduct.findById(productId);
    if (!product) {
      throw new Error("Invalid Loan Product");
    }
    if (!product.isActive) {
      throw new Error("Loan Product is currently inactive");
    }

    // 2. Calculate Valuation & LTV
    let totalCollateralValue = 0;
    let totalLendingValue = 0;
    const collateralDocs = [];

    for (const item of collateral) {
      const itemTotalValue = item.units * item.currentNav;

      const appliedLTV = product.maxLTV;

      const itemLendingValue = itemTotalValue * (appliedLTV / 100);

      totalCollateralValue += itemTotalValue;
      totalLendingValue += itemLendingValue;

      collateralDocs.push({
        amcName: "Generic AMC", // Placeholder or from input
        schemeName: item.schemeName,
        isin: item.isin,
        category: item.category,
        unitsPledged: item.units,
        unitNav: item.currentNav,
        totalValue: itemTotalValue,
        ltvApplied: appliedLTV,
        lendingValue: itemLendingValue,
      });
    }

    // 3. LTV Check & Constraints
    if (requestedLoanAmount > totalLendingValue) {
      // Fail immediately if collateral is insufficient
      res.status(400).json({
        message: "Insufficient Collateral",
        eligibleAmount: totalLendingValue,
        requested: requestedLoanAmount,
      });
      await session.abortTransaction();
      return;
    }

    if (
      requestedLoanAmount < product.minLoanAmount ||
      requestedLoanAmount > product.maxLoanAmount
    ) {
      res.status(400).json({
        message: `Loan amount must be between ${product.minLoanAmount} and ${product.maxLoanAmount}`,
      });
      await session.abortTransaction();
      return;
    }

    // 4. Create Application
    const applicationId = `LAMF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const calculatedLTV = (requestedLoanAmount / totalCollateralValue) * 100;

    const application = new LoanApplication({
      applicationId,
      applicant: req.user._id,
      product: productId,
      requestedLoanAmount,
      totalCollateralValue,
      eligibleLoanAmount: totalLendingValue,
      calculatedLTV,
      status: "SUBMITTED",
      createdBy: req.user._id,
    });

    const createdApp = await application.save({ session });

    // 5. Create Collateral Records
    const collateralWithAppId = collateralDocs.map((doc) => ({
      ...doc,
      application: createdApp._id,
    }));

    await Collateral.insertMany(collateralWithAppId, { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: {
        _id: createdApp._id,
        applicationId: createdApp.applicationId,
        status: createdApp.status,
        eligibleLoanAmount: totalLendingValue,
        calculatedLTV,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(500).json({
      message: error.message || "Server Error processing application",
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get user's applications
// @route   GET /api/applications
// @access  Private
const getMyApplications = async (req, res) => {
  const applications = await LoanApplication.find({ applicant: req.user._id })
    .populate("product", "name interestRate")
    .sort({ createdAt: -1 });
  res.json(applications);
};

// @desc    Get single application details
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res) => {
  const application = await LoanApplication.findById(req.params.id)
    .populate("product")
    .populate("applicant", "profile email");

  if (application) {
    // Ensure user owns this application or is admin/partner
    if (
      application.applicant._id.toString() !== req.user._id.toString() &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Fetch associated collateral
    const collateral = await Collateral.find({ application: application._id });

    res.json({ ...application.toObject(), collateral });
  } else {
    res.status(404).json({ message: "Application not found" });
  }
};

// @desc    Get all applications (Admin)
// @route   GET /api/applications/admin/all
// @access  Private/Admin
const getAllApplications = async (req, res) => {
  const applications = await LoanApplication.find({})
    .populate("applicant", "profile email")
    .populate("product", "name")
    .sort({ createdAt: -1 });
  res.json(applications);
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;

  const application = await LoanApplication.findById(req.params.id);

  if (application) {
    application.status = status;
    const updatedApplication = await application.save();
    res.json(updatedApplication);
  } else {
    res.status(404).json({ message: "Application not found" });
  }
};

export {
  createApplication,
  getMyApplications,
  getApplicationById,
  getAllApplications,
  updateApplicationStatus,
};
