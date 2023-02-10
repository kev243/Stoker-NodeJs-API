const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userShema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please add your name"],
    },
    email: {
      type: String,
      required: [true, "please add your  email"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "please enter a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "please add a password"],
      minLength: [6, "Password must be up to 6 characters"],
    },

    photo: {
      type: String,
      required: true,
      default: "https://i.ibb.co/c3t8TH4/utilisateur.png",
    },

    phone: {
      type: String,
      default: "+243",
    },

    bio: {
      type: String,
      default: "bio",
      maxLength: [230, "Bio must not  be more than 23 characters"],
    },
  },
  {
    timestamps: true,
  }
);

//function for Encrypt password before saving to BD
userShema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  //hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

module.exports = mongoose.model("User", userShema);
