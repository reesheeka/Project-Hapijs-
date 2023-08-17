const express = require("express");
const mongoose = require("mongoose");
const route = require("./route");
const app = express();
require("dotenv").config();
const httperror = require("http-errors");
const morgan = require("morgan");

app.use(express.json());
app.use(express.static('Images'))
app.use(morgan("dev"));

mongoose
  .connect(
    "mongodb+srv://reesheeka:rishika123@cluster0.6sez6kq.mongodb.net/newsDB"
  )
  .then(() => console.log("MongoDB is connected"))
  .catch((error) => console.log(error));

app.use("/", route);

app.use((req, res, next) => {
  res.send(httperror. NotFound());
})

app.use((error, req, res, next) => {
  error.status = error.status|| 5000
  res.status(error.status)
  res.send(error);
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
