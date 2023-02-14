const User = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");

module.exports = {
  async contactUs(req, res) {
    try {
      const { subject, message } = req.body;

      const user = await User.findById(req.user._id);

      if (!user) {
        return res
          .status(400)
          .json({ message: "user not found,please signup" });
      }

      //   Validation
      if (!subject || !message) {
        return res
          .status(400)
          .json({ message: "Please add subject and message" });
      }

      const send_to = process.env.EMAIL_USER;
      const sent_from = process.env.EMAIL_USER;
      const reply_to = user.email;

      await sendEmail(subject, message, send_to, sent_from, reply_to);

      return res.status(200).json({ success: true, message: "Email Sent" });
    } catch (error) {
      res.status(500).json({ message: "Email not sent, please try again" });
    }
  },
};
