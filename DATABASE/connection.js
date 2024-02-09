const mongoose = require("mongoose");

const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECT_URI);

    console.log("Correcty connected to the database");
  } catch (error) {
    console.log(error);

    throw new error("Cannot connect to database");
  }
};

module.exports = {
  connection,
};
