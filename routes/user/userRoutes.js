const express = require("express");
const userRoute = express.Router();
const {
  googleLogin,
  signUp,
  login,
  logoutUser,
  updateUser,
  sendOtp,
  changePassword,
  toggleNotifications,
  deleteNotification,
  getCoupons,
} = require("../../controller/userController");
const { verifyOtp } = require("../../middleware/verifyOtp");
const verifyUser = require("../../middleware/authMiddleware");

userRoute.get("/coupons/:userId", getCoupons);

userRoute.post("/otp/send", sendOtp);
userRoute.post("/users", verifyOtp, signUp);
userRoute.post("/login", login);
userRoute.post("/login/google", googleLogin);
userRoute.post("/auth/logout", logoutUser);

userRoute.put("/password", verifyUser, changePassword);
userRoute.put("/profile", verifyUser, updateUser);
userRoute.put("/notifications/toggle", toggleNotifications);

userRoute.patch("/users/:userId/notifications/clear", deleteNotification);

module.exports = userRoute;
