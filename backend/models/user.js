const mongoose = require("mongoose");
const { Schema } = mongoose;

const expenseSchema = new Schema(
  {
    description: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: true }
); // Prevents MongoDB from automatically generating _id for subdocuments

const UserSchema = new Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String },
  isAdmin: { type: Boolean, default: false },
  professionalfees: {
    type: [expenseSchema],
    default: [],
  },
  riembursementfees: {
    type: [expenseSchema],
    default: [],
  },
});

module.exports = mongoose.model("User", UserSchema);
