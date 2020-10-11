const mongoose = require("mongoose");

const IncomeSchema = mongoose.Schema({
  date: Date,
  year: Number,
  month: Number,
  day: Number,
  amount: Number,
  userName: String,
});

module.exports = mongoose.model("Income", IncomeSchema);
