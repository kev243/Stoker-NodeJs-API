const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv").config();
const cors = require("cors");
const cookiParser = require("cookie-parser");
const port = process.env.PORT || 5000;
// const asyncHandler = require("express-async-handler");
const authMiddleware = require("./middleWare/authMiddleware");
const sgMail = require("@sendgrid/mail");
const path = require("path");

const app = express();

//connexion bd
connectDB();

// middleware qui permet de traiter les données de la requetes
app.use(express.json());
app.use(cookiParser());
app.use(express.urlencoded({ extended: false }));

//autorisation cors
app.use(
  cors({
    origin: "https://main.d2rym53t4vyd7h.amplifyapp.com",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

//nos routes
app.get("/", (req, res) => {
  res.send("Home Page");
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/contactus", require("./routes/contact.routes"));

// lancer le server
app.listen(port, () => console.log("le serveur à démarré au port " + port));
