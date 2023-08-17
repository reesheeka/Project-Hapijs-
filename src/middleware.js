const jwt = require("jsonwebtoken");
const newsModel = require("./Models/newsModel");
const mongoose = require("mongoose");

//-----------------------authentication-----------------------//
const authenticate = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    if (!token) {
      return res
        .status(400)
        .send({ status: false, message: "Token must be present." });
    }

    const decoded = jwt.verify(token, "news")
        req.decodedToken = decoded

        next();
  } catch (error) {
    return res.status(401).send({ status: false, message: error.message });
  }
};

const authorize = async function (req, res, next) {
  try {
    const decodede = req.decodedToken;
    console.log(decodede)
    const userId = req.body.userId;

    if (decodede.userId == userId) {
      next();
    } else {
      return res.status(403).send({ sttaus: false, msg: "Not authorized" });
    }
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

//----------------------------Authorization--------------------------//
const authorize1 = async function (req, res, next) {
  try {
    const newsId = req.params.newsId;
    if (newsId) {
      if (!mongoose.isValidObjectId(newsId)) {
        return res.status(400).send({ status: false, msg: "Invalid newsId" });
      }
    }

    const news = await newsModel.findById(newsId).populate("userId");

    const value = news.userId.isAdmin;
    
    if (value !== true) {
      return res
        .status(403)
        .send({ status: false, msg: "You are not authorize to update and delete news" });
    } else {
      next();
    }
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

module.exports = { authenticate, authorize, authorize1 };
