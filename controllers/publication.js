/*Dependencies*/
const fs = require("fs");
const path = require("path");
/*Models*/
const Publication = require("../Models/publication");
/*Services*/
const followService = require("../services/followUserIds");

const save = (req, res) => {
  let Information = req.body;

  if (!Information.text)
    return res.status(400).send({
      status: "error",
      message: "Please put a text on the publication",
    });

  let newPublication = new Publication(Information);

  newPublication.user = req.user.id;
  newPublication
    .save()
    .then((publication) => {
      return res.status(200).send({
        status: "success",
        message: "Message from save",
        publication,
      });
    })
    .catch((error) => {
      if (error) {
        return res.status(404).send({
          status: "error",
          message: "cannot save this publication",
        });
      }
    });
};

const detail = (req, res) => {
  const publicationID = req.params.id;

  Publication.findById(publicationID)
    .then((publication) => {
      if (publication) {
        return res.status(200).send({
          status: "success",
          message: "publication details",
          publication,
        });
      } else {
        throw new error();
      }
    })
    .catch((error) => {
      return res.status(404).send({
        status: "error",
        message: "Publication not found",
      });
    });
};

const remove = (req, res) => {
  const PublicationToDelete = req.params.id;

  Publication.findOneAndDelete({ user: req.user.id, _id: PublicationToDelete })
    .then(() => {
      return res.status(200).send({
        status: "success",
        message: "publication removed",
      });
    })
    .catch((error) => {
      return res.status(400).send({
        status: "error",
        message: "error cannot remove this publication",
      });
    });
};

const user = (req, res) => {
  const userID = req.params.id;

  let page = 1;

  if (req.params.page) {
    page = req.params.page;
  }

  const options = {
    sort: "-created_at",
    populate: { path: "user", select: "-password -__v -role -email -bio" },
    limit: 5,
    page: page,
  };

  Publication.paginate({ user: userID }, options)
    .then((publications) => {
      if (publications.docs.length >= 1) {
        return res.status(200).send({
          status: "success",
          message: "Publications of an user",
          publications,
        });
      } else {
        throw new error();
      }
    })
    .catch((error) => {
      return res.status(400).send({
        status: "error",
        message: "There's no publications yet",
      });
    });
};

const upload = (req, res) => {
  const publicationID = req.params.id;

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

  Publication.findOneAndUpdate(
    { user: req.user.id, _id: publicationID },
    { file: req.file.filename },
    { new: true }
  )
    .then((publicationUpdated) => {
      return res.status(200).json({
        status: "success",
        publication: publicationUpdated,
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

const media = (req, res) => {
  const imagetoReturn = req.params.name;

  const pathImage = "./uploads/publications/" + imagetoReturn;

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

const feed = async (req, res) => {
  let page = 1;
  if (req.params.page) page = req.params.page;

  try {
    const myFollows = await followService.followUserIds(req.user.id);

    const options = {
      populate: { path: "user", select: "-password -role -email -__v" },
      sort: "-created_at",
      limit: 5,
      page,
    };
    const publications = await Publication.paginate(
      {
        user: myFollows.following,
      },
      options
    );
    if (publications.docs.length >= 1) {
      return res.status(200).send({
        status: "success",
        message: "Publications",
        following: myFollows.following,
        publications,
      });
    } else {
      throw new error("There's no publications");
    }
  } catch (error) {
    return res.status(400).send({
      status: "error",
      message: "error tryng to get the publications",
      error,
    });
  }
};
module.exports = {
  save,
  detail,
  remove,
  user,
  upload,
  media,
  feed,
};
