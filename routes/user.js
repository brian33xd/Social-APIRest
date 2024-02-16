const express = require("express");
const userController = require("../controllers/user");
const check = require("../middlewares/auth");
const router = express.Router();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/avatars/");
  },
  filename: (req, file, cb) => {
    cb(null, "avatar-" + Date.now() + "-" + file.originalname);
  },
});

const uploads = multer({ storage });

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile/:id", check.auth, userController.profile);
router.get("/list/:page", check.auth, userController.list);
router.put("/update", check.auth, userController.update);
router.post(
  "/upload",
  [check.auth, uploads.single("avatar")],
  userController.upload
);
router.get("/avatar/:name", userController.avatar);
router.get("/counters/:id", check.auth, userController.counters);
router.get("/search/:query", check.auth, userController.search);

module.exports = router;
