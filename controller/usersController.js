const Joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  getUserById,
  addNewUser,
  getUserByMail,
  updateToken,
  updateAvatar,
  findEmailToken,
  confirmEmail,
  isUserInDB,
  findByEmail,
} = require("../dataBase/dbQueries.js");
const dotenv = require("dotenv");
const { join } = require("path");
const gravatar = require("gravatar");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { STORE_AVATARS_DIRECTORY } = require("../middlewares/multer.js");
const { nanoid } = require("nanoid");
const sgMail = require("@sendgrid/mail");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(SENDGRID_API_KEY);

const userValidationSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: true } })
    .required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
});

const emailValidationSchema = Joi.string()
  .email({ minDomainSegments: 2, tlds: { allow: true } })
  .required();

const message = (email, token) => {
  return {
    to: email,
    from: "mateusz.siciarz.goit@gmail.com",
    subject: "Verification",
    text: `/users/verify/${token}`,
    html: `<strong>Your verification token is: ${token}</strong>`,
  };
};

const signUp = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    Joi.attempt({ email, password }, userValidationSchema);
  } catch (error) {
    return res.status(400).send(error.details[0].message);
  }
  const isUserAlreadyinDB = await getUserByMail(email);

  if (isUserAlreadyinDB) {
    return res.status(409).send("Email in use");
  }

  const hashedPassword = await bcrypt.hash(password, 6);
  try {
    const newUser = await addNewUser({
      email,
      password: hashedPassword,
      avatarURL: gravatar.url(email),
      verificationToken: nanoid(),
    });
    sgMail.send(message(email, newUser.verificationToken));
    return res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    return res.status(400).send(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    Joi.attempt({ email, password }, userValidationSchema);
  } catch (error) {
    return res.status(400).send(error.details[0].message);
  }

  const user = await getUserByMail(email);
  if (!user) return res.status(401).send("Email or password is wrong");

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword)
    return res.status(401).send("Email or password is wrong");

  const payload = { id: user._id };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  await updateToken(user._id, token);
  return res.status(201).send({
    token: token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const logout = async (req, res, next) => {
  const userId = req.user._id;
  try {
    await updateToken(userId, null);
    return res.status(204).send("No content");
  } catch (error) {
    return res.status(500).send(error);
  }
};

const current = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const currentUser = await getUserById(userId);

    if (!currentUser) return res.status(401).json("You SHALL NOT Pass");

    return res.status(200).json({
      email: currentUser.email,
      subscription: currentUser.subscription,
    });
  } catch (error) {
    return res.status(500).send(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    Jimp.read(file.path)
      .then((picture) => {
        return picture
          .resize(250, 250)

          .write(file.path);
      })
      .catch((error) => {
        console.error(error);
      });

    const avatarName = file.filename;

    const avatarPath = join(STORE_AVATARS_DIRECTORY, avatarName);
    await fs.rename(file.path, avatarPath);

    const avatarURL = `/avatars/${avatarName}`;

    await updateAvatar(user._id, avatarURL);

    res.status(200).json({ avatarURL });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const userEmailVerify = async (req, res, next) => {
  const verifyToken = req.params.verificationToken;

  if (verifyToken.length === 0) return res.status(400).send("Bad request");

  const user = await findEmailToken(verifyToken);

  if (user.length === 0) return res.status(400).send("User not found");

  const userVerify = user[0].verify;
  const userId = user[0]._id;

  if (userVerify) return res.status(400).send("Email was already confirmed");

  try {
    await confirmEmail(userId).then(() =>
      res.status(200).send("Verification successful")
    );
  } catch (error) {
    return res.status(500).send(error);
  }
};

const userReplyEmail = async (req, res, next) => {
  const { email } = req.body;
  if (!email) res.status(400).send("You don't sent any email");

  try {
    Joi.attempt(email, emailValidationSchema);
  } catch (error) {
    return res.status(400).send(error.details[0].message);
  }

  if (!(await isUserInDB(email))) return res.status(404).send("Not Found");

  try {
    const user = await findByEmail(email);

    if (user[0].verify)
      return res.status(400).send("Verification has already been passed");
    else {
      sgMail
        .send(message(email, user[0].verificationToken))
        .then(() => res.status(200).send("Verification email sent"));
    }
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

module.exports = {
  signUp,
  login,
  logout,
  current,
  uploadAvatar,
  userEmailVerify,
  userReplyEmail,
};
