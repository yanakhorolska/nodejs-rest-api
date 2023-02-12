const express = require("express");
const router = express.Router();
const { asyncWrapper } = require("../../helpers/apiHelpers");

const { uploadMiddleware } = require("../../middlewares/uploadAvatar");
const {
  authUserValidation,
  updateSubscriptionValidation,
  verifyValidation,
} = require("../../utils/validation/userValidationSchema");

const { validationBody } = require("../../utils/validation/validationBody");

const {
  register,
  login,
  logout,
  current,
  updateSubscriptionUser,
  updateAvatar,
  verificationTokenRequest,
  verifyRequest,
} = require("../../controllers/usersController");

const { authMiddleware } = require("../../middlewares/authMiddleware");

router.post(
  "/register",
  validationBody(authUserValidation),
  asyncWrapper(register)
);

router.post("/login", validationBody(authUserValidation), asyncWrapper(login));

router.post("/logout", authMiddleware, asyncWrapper(logout));

router.get("/current", authMiddleware, asyncWrapper(current));

router.patch(
  "/avatars",
  authMiddleware,
  uploadMiddleware.single("avatar"),
  asyncWrapper(updateAvatar)
);

router.patch(
  "/subscription",
  authMiddleware,
  validationBody(updateSubscriptionValidation),
  asyncWrapper(updateSubscriptionUser)
);

router.get(
  "/verify/:verificationToken",
  asyncWrapper(verificationTokenRequest)
);

router.post(
  "/verify",
  validationBody(verifyValidation),
  asyncWrapper(verifyRequest)
);

module.exports = {
  usersRouter: router,
};
