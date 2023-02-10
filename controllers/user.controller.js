const UserModel = require("../models/user.model");
const bcrypt = require("bcryptjs");

module.exports = {
  //this a function for create a user
  async registerUser(req, res) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ message: "Please fill in all required fields" });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be up to 6 characters" });
      }

      if (password.length > 23) {
        return res
          .status(400)
          .json({ message: "Password must not  be more than 23 characters" });
      }

      //chek if user email already exists
      const userExist = await UserModel.findOne({ email });
      if (userExist) {
        return res
          .status(400)
          .json({ message: "Email has already been registerd  " });
      }

      //create user
      const user = await UserModel.create({
        name,
        email,
        password,
      });
      if (user) {
        const { _id, name, email, photo, phone, bio } = user;
        return res.status(201).json({
          _id,
          name,
          email,
          photo,
          phone,
          bio,
        });
      }

      return res.status(400).json({ message: "invalid user data " });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};
