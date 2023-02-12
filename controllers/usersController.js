const { User } = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const Jimp = require("jimp");
const dotenv = require("dotenv");
dotenv.config();
const { v4: uuidv4 } = require("uuid");
const { sendMail } = require("../utils/validation/sendEmailFunction");

const register = async (req, res) => {
  const { email, password } = req.body;
  const avatarURL = gravatar.url(email, { s: "100", r: "x", d: "retro" }, true);
  const verificationToken = uuidv4();
  const user = await User.findOne({ email });
  if (user) {
    return res.status(409).json({ message: "Email is already in use" });
  }
  const newUser = new User({ email, password, avatarURL, verificationToken });
  await newUser.save();

  await sendMail(email, verificationToken);
  return res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
      url: newUser.avatarURL,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (
    !user ||
    !(await bcrypt.compare(password, user.password)) ||
    user.verify === false
  ) {
    return res.status(401).json({ message: "Email or password is wrong" });
  }
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  user.token = token;
  await User.findByIdAndUpdate(user._id, user);
  return res.status(200).json({
    token: token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const logout = async (req, res) => {
  const { user } = req;

  user.token = null;
  await User.findByIdAndUpdate(user._id, user);
  return res.status(204).json({});
};

const current = async (req, res) => {
  const { _id } = req.user;
  const user = await User.findOne({ _id });
  if (!user) {
    res.status(401).json({ message: "Not authorized" });
  }
  res.status(200).json({ email: user.email, subscription: user.subscription });
};

const updateSubscriptionUser = async (req, res) => {
  const { _id } = req.user;
  const { subscription } = req.body;
  const user = await User.findOneAndUpdate(
    { _id },
    { subscription },
    { new: true }
  );
  if (!user) {
    return res.status(404).json({ message: "Not found" });
  }
  return res
    .status(200)
    .json({ user: user.email, subscription: user.subscription });
};

const updateAvatar = async (req, res, next) => {
  const { _id } = req.user;
  const { filename } = req.file;
  const tmpPath = path.resolve(__dirname, "../tmp", filename);
  const publicPath = path.resolve(__dirname, "../public/avatars", filename);

  await Jimp.read(tmpPath)
    .then((img) => {
      return img.resize(250, 250).write(publicPath);
    })
    .catch((err) => {
      throw new Error(err.message);
    });

  const user = await User.findOneAndUpdate(
    { _id },
    {
      avatarURL: `/avatars/${filename} `,
    },
    { new: true }
  );
  if (!user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  return res.status(200).json({ data: { avatarURL: user.avatarURL } });
};

const verificationTokenRequest = async (req, res, next) => {
  const { verificationToken } = req.params;
  const user = await User.findOneAndUpdate(
    { verificationToken },
    { verificationToken: null, verify: true },
    { new: true }
  );
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({ message: "Verification successful" });
};

const verifyRequest = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "missing required field email" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (user.verify === true) {
    return res
      .status(400)
      .json({ message: "Verification has already been passed" });
  }
  await sendMail(email, user.verificationToken);
  return res.status(200).json({ message: "Verification email sent" });
};

module.exports = {
  register,
  login,
  logout,
  current,
  updateSubscriptionUser,
  updateAvatar,
  verificationTokenRequest,
  verifyRequest,
};
