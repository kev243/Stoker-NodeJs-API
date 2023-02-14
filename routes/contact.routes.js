const express = require("express");
const controller = require("../middleWare/authMiddleware");
const { contactUs } = require("../controllers/contact.controller");

const router = express.Router();

router.post("/", controller.protect, contactUs);

module.exports = router;
