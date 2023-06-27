const passport = require("passport");
const { ExtractJwt, Strategy } = require("passport-jwt");
const dotenv = require("dotenv");
const UserModel = require("./schemas/usersSchema.js");

dotenv.config();
const JWT_SECRET = process.env;

const params = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new Strategy(params, (payload, done) => {
    UserModel.find({ _id: payload.id })
      .then(([user]) =>
        !user || !user.token
          ? done(new Error("User not found!"))
          : done(null, user)
      )
      .catch(done);
  })
);
const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (error, user) => {
    if (!user || error || !user.token)
      return res.status(401).json({ message: "Not authorized" });
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = auth;
