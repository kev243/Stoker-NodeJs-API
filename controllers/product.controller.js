const Product = require("../models/product.model");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;
const stripe = require("stripe")(
  "sk_test_51HXWQCJsArtUj9Nn0vwthvKMizWPUG5WKTNXlH71yyGNomlIcacyoE1tmWUEwJgG1w5flHk7Db1kGfeP498luW3i00ARgBP8G9"
);

module.exports = {
  //create product
  async createProduct(req, res) {
    try {
      const { name, sku, category, quantity, price, description } = req.body;

      //validation
      if (!name || !category || !price || !description || !quantity) {
        return res
          .status(400)
          .json({ message: "Please fill in all required fields" });
      }

      // Handle Image upload
      let fileData = {};

      if (req.file) {
        // Save image to cloudinary
        let uploadedFile;
        try {
          uploadedFile = await cloudinary.uploader.upload(req.file.path, {
            folder: "Paywhiz App",
            resource_type: "image",
          });
        } catch (error) {
          res.status(500).json({ message: "Image could not be uploaded" });
        }

        fileData = {
          fileName: req.file.originalname,
          filePath: uploadedFile.secure_url,
          fileType: req.file.mimetype,
          fileSize: fileSizeFormatter(req.file.size, 2),
        };
      }
      const product = await Product.create({
        user: req.user.id,
        name,
        sku,
        category,
        quantity,
        price,
        description,
        image: fileData,
      });

      return res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  //get All product
  async getProduct(req, res) {
    try {
      const products = await Product.find({ user: req.user.id }).sort(
        "-createdAt"
      );

      if (products) {
        return res.status(200).json(products);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  //get a single product
  async getSingleProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "product not found" });
      }
      //match product to its user
      if (product.user.toString() !== req.user.id) {
        return res.status(401).json({ message: "user not authorized" });
      }

      return res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  //delete product
  async deleteProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "product not found" });
      }
      //match product to its user
      if (product.user.toString() !== req.user.id) {
        return res.status(401).json({ message: "user not authorized" });
      }

      await product.remove();
      return res.status(200).json({ message: "Product deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  //update Product
  async updateProduct(req, res) {
    const { name, category, quantity, price, description } = req.body;
    const { id } = req.params;

    const product = await Product.findById(id);

    // if product doesnt exist
    if (!product) {
      return res.status(404).json({ message: " Product not found " });
    }

    // Match product to its user
    if (product.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    // Handle Image upload
    let fileData = {};
    if (req.file) {
      // Save image to cloudinary
      let uploadedFile;
      try {
        uploadedFile = await cloudinary.uploader.upload(req.file.path, {
          folder: "Paywhiz App",
          resource_type: "image",
        });
      } catch (error) {
        res.status(500).json({ message: "Image could not be uploaded" });
      }

      fileData = {
        fileName: req.file.originalname,
        filePath: uploadedFile.secure_url,
        fileType: req.file.mimetype,
        fileSize: fileSizeFormatter(req.file.size, 2),
      };
    }

    // Update Product
    const updatedProduct = await Product.findByIdAndUpdate(
      { _id: id },
      {
        name,
        category,
        quantity,
        price,
        description,
        image: Object.keys(fileData).length === 0 ? product.image : fileData,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    return res.status(200).json(updatedProduct);
  },

  async checkout(req, res) {
    // const { price, quantity } = req.body;
    const session = await stripe.checkout.sessions.create({
      lineItems: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "T-shirt",
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:4242/success",
      cancel_url: "http://localhost:4242/cancel",
    });
    res.redirect(303, session.url);
  },
};
