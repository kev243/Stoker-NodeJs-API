const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//function for generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

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

      //generate Token
      const token = generateToken(user._id);

      //send HTTP-only cookie
      res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //for one day
        sameSite: "none",
        secure: true,
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
          token,
        });
      }

      return res.status(400).json({ message: "invalid user data " });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  //Login User
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Please add email" });
      }

      //chek if user already exists
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ message: "user not found please signup" });
      }

      //check if password ids correct
      const validPassword = await bcrypt.compare(password, user.password);

      //generate Token
      const token = generateToken(user._id);

      //send HTTP-only cookie
      res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //for one day
        sameSite: "none",
        secure: true,
      });

      if (user && validPassword) {
        const { _id, name, email, photo, phone, bio } = user;
        return res.status(200).json({
          _id,
          name,
          email,
          photo,
          phone,
          bio,
          token,
        });
      }
      if (!validPassword)
        // return to the user that the password is invalid
        return res.status(400).json({ message: "Invalid email or password" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};
