/*Models*/
const Follow = require("../Models/follower");
/*Services*/
const { followThisUser, followUserIds } = require("../services/followUserIds");

const save = (req, res) => {
  const params = req.body;

  const identity = req.user;

  let userToFollow = new Follow({
    user: identity.id,
    followed: params.followed,
  });

  userToFollow
    .save()
    .then((followStored) => {
      return res.status(200).json({
        status: "success",
        message: "Followed an user",
        identity: req.user,
        followed: followStored,
      });
    })
    .catch((error) => {
      if (error)
        return res
          .status(500)
          .json({ status: "error", message: "Cannot follow this user" });
    });
};

const unfollow = async (req, res) => {
  const userID = req.user.id;

  const followedID = req.params.id;

  await Follow.deleteOne({
    user: userID,
    followed: followedID,
  })
    .then(() => {
      return res.status(200).json({
        status: "success",
        message: "Follow deleted",
      });
    })
    .catch((error) => {
      return res.status(404).json({
        status: "error",
        message: "Cannot unfollow this profile",
      });
    });
};

const followed = async (req, res) => {
  let userID = req.user.id;

  if (req.params.id) userID = req.params.id;

  let PageSelected = 1;

  if (req.params.page) PageSelected = req.params.page;

  const itemsPerPage = 5;

  const options = {
    page: PageSelected,
    limit: itemsPerPage,
    populate: [
      { path: "user followed", select: "-password -role -__v -email" },
    ],
  };

  await Follow.paginate({ user: userID }, options).then(async (follows) => {
    let { following } = await followUserIds(req.user.id);

    let { followers } = await followUserIds(req.user.id);
    return res.status(200).send({
      status: "success",
      follows,
      following,
      followers,
    });
  });
};

const followers = async (req, res) => {
  let userID = req.user.id;

  if (req.params.id) userID = req.params.id;
  if (req.params.page) PageSelected = req.params.page;

  const itemsPerPage = 5;

  const options = {
    page: PageSelected,
    limit: itemsPerPage,
    populate: [{ path: "user", select: "-password -role -__v -email" }],
  };

  await Follow.paginate({ followed: userID }, options).then(async (follows) => {
    let { following, followers } = await followUserIds(req.user.id);

    return res.status(200).send({
      status: "success",
      follows,
      following,
      followers,
    });
  });
};

module.exports = {
  save,
  unfollow,
  followed,
  followers,
};
