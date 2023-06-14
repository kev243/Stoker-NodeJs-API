const UserModel = require("../models/user.model");
const Token = require("../models/token.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
// const userModel = require("../models/user.model");

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
        httpOnly: false,
        expires: new Date(Date.now() + 1000 * 86400), //for one day
        // sameSite: "none",
        // secure: true,
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

      //check if password is correct
      const validPassword = await bcrypt.compare(password, user.password);

      //generate Token
      const token = generateToken(user._id);

      //send HTTP-only cookie

      if (validPassword) {
        res.cookie("token", token, {
          path: "/",
          httpOnly: false,
          expires: new Date(Date.now() + 1000 * 86400), //for one day
          // sameSite: "none",
          // secure: true,
        });
      }

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
        return res.status(400).json({ message: "Invalid mail or password" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  //logout tUser
  async logoutUser(req, res) {
    try {
      res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        // sameSite: "none",
        // secure: true,
      });

      return res.status(200).json({ message: "successfully logged out" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  //get user Data from Mongo Db
  async getUser(req, res) {
    try {
      const user = await UserModel.findById(req.user._id);
      if (user) {
        const { _id, name, email, photo, phone, bio } = user;
        return res.status(200).json({
          _id,
          name,
          email,
          photo,
          phone,
          bio,
        });
      }
      return res.status(400).json({ message: "user not found" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  //get status user for tchek if user is connect or not
  async loginStatus(req, res) {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.json(false);
      }

      // Verify Token
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      if (verified) {
        return res.json(true);
      }
      return res.json(false);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  //update user
  async updateUser(req, res) {
    try {
      const user = await UserModel.findById(req.user._id);
      if (user) {
        const { name, email, photo, phone, bio } = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;
        user.photo = req.body.photo || photo;

        const updateUser = await user.save();
        return res.status(200).json({
          _id: updateUser._id,
          name: updateUser.name,
          email: updateUser.email,
          photo: updateUser.photo,
          phone: updateUser.phone,
          bio: updateUser.bio,
        });
      }
      return res.status(404).json({ message: "user not found" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  //change password for user
  async changePassword(req, res) {
    try {
      const user = await UserModel.findById(req.user._id);
      const { oldPassword, password } = req.body;

      if (!user) {
        return res
          .status(400)
          .json({ message: "user not found,please signup" });
      }

      if (!oldPassword || !password) {
        return res
          .status(400)
          .json({ message: "please add old and new password" });
      }

      //chek if password is correct in BD
      const passwordIsCorrect = await bcrypt.compare(
        oldPassword,
        user.password
      );

      if (user && passwordIsCorrect) {
        user.password = password;
      } else {
        return res.status(400).json({ message: "old password is incorrect" });
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
      await user.save();
      return res.status(200).json({ message: "Password change successful" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  //forgot password
  async forgotPassword(req, res) {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "user not found with email" });
    }

    // Delete token if it exists in DB
    let token = await Token.findOne({ userId: user._id });
    if (token) {
      await token.deleteOne();
    }

    //create reset token
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

    //hash token before saving to BD
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await new Token({
      userId: user._id,
      token: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * (60 * 1000),
    }).save();

    // Construct Reset Url
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    // Reset Email message
    const message = `
      <h2>Hello ${user.name}</h2>
      <p>Please use the url below to reset your password</p>  
      <p>This reset link is valid for only 30minutes.</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
      <p>Regards...</p>
      <p>Pinvent Team</p>
    `;

    const subject = "Password Reset Request";
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;

    try {
      await sendEmail(subject, message, send_to, sent_from);
      return res
        .status(200)
        .json({ success: true, message: "Reset Email Sent" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Email not sent, please try again" });
    }
  },

  // Reset Password
  async resetPassword(req, res) {
    const { password } = req.body;
    const { resetToken } = req.params;

    //hash token ,then compare to token in DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // fIND tOKEN in DB
    const userToken = await Token.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    if (!userToken) {
      return res.status(404).json({ message: "Invalid or Expired Token" });
    }

    // Find user
    const user = await UserModel.findOne({ _id: userToken.userId });
    user.password = password;
    await user.save();
    res.status(200).json({
      message: "Password Reset Successful, Please Login",
    });
  },
};
