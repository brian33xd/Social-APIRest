const { connection } = require("./DATABASE/connection");
require("dotenv").config();
const express = require("express");
const cors = require("cors");

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

const userRouter = require("./routes/user");
const followRouter = require("./routes/follow");
const publicationRouter = require("./routes/publication");

app.use("/api/user", userRouter);
app.use("/api/follow", followRouter);
app.use("/api/publication", publicationRouter);

app.listen(port, () => {
  console.log("Server running in port: " + port);
});
