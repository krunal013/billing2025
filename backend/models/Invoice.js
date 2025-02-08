const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  invoiceid: { type: String, required: true },
  invoice_date: { type: Date, required: true },
  invoice_number: { type: String, unique: true },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  }, // Reference to Company
  ProfessionalFees: [
    {
      description: { type: String, required: true },
      amount: { type: Number, required: true },
    },  
  ],
  ReimbursementExpenses: [
    {
      description: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
  ProfessionalFees_total: { type: Number, required: true },
  ReimbursementExpenses_total: { type: Number, required: true },
  unpaid_ProfessionalFees: { type: Number, default: 0 },
  unpaid_ReimbursementExpenses: { type: Number, default: 0 },
  TotalAmount: { type: Number, required: true },
  isPaid: {
    type: Boolean,
    default: false,
  },
  due_amount: {
    type: Number,
    default: function () {
      return (
        (this.ProfessionalFees_total ?? 0) +
        (this.ReimbursementExpenses_total ?? 0)
      );
    },
  },
  pdfFile: {
    type: Buffer,
    required: false,
  },
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
