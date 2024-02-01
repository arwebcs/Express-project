const express = require("express");
const app = express();
const authToken = require("../../shared/token");
const employeeModel = require("../../shared/models/employee.model");
const router = express.Router();

router.use(authToken);

app.get("/unauthorized", function (req, res) {
  res.send("Unauthorized");
});

router.get("/", function (req, res) {
  employeeModel
    .find({}, { __v: 0 })
    .then(function (FoundItems) {
      res.send({
        statusCode: 200,
        message: "Retrieved",
        records: FoundItems.length,
        data: FoundItems,
      });
    })
    .catch((e) => {
      result.send("err");
    });
});

router.get("/search", function (req, res) {
  const empID = req.query.empid;
  employeeModel
    .find({ _id: empID }, { __v: 0 })
    .then(function (FoundItems) {
      res.send({
        statusCode: 200,
        message: "Retrieved",
        records: FoundItems.length,
        data: FoundItems,
      });
    })
    .catch((e) => {
      result.send("err");
    });
});

router.post("/", function (req, res) {
  const employeeID = req.body.employeeID.trim();
  const firstName = req.body.firstName.trim();
  const lastName = req.body.lastName.trim();
  const email = req.body.email.trim();
  const dob = req.body.dob.trim();

  let newEmployee = new employeeModel({
    employeeID: employeeID,
    firstName: firstName,
    lastName: lastName,
    email: email,
    dob: dob,
  });

  newEmployee
    .save()
    .then(() => {
      res.status(201).send({
        statusCode: 201,
        message: "Saved successfully",
      });
    })
    .catch((e) => {
      res.status(500).send({
        statusCode: 500,
        message: e,
      });
    });
});

router.put("/:empid", function (req, res) {
  const employeeID = req.params.empid.trim();
  const firstName = req.body.firstName.trim();
  const lastName = req.body.lastName.trim();
  const email = req.body.email.trim();
  const dob = req.body.dob.trim();

  let newEmployee = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    dob: dob,
  };

  employeeModel
    .findByIdAndUpdate(employeeID, newEmployee)
    // or .updateOne({ employeeID: employeeID }, newEmployee)
    .then(() => {
      res.status(201).send({
        statusCode: 201,
        message: "Updated successfully",
      });
    })
    .catch((e) => {
      res.status(500).send({
        statusCode: 500,
        message: e,
      });
    });
});

router.delete("/", function (req, res) {
  const employeeID = req.query.id.trim();
  employeeModel
    .findByIdAndDelete(employeeID)
    // or .deleteOne({ employeeID: employeeID })
    .then(() => {
      res.status(201).send({
        statusCode: 201,
        message: "Deleted successfully",
      });
    })
    .catch((e) => {
      res.status(500).send({
        statusCode: 500,
        message: e,
      });
    });
});

app.use("/", router);

module.exports = app;
