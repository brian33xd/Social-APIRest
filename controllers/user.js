/*Dependencies*/
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

/*Models*/
const User = require("../Models/user");
const Follow = require("../Models/follower");
const Publication = require("../Models/publication");
/*Services*/
const { followThisUser, followUserIds } = require("../services/followUserIds");
const jwt = require("../services/jwt");

const register = (req, res) => {
  let DataFromBody = req.body;

  if (
    !DataFromBody.name ||
    !DataFromBody.email ||
    !DataFromBody.password ||
    !DataFromBody.nick
  ) {
    return res.status(400).json({
      status: "error",
      message: "Data left",
    });
  }

  User.find({
    $or: [
      { email: DataFromBody.email.toLowerCase() },
      { nick: DataFromBody.nick.toLowerCase() },
    ],
  }).then(async (users) => {
    if (users && users.length >= 1) {
      return res.status(400).json({
        status: "error",
        message: "User already exists",
      });
    }

    let pwd = await bcrypt.hash(DataFromBody.password, 10);
    DataFromBody.password = pwd;

    let user_to_save = new User(DataFromBody);

    user_to_save
      .save()
      .catch((err, IntegrateUserDB) => {
        if (err || !IntegrateUserDB) {
          return res.status(500).send({
            status: "error",
            message: "User cannot be saved",
          });
        }
      })
      .then((IntegrateUserDB) => {
        return res.status(200).json({
          status: "success",
          message: "User has been created succesfully",
          user: IntegrateUserDB,
        });
      });
  });
};

const login = (req, res) => {
  let DataFromBody = req.body;

  if (!DataFromBody.email && !DataFromBody.password) {
    return res.status(400).send({
      status: "error",
      message: "Data left",
    });
  }
  User.findOne({ email: DataFromBody.email })
    //.select({ password: 0 })
    .then((user) => {
      const pwd = bcrypt.compareSync(DataFromBody.password, user.password);

      if (!pwd) {
        return res.status(400).send({
          status: "error",
          message: "The password or Email are wrong",
        });
      }

      const token = jwt.createToken(user);

      return res.status(200).send({
        status: "success",
        message: "Login action",
        user: {
          id: user._id,
          name: user.name,
          nick: user.nick,
        },
        token,
      });
    })
    .catch((error, user) => {
      if (error || !user) {
        return res
          .status(404)
          .send({ status: "error", message: "User does not exists" });
      }
    });
};

const profile = (req, res) => {
  let id = req.params.id;

  User.findById(id)
    .select({ password: 0, role: 0 })
    .then(async (userProfile) => {
      let { followers, following } = await followThisUser(req.user.id, id);

      return res.status(200).send({
        status: "success",
        message: "User found",
        userProfile,
        following,
        followers,
      });
    })
    .catch((error, userProfile) => {
      if (error || !userProfile) {
        return res.status(401).send({
          status: "error",
          message: "User not found",
        });
      }
    });
};

const list = (req, res) => {
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  page = parseInt(page);

  let itemsPerPage = 5;

  const options = {
    select: { password: 0, role: 0 },
    page,
    limit: itemsPerPage,
    sort: { _id: 1 },
  };

  User.paginate({}, options).then(async (result) => {
    if (!result) {
      return res.status(404).send({
        status: "error",
        message: "There's no users",
      });
    }

    let infoFollowing = await followUserIds(req.user.id);
    return res.status(200).send({
      status: "success",
      message: "List of Users",
      users: result.docs,
      page,
      itemsPerPage,
      total: result.totalDocs,
      pages: result.totalPages,
      followers: infoFollowing.followers,
      following: infoFollowing.following,
    });
  });
};

const update = (req, res) => {
  let userIdentity = req.user;
  let userToUpdate = req.body;

  delete userToUpdate.iat;
  delete userToUpdate.exp;
  delete userToUpdate.role;
  delete userToUpdate.image;

  User.find({
    $or: [
      { email: userToUpdate.email.toLowerCase() },
      { nick: userToUpdate.nick.toLowerCase() },
    ],
  }).then(async (users) => {
    let userIsset = false;

    users.forEach((user) => {
      if (user && user._id != userIdentity.id) userIsset = true;
    });

    if (userIsset) {
      return res.status(200).json({
        status: "error",
        message: "User already exists",
      });
    }

    if (userToUpdate.password) {
      let pwd = await bcrypt.hash(userToUpdate.password, 10);
      userToUpdate.password = pwd;
    } else {
      delete userToUpdate.password;
    }
    try {
      let userUpdated = await User.findByIdAndUpdate(
        userIdentity.id,
        userToUpdate,
        { new: true }
      );
      if (!userToUpdate) {
        return res.status(400).json({
          status: "error",
          message: "Error al actualizar el usuario",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "User has been act",
        userUpdated,
      });
    } catch (error) {
      return res.status(500).send({
        status: "error",
        message: "Error al actualizar",
      });
    }
  });
};

const upload = (req, res) => {
  if (!req.file) {
    return res.status(404).json({
      status: "error",
      message: "Image has not arrived ",
    });
  }

  let imageName = req.file.originalname;

  const divideImage = imageName.split(".");
  const extension = divideImage[1];

  if (
    extension != "png" &&
    extension != "jpg" &&
    extension != "jpeg" &&
    extension != "gif"
  ) {
    const filePath = req.file.path;
    const filetDeleted = fs.unlinkSync(filePath);

    return res.status(400).json({
      status: "error",
      message: "Please put a jpg, png, jpeg or gif",
    });
  }

  User.findOneAndUpdate(
    { _id: req.user.id },
    { image: req.file.filename },
    { new: true }
  )
    .then((userUpdated) => {
      return res.status(200).json({
        status: "success",
        user: userUpdated,
        file: req.file,
      });
    })
    .catch((error) => {
      if (error) {
        return res.status(404).send({
          status: "error",
          message: "error tryng to update the image",
        });
      }
    });
};

const avatar = (req, res) => {
  const imagetoReturn = req.params.name;

  const pathImage = "./uploads/avatars/" + imagetoReturn;

  fs.stat(pathImage, (error, exists) => {
    if (!exists) {
      return res.status(404).json({
        status: "error",
        message: "Image doesnt exists",
      });
    }

    return res.sendFile(path.resolve(pathImage));
  });
};

const counters = async (req, res) => {
  let userID = req.user.id;

  if (req.params.id) {
    userID = req.params.id;
  }

  try {
    const following = await Follow.find({ user: userID });

    const followed = await Follow.find({ followed: userID });

    const publications = await Publication.find({ user: userID });

    return res.status(200).send({
      status: "success",
      message: "counter of actions",
      userID,
      following: following.length,
      followed: followed.length,
      publications: publications.length,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "error counting stats",
      error,
    });
  }
};
module.exports = {
  register,
  login,
  profile,
  list,
  update,
  upload,
  avatar,
  counters,
};
