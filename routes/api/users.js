const { Router } = require("express");
const auth = require("../../middlewares.js");
const {
  current,
  login,
  logout,
  signUp,
} = require("../../controller/usersController.js");

const usersRouter = Router();

usersRouter.post("/signup", signUp);
usersRouter.post("/login", login);
usersRouter.get("/logout", auth, logout);
usersRouter.get("/current", auth, current);

module.exports = usersRouter;
