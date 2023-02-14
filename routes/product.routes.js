const express = require("express");
const controller = require("../middleWare/authMiddleware");

const {
  createProduct,
  getProduct,
  getSingleProduct,
  deleteProduct,
  updateProduct,
} = require("../controllers/product.controller");
const { upload } = require("../utils/fileUpload");

const router = express.Router();

router.post("/", controller.protect, upload.single("image"), createProduct);
router.get("/", controller.protect, getProduct);
router.get("/:id", controller.protect, getSingleProduct);
router.delete("/:id", controller.protect, deleteProduct);
router.patch("/:id", controller.protect, upload.single("image"), updateProduct);

module.exports = router;
