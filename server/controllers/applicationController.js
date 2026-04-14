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

    // Validation
    if (!productId || !requestedLoanAmount || !collateral || collateral.length === 0) {
      return res.status(400).json({ message: "productId, requestedLoanAmount, and at least one collateral entry are required." });
    }
    if (isNaN(requestedLoanAmount) || requestedLoanAmount <= 0) {
      return res.status(400).json({ message: "requestedLoanAmount must be a positive number." });
    }

    for (const item of collateral) {
      if (!item.schemeName || !item.isin || !item.units || !item.currentNav) {
        return res.status(400).json({ message: "Each collateral must have schemeName, isin, units, and currentNav." });
      }
      if (item.units <= 0 || item.currentNav <= 0) {
        return res.status(400).json({ message: "Collateral units and NAV must be positive values." });
      }
    }

    const product = await LoanProduct.findById(productId);
    if (!product) return res.status(404).json({ message: "Loan product not found." });
    if (!product.isActive) return res.status(400).json({ message: "Selected loan product is currently inactive." });

    // Calculate collateral value
    let totalCollateralValue = 0;
    let totalLendingValue = 0;
    const collateralDocs = [];

    for (const item of collateral) {
      const itemTotalValue = item.units * item.currentNav;
      const itemLendingValue = itemTotalValue * (product.maxLTV / 100);
      totalCollateralValue += itemTotalValue;
      totalLendingValue += itemLendingValue;

      collateralDocs.push({
        amcName: item.amcName || "N/A",
        schemeName: item.schemeName,
        isin: item.isin.toUpperCase(),
        category: item.category || "EQUITY",
        unitsPledged: item.units,
        unitNav: item.currentNav,
        totalValue: itemTotalValue,
        ltvApplied: product.maxLTV,
        lendingValue: itemLendingValue,
      });
    }

    if (requestedLoanAmount > totalLendingValue) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Insufficient collateral for requested loan amount.",
        eligibleAmount: totalLendingValue,
        requested: requestedLoanAmount,
      });
    }

    if (requestedLoanAmount < product.minLoanAmount || requestedLoanAmount > product.maxLoanAmount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Loan amount must be between ₹${product.minLoanAmount.toLocaleString()} and ₹${product.maxLoanAmount.toLocaleString()}.`,
      });
    }

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
    await Collateral.insertMany(
      collateralDocs.map((doc) => ({ ...doc, application: createdApp._id })),
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: {
        _id: createdApp._id,
        applicationId: createdApp.applicationId,
        status: createdApp.status,
        eligibleLoanAmount: totalLendingValue,
        calculatedLTV: calculatedLTV.toFixed(2),
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("createApplication error:", error);
    res.status(500).json({ message: error.message || "Server error while processing application." });
  } finally {
    session.endSession();
  }
};

// @desc    Get logged-in user's applications
// @route   GET /api/applications
// @access  Private
const getMyApplications = async (req, res) => {
  try {
    const applications = await LoanApplication.find({ applicant: req.user._id })
      .populate("product", "name interestRate type")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applications." });
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res) => {
  try {
    const application = await LoanApplication.findById(req.params.id)
      .populate("product")
      .populate("applicant", "profile email");

    if (!application) return res.status(404).json({ message: "Application not found." });

    if (
      application.applicant._id.toString() !== req.user._id.toString() &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({ message: "Not authorized to view this application." });
    }

    const collateral = await Collateral.find({ application: application._id });
    res.json({ ...application.toObject(), collateral });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch application details." });
  }
};

// @desc    Get all applications (Admin)
// @route   GET /api/applications/admin/all
// @access  Private/Admin
const getAllApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== "ALL" ? { status } : {};

    const applications = await LoanApplication.find(filter)
      .populate("applicant", "profile email")
      .populate("product", "name type")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all applications." });
  }
};

// @desc    Update application status (Admin)
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const validStatuses = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "DISBURSED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const application = await LoanApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found." });

    application.status = status;
    if (remarks) application.adminRemarks = remarks;
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();

    const updated = await application.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status." });
  }
};

export {
  createApplication,
  getMyApplications,
  getApplicationById,
  getAllApplications,
  updateApplicationStatus,
};
