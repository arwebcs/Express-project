const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const authToken = require("../../shared/token");
const employeeModel = require("../../shared/models/employee.model");
const router = express.Router();
const mysqlConnection = require("../../shared/connections/mysql");
const multer = require("multer");
router.use(authToken);

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/images");
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
});

app.get("/unauthorized", function (req, res) {
  res.send("Unauthorized");
});

router.get("/", function (req, res) {
  const sql = "SELECT * FROM bio";
  mysqlConnection.query(sql, (error, data) => {
    if (error) {
      res
        .status(500)
        .send({ statusCode: 500, message: "Internal server error" });
    } else {
      if (data.length > 0) {
        res
          .status(200)
          .send({ statusCode: 200, message: "Records found", details: data });
      } else {
        res.status(400).send({ statusCode: 400, message: "No records found" });
      }
    }
  });
});

router.get("/search", function (req, res) {
  const studentID = req.query.id;
  const sql = "SELECT * FROM bio WHERE id=?";
  mysqlConnection.query(sql, [studentID], (error, data) => {
    if (error) {
      res
        .status(500)
        .send({ statusCode: 500, message: "Internal server error" });
    } else {
      if (data.length > 0) {
        res
          .status(200)
          .send({ statusCode: 200, message: "Records found", details: data });
      } else {
        res.status(400).send({ statusCode: 400, message: "No records found" });
      }
    }
  });
});

router.post("/", upload.single("image"), function (req, res) {
  const dirPath = path.join(__dirname, "../../public/images");
  const fullName = req.body.full_name;
  const email = req.body.email;
  const picPath = req.file.filename;
  const sql = "INSERT INTO bio(full_name, email_id, pic) VALUES(?,?,?)";

  mysqlConnection.query(sql, [fullName, email, picPath], (error, data) => {
    if (error) {
      fs.unlinkSync(`${dirPath}/${picPath}`);
      res
        .status(500)
        .send({ statusCode: 500, message: "Internal server error" });
    } else {
      res.status(201).send({ statusCode: 201, message: "Successfully saved" });
    }
  });
});

router.post("/:id", upload.single("image"), function (req, res) {
  const dirPath = path.join(__dirname, "../../public/images");

  const studentID = req.params.id.trim();
  const fullName = req.body.full_name;
  const email = req.body.email;
  const picPath = req.file.filename;

  const fetchSQL = "SELECT * FROM bio WHERE id=?";
  mysqlConnection.query(fetchSQL, [studentID], (error, data) => {
    if (error) {
      res
        .status(500)
        .send({ statusCode: 500, message: "Internal server error" });
    } else {
      if (data.length > 0) {
        const [{ pic }] = data;
        const updateSQL =
          "UPDATE bio SET full_name=?, email_id=? , pic=? WHERE id=?";
        mysqlConnection.query(
          updateSQL,
          [fullName, email, picPath, studentID],
          (error, data) => {
            if (error) {
              fs.unlinkSync(`${dirPath}/${picPath}`);
              res
                .status(500)
                .send({ statusCode: 500, message: "Internal server error" });
            } else {
              fs.unlinkSync(`${dirPath}/${pic}`);
              res
                .status(200)
                .send({ statusCode: 200, message: "Successfully updated" });
            }
          }
        );
      } else {
        fs.unlinkSync(`${dirPath}/${picPath}`);
        res
          .status(400)
          .send({ statusCode: 400, message: "No records found to update" });
      }
    }
  });
});

router.delete("/:id", function (req, res) {
  const studentID = req.params.id.trim();
  const fetchSQL = "SELECT * FROM bio WHERE id=?";
  mysqlConnection.query(fetchSQL, [studentID], (error, data) => {
    if (error) {
      res
        .status(500)
        .send({ statusCode: 500, message: "Internal server error" });
    } else {
      if (data.length > 0) {
        const [{ pic }] = data;
        const deleteSQL = "DELETE FROM bio WHERE id=?";
        mysqlConnection.query(deleteSQL, [studentID], (error, data) => {
          if (error) {
            res
              .status(500)
              .send({ statusCode: 500, message: "Internal server error" });
          } else {
            const dirPath = path.join(__dirname, "../../public/images");
            fs.unlinkSync(`${dirPath}/${pic}`);
            res
              .status(200)
              .send({ statusCode: 200, message: "Successfully deleted" });
          }
        });
      } else {
        res
          .status(400)
          .send({ statusCode: 400, message: "No records found to delete" });
      }
    }
  });
});

app.use("/", router);

module.exports = app;
