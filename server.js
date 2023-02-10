const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

const app = express();

//connexion bd
connectDB();

// middleware qui permet de traiter les données de la requetes
app.use(express.json());
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
