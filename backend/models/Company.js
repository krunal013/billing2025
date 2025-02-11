const mongoose = require("mongoose");
const Invoice = require("./Invoice");

const companySchema = mongoose.Schema(
  { 
    companyName: { type: String, required: true },
    address: { type: String, required: true },
    gstNumber: { type: String, required: true },
    cinNumber: { type: String, required: true },
    panNumber: { type: String, required: true },
    contactPerson: { type: String, required: true },
    contactNumber: { type: String, required: true },
    alternateNumber: { type: String },
    email: { type: String, required: true },
    description: { type: String },
    invoices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
