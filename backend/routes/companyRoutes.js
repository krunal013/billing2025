const express = require("express");
const Company = require("../models/Company");
const Invoice = require("../models/Invoice");
const router = express.Router();

// Add a new company
// Add a new company

// Fetch all companies
router.get("/", async (req, res) => {
  try {
    const companies = await Company.find(); // Fetch all companies from the database
    res.status(200).json(companies); // Return the company list as a JSON response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

router.post("/add", async (req, res) => {
  console.log(req.body); // Log the incoming data
  try {
    const newCompany = new Company(req.body);
    const savedCompany = await newCompany.save();
    res.status(201).json(savedCompany);
  } catch (error) {
    console.error(error); // Log the error to understand it better
    res.status(400).json({ error: error.message });
  }
});
// Fetch a single company by ID
router.get("/:id", async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate("invoices");
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Calculate total payable amount, due amount, and total number of invoices
    const totalPayableAmount = company.invoices.reduce((total, invoice) => {
      const amount = invoice.TotalAmount || 0; // Ensure we use the correct field for amount
      return total + amount;
    }, 0);

    const dueAmount = company.invoices.reduce((total, invoice) => {
      const dueAmount = invoice.due_amount || 0; // Ensure we use the correct field for due_amount
      return total + (invoice.isPaid ? 0 : dueAmount);
    }, 0);

    const totalInvoices = company.invoices.length;

    res.status(200).json({
      company,
      totalPayableAmount,
      dueAmount,
      totalInvoices,
    });

    console.log(totalPayableAmount); // Debugging
    console.log(dueAmount); // Debugging
    console.log(totalInvoices); // Debugging
  } catch (err) {
    res.status(500).json({ message: "Error fetching company details" });
  }
});
router.get("/profile/:id", async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate("invoices");
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Calculate total payable amount, due amount, and total number of invoices
    const totalPayableAmount = company.invoices.reduce((total, invoice) => {
      const amount = invoice.TotalAmount || 0; // Ensure we use the correct field for amount
      return total + amount;
    }, 0);

    const dueAmount = company.invoices.reduce((total, invoice) => {
      const dueAmount = invoice.due_amount || 0; // Ensure we use the correct field for due_amount
      return total + (invoice.isPaid ? 0 : dueAmount);
    }, 0);

    const totalInvoices = company.invoices.length;

    res.status(200).json({
      company,
      totalPayableAmount,
      dueAmount,
      totalInvoices,
    });
    console.log("profile validation");
    console.log(totalPayableAmount); // Debugging
    console.log(dueAmount); // Debugging
    console.log(totalInvoices); // Debugging
  } catch (err) {
    res.status(500).json({ message: "Error fetching company details" });
  }
});

// Endpoint to fetch all companies
router.get("/get", async (req, res) => {
  try {
    const companies = await Company.find({}, "companyName"); // Fetch only companyName and _id
    res.status(200).json(companies);
  } catch (err) {
    res.status(500).json({ message: "Error fetching companies" });
  }
});

// Endpoint to fetch details of a specific company by ID
router.get("/:id", async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate("invoices");
    console.log(company); // Log the populated company object
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.status(200).json(company);
  } catch (err) {
    res.status(500).json({ message: "Error fetching company details" });
  }
});

router.put("/updatecomp/:id", async (req, res) => {
  const companyId = req.params.id;
  const {
    companyName,
    address,
    gstNumber,
    cinNumber,
    panNumber,
    contactPerson,
    contactNumber,
    alternateNumber,
    email,
  } = req.body;

  try {
    // Find the company by ID
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Update the company's details
    company.companyName = companyName;
    company.address = address;
    company.gstNumber = gstNumber;
    company.cinNumber = cinNumber;
    company.panNumber = panNumber;
    company.contactPerson = contactPerson;
    company.contactNumber = contactNumber;
    company.alternateNumber = alternateNumber;
    company.email = email;

    // Save the updated company
    await company.save();
    res.status(200).json(company);
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCompany = await Company.findByIdAndDelete(id);

    if (!deletedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
