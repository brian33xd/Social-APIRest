const mongoose = require("mongoose");

const connection = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://BrianDB:brian1110011@brian33.sn9ep8h.mongodb.net/DBSOCIAL"
    );

    console.log("Correcty connected to the database");
  } catch (error) {
    console.log(error);

    throw new error("Cannot connect to database");
  }
};

module.exports = {
  connection,
};
