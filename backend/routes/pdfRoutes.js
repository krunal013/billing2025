const express = require("express");
const Invoice = require("../models/Invoice");
const Company = require("../models/Company");
const multer = require("multer");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit size to 5 MB
}).single("pdf");

router.post("/add_invoice", async (req, res) => {
  try {
    const {
      invoiceid,
      invoice_date,
      invoice_number,
      company_id,
      ProfessionalFees,
      ReimbursementExpenses,
      ProfessionalFees_total,
      ReimbursementExpenses_total,
      TotalAmount,
      pdfFile, // Get the PDF buffer from request body
    } = req.body;

    if (!company_id) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    // Find company in the database
    const company = await Company.findById(company_id);
    if (!company) {
      return res.status(400).json({ message: "Company not found" });
    }

    const invoiceData = {
      invoiceid,
      invoice_date,
      invoice_number,
      company: company_id,
      ProfessionalFees:
        typeof ProfessionalFees === "string"
          ? JSON.parse(ProfessionalFees)
          : ProfessionalFees,
      ReimbursementExpenses:
        typeof ReimbursementExpenses === "string"
          ? JSON.parse(ReimbursementExpenses)
          : ReimbursementExpenses,
      ProfessionalFees_total: parseFloat(ProfessionalFees_total || 0),
      ReimbursementExpenses_total: parseFloat(ReimbursementExpenses_total || 0),
      TotalAmount: parseFloat(TotalAmount || 0),
      pdfFile, // Save the PDF buffer directly
    };

    const newInvoice = new Invoice(invoiceData);
    const savedInvoice = await newInvoice.save();

    company.invoices.push(savedInvoice._id);
    await company.save();

    res.status(201).json({
      message: "Invoice saved successfully",
      savedInvoice,
    });
  } catch (error) {
    console.error("Error saving invoice:", error);
    res.status(500).json({ message: "Failed to save invoice", error });
  }
});

router.get("/get_invoice", (req, res) => {
  Invoice.find()
    .populate("company", "companyName") // Populate the company field, fetching only the name
    .then((invoices) => {
      res
        .status(200)
        .json({ message: "Invoices retrieved successfully", invoices });
    })
    .catch((error) => {
      console.error("Error retrieving invoices:", error);
      res
        .status(500)
        .json({ message: "Failed to retrieve invoices", error: error.message });
    });
});

router.get("/get_invoice_stats", async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-based
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const currentYear = new Date().getFullYear();
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Start and end of current month
    const currentMonthStart = new Date(currentYear, currentMonth - 1, 1);
    currentMonthStart.setHours(0, 0, 0, 0); // Set to start of the day

    const currentMonthEnd = new Date(currentYear, currentMonth, 1);
    currentMonthEnd.setHours(0, 0, 0, 0); // Set to start of next month

    // Start and end of previous month
    const previousMonthStart = new Date(previousYear, previousMonth - 1, 1);
    previousMonthStart.setHours(0, 0, 0, 0); // Set to start of previous month

    const previousMonthEnd = new Date(previousYear, previousMonth, 1);
    previousMonthEnd.setHours(0, 0, 0, 0); // Set to start of next previous month

    // Query to count invoices for current month using 'invoice_date'
    const currentMonthInvoices = await Invoice.countDocuments({
      invoice_date: { $gte: currentMonthStart, $lt: currentMonthEnd },
    });

    // Query to count invoices for previous month using 'invoice_date'
    const previousMonthInvoices = await Invoice.countDocuments({
      invoice_date: { $gte: previousMonthStart, $lt: previousMonthEnd },
    });

    res.status(200).json({
      message: "Invoice statistics retrieved successfully",
      data: {
        [new Date(currentMonthStart).toLocaleString("en-US", {
          month: "short",
        })]: currentMonthInvoices,
        [new Date(previousMonthStart).toLocaleString("en-US", {
          month: "short",
        })]: previousMonthInvoices,
      },
    });

    // Debugging logs to check the queries
    console.log(currentMonthInvoices);
    console.log(previousMonthInvoices);
    console.log("Current Month Query:", {
      $gte: currentMonthStart,
      $lt: currentMonthEnd,
    });
    console.log("Previous Month Query:", {
      $gte: previousMonthStart,
      $lt: previousMonthEnd,
    });
  } catch (error) {
    console.error("Error retrieving invoice stats:", error);
    res.status(500).json({
      message: "Failed to retrieve invoice statistics",
      error: error.message,
    });
  }
});

