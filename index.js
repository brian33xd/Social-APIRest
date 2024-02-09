const { connection } = require("./DATABASE/connection");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
console.log("Api started");

connection();

const app = express();
const port = process.env.PORT || 3900;

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/Test", (req, res) => {
  res.status(200).json({
    status: "Success",
    message: "You are using the A P I of a social media",
  });
});

const userRouter = require("../api-rest-Red-Social/routes/user");
const followRouter = require("../api-rest-Red-Social/routes/follow");
const publicationRouter = require("../api-rest-Red-Social/routes/publication");

app.use("/api/user", userRouter);
app.use("/api/follow", followRouter);
app.use("/api/publication", publicationRouter);

app.listen(port, () => {
  console.log("Server running in port: " + port);
});
