const { Router } = require("express");
const auth = require("../../middlewares/passport.js");
const { upload } = require("../../middlewares/multer.js");
const {
  current,
  login,
  logout,
  signUp,
  uploadAvatar,
} = require("../../controller/usersController.js");

const usersRouter = Router();

usersRouter.post("/signup", signUp);
usersRouter.post("/login", login);
usersRouter.get("/logout", auth, logout);
usersRouter.get("/current", auth, current);
usersRouter.patch("/avatars", auth, upload.single("avatar"), uploadAvatar);

module.exports = usersRouter;