router.patch("/invoices/:id", async (req, res) => {
  const { id } = req.params;
  const { isPaid, unpaid_ProfessionalFees, unpaid_ReimbursementExpenses } =
    req.body;

  try {
    // Update the invoice with new values
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { isPaid, unpaid_ProfessionalFees, unpaid_ReimbursementExpenses },
      { new: true } // Returns the updated document
    );

    if (!updatedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Additional logic to calculate and update the due amount
    const invoice = await Invoice.findById(id).populate(
      "company",
      "companyName"
    );

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const totalAmount = invoice.TotalAmount || 0; // Ensure a default value
    const totalDue =
      (invoice.unpaid_ProfessionalFees || 0) +
      (invoice.unpaid_ReimbursementExpenses || 0); // Ensure default values for null/undefined
    const dueAmount = totalAmount - totalDue;

    invoice.due_amount = dueAmount;
    await invoice.save();

    // Respond with the updated invoice
    return res.status(200).json({
      message: "Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "Failed to update invoice" });
  }
});

router.get("/invoice-number", async (req, res) => {
  const currentYear = new Date().getFullYear();
  try {
    const latestInvoice = await Invoice.findOne({
      invoiceDate: { $regex: `^${currentYear}` },
    }).sort({ invoiceNumber: -1 });
    const nextInvoiceNumber = latestInvoice
      ? latestInvoice.invoiceNumber + 1
      : 1;
    res.json({ invoiceNumber: `${nextInvoiceNumber}/${currentYear}` });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching invoice number");
  }
});

router.put("/due/:id", async (req, res) => {
  const { id } = req.params; // Use the ID from the route parameter for clarity

  try {
    // Find the invoice by ID and populate the company field
    const invoice = await Invoice.findById(id).populate(
      "company",
      "companyName"
    );

    // Check if the invoice exists
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Calculate the due amount
    const totalAmount = invoice.TotalAmount || 0; // Ensure a default value
    const totalDue =
      (invoice.unpaid_ProfessionalFees || 0) +
      (invoice.unpaid_ReimbursementExpenses || 0); // Ensure default values for null/undefined
    const dueAmount = totalAmount - totalDue;

    // Update the invoice's due amount
    invoice.due_amount = dueAmount;
    await invoice.save();
    console.log("due amount is:" + due_amount);

    // Respond with the updated invoice
    return res.status(200).json({
      message: "Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    // Log error details for debugging
    console.error("Error updating invoice:", error);

    // Return a generic error message
    return res.status(500).json({
      error: "An error occurred while updating the invoice",
      details: error.message, // Include error details for debugging (optional)
    });
  }
});

router.get("/next-invoice/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    const nextInvoiceNumber = `${company.invoices.length + 1}/2025`;
    res.json({ nextInvoiceNumber });
  } catch (error) {
    console.error("Error fetching next invoice number:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/notifications", async (req, res) => {
  try {
    // Fetch unpaid invoices and populate company details
    const unpaidInvoices = await Invoice.find({ isPaid: false })
      .populate("company", "companyName email") // Populate company details
      .select("company due_amount"); // Select relevant fields

    // Map the data into a notification structure
    const notifications = unpaidInvoices.map((invoice) => ({
      companyName: invoice.company?.companyName || "Unknown Company",
      email: invoice.company?.email || "No Email Provided",
      dueAmount: invoice.due_amount ?? 0,
    }));
    console.log(notifications);

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/due_invoices_list", async (req, res) => {
  try {
    // Fetch invoices with due_amount greater than 0 and populate company details
    const invoices = await Invoice.find({ due_amount: { $gt: 0 } }).populate(
      "company",
      "companyName"
    );

    // Grouping invoices by company ID and summing up due amounts
    const companyDueMap = invoices.reduce((acc, invoice) => {
      const companyId = invoice.company
        ? invoice.company._id.toString()
        : "Unknown";
      const companyName = invoice.company
        ? invoice.company.companyName
        : "No company";

      if (!acc[companyId]) {
        acc[companyId] = { companyName, totalDueAmount: 0 };
      }

      acc[companyId].totalDueAmount += invoice.due_amount;
      return acc;
    }, {});

    // Convert grouped object to an array
    const formattedData = Object.values(companyDueMap);
    console.log("above is form data");
    console.log(formattedData);
    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).send("Server error");
  }
});

router.get("/total_due_amount", async (req, res) => {
  try {
    // Fetch all invoices
    const invoices = await Invoice.find();

    // Calculate the total due amount, ensuring all values are valid numbers
    const totalDueAmount = invoices.reduce((sum, invoice) => {
      const dueAmount = parseFloat(invoice.due_amount);
      // Only add if the value is a valid number
      return !isNaN(dueAmount) ? sum + dueAmount : sum;
    }, 0);

    res.json({ totalDueAmount });
    console.log(totalDueAmount);
  } catch (error) {
    console.error("Error fetching total due amount:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/latest_invoice", async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .select("company invoice_date TotalAmount due_amount")
      .populate("company", "companyName") // Fetch only company name
      .sort({ invoice_date: -1 }) // Sort by latest invoice date
      .limit(6); // Fetch only 6 records

    const formattedInvoices = invoices.map((invoice) => ({
      companyName: invoice.company.companyName,
      date: invoice.invoice_date,
      totalAmount: invoice.TotalAmount,
      dueAmount: invoice.due_amount,
    }));

    res.json({ invoices: formattedInvoices });
  } catch (error) {
    console.error("Error fetching latest invoices:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/invoice-summary", async (req, res) => {
  try {
    // Get total due amount (sum of all due_amount values)
    const totalDueAmount = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalDue: { $sum: "$due_amount" },
        },
      },
    ]);

    // Get total paid amount (sum of TotalAmount where due_amount is 0)
    const totalPaidAmount = await Invoice.aggregate([
      {
        $match: { due_amount: 0 },
      },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: "$TotalAmount" },
        },
      },
    ]);

    // Get each company name with their due amount
    const companyDueAmounts = await Invoice.aggregate([
      {
        $group: {
          _id: "$company",
          dueAmount: { $sum: "$due_amount" },
        },
      },
      {
        $lookup: {
          from: "companies", // Make sure collection name matches your MongoDB collection
          localField: "_id",
          foreignField: "_id",
          as: "companyDetails",
        },
      },
      {
        $unwind: "$companyDetails",
      },
      {
        $project: {
          companyName: "$companyDetails.companyName",
          dueAmount: 1,
        },
      },
    ]);
    console.log("chart 2 data ");
    console.log(totalDueAmount);
    console.log(totalPaidAmount);
    console.log(companyDueAmounts);

    res.json({
      totalDueAmount: totalDueAmount[0]?.totalDue || 0,
      totalPaidAmount: totalPaidAmount[0]?.totalPaid || 0,
      companyDueAmounts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/invoices/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Remove invoice reference from the associated company
    await Company.findByIdAndUpdate(invoice.company, {
      $pull: { invoices: invoice._id },
    });

    // Delete the invoice
    await Invoice.findByIdAndDelete(req.params.id);

    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update_invoice/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      invoiceid,
      invoice_date,
      invoice_number,
      company,
      ProfessionalFees,
      ReimbursementExpenses,
      ProfessionalFees_total,
      ReimbursementExpenses_total,
      TotalAmount,
      isPaid,
      pdfFile,
    } = req.body;

    // Find the invoice by ID and update it, excluding unpaid and due amount fields
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      {
        invoiceid,
        invoice_date,
        invoice_number,
        company,
        ProfessionalFees,
        ReimbursementExpenses,
        ProfessionalFees_total,
        ReimbursementExpenses_total,
        TotalAmount,
        isPaid,
        pdfFile,
        // unpaid_ProfessionalFees, unpaid_ReimbursementExpenses, and due_amount are excluded here
      },
      { new: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Send the updated invoice as the response
    res.status(200).json(updatedInvoice);
    console.log("done hai bhai");
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to get yearly summary
router.get("/invoice/summary/yearly/:year", async (req, res) => {
  try {
    const year = parseInt(req.params.year);

    const invoices = await Invoice.aggregate([
      {
        $match: {
          invoice_date: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
          },
        },
      },
      {
        $group: {
          _id: year,
          total_ProfessionalFees: { $sum: "$ProfessionalFees_total" },
          total_ReimbursementExpenses: { $sum: "$ReimbursementExpenses_total" },
          total_Amount: { $sum: "$TotalAmount" },
          total_due: { $sum: "$due_amount" },
        },
      },
    ]);

    // Logging for debugging
    console.log("Yearly Summary:", invoices);

    res.json({ year, summary: invoices.length > 0 ? invoices[0] : {} });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
});

// Route to get monthly summary for a given year
router.get("/invoice/summary/monthly/:year", async (req, res) => {
  try {
    const year = parseInt(req.params.year);

    const invoices = await Invoice.aggregate([
      {
        $match: {
          invoice_date: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$invoice_date" } },
          total_ProfessionalFees: { $sum: "$ProfessionalFees_total" },
          total_ReimbursementExpenses: { $sum: "$ReimbursementExpenses_total" },
          total_Amount: { $sum: "$TotalAmount" },
          total_due: { $sum: "$due_amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Logging for debugging
    console.log("Monthly Summary:", invoices);

    res.json({ year, monthlySummary: invoices });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
});

module.exports = router;
