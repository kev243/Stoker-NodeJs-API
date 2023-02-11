const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv").config();
const cors = require("cors");
const cookiParser = require("cookie-parser");
const port = process.env.PORT || 5000;
// const asyncHandler = require("express-async-handler");
const authMiddleware = require("./middleWare/authMiddleware");

const app = express();

//connexion bd
connectDB();

// middleware qui permet de traiter les données de la requetes
app.use(express.json());
app.use(cookiParser());
// app.use(authMiddleware);
app.use(express.urlencoded({ extended: false }));

//autorisation cors
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

//nos routes
// app.use("/", require("./routes/stoker.routes"));
app.use("/api/users", require("./routes/user.routes"));

// lancer le server
app.listen(port, () => console.log("le serveur à démarré au port " + port));
