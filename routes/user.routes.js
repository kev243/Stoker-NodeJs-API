const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  loginStatus,
  updateUser,
} = require("../controllers/user.controller");
const controller = require("../middleWare/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/getuser", controller.protect, getUser);
router.get("/loggedin", loginStatus);
router.patch("/updateuser", controller.protect, updateUser);

module.exports = router;
