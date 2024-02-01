const mongoose = require("mongoose");

const employeeSchema = mongoose.Schema({
  employeeID: String,
  firstName: String,
  lastName: String,
  email: String,
  dob: String,
});

const EmployeeModel = mongoose.model("", employeeSchema, "bio");
module.exports = EmployeeModel;
