const express = require("express");
const FollowController = require("../controllers/follow");
const check = require("../middlewares/auth");

const router = express.Router();

router.post("/save", check.auth, FollowController.save);
router.delete("/unfollow/:id", check.auth, FollowController.unfollow);
router.get("/following/:id?/:page?", check.auth, FollowController.followed);
router.get("/followers/:id?/:page?", check.auth, FollowController.followers);
module.exports = router;
