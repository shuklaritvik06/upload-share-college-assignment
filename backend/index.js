const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");
const app = express();
app.use(cors());
app.use(express.json());
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync("./files")) {
      fs.mkdirSync("./files");
    }
    cb(null, path.join(__dirname, "./files/"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + file.originalname.match(/\..*$/)[0]
    );
  }
});

const upload = multer({ storage: storage });
app.post("/upload", upload.any(), function (req, res) {
  res.status(200).send({ message: "Uploaded Successfully!", files: req.files });
});
app.post("/email", function (req, res) {
  const fileNames = [];
  const urls = [];
  req.body.uploaded.forEach((file) => {
    fileNames.push(file.filename);
  });
  fileNames.forEach((name) => {
    urls.push(`http://localhost:5000/file/${name}`);
  });
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "ritvikshukla261@gmail.com",
      pass: ""
    }
  });
  const { email, firstName, lastName } = req.body;
  const mailOptions = {
    from: "ritvikshukla261@gmail.com",
    to: email,
    subject: "Someone shared you a file!",
    text: `Hey!, ${firstName} ${lastName} want to share a file with you. Here is the url of the files ${urls.join(
      "\n"
    )}`
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.status(500).send("Email not sent");
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send("Email sent successfully!");
    }
  });
});
app.get("/file/:filename", function (req, res) {
  res
    .status(200)
    .sendFile(path.join("./files/", `files/${req.params.filename}`));
});
app.listen(5000, () => console.log("Listening"));
