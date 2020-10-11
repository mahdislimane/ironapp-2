const mongoose = require("mongoose");
const { stringify } = require("querystring");

const EmployeeSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  cin: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  rest: Number,
  salarys: [
    {
      salary: Number,
      year: Number,
      month: Number,
     
      avances: [
        {
          date: Date,
          year: Number,
          month: Number,
          amount: Number,
        },
      ],
    },
  ],
  endDate: {
    type: Date,
  },
});

module.exports = mongoose.model("Employee", EmployeeSchema);
