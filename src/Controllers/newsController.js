const newsModel = require("../Models/newsModel");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,path.join(__dirname,'/../Images'));
    },
    filename: (req,file,cb) => {
        cb(null, Date.now() + "" +file.originalname)
    }
})

const upload = multer({storage: storage});

function validateString(input) {
  if (typeof input === "string") {
    return true;
  } else {
    return false;
  }
}

//------------------------Create News-----------------------//
const createNews = async function (req, res) {
  try {
    const { title, newsType, description, date, userId} = req.body;
    let file = req.files
    
    if (Object.keys(req.body).length == 0) { return res.status(400).send({ status: false, message: "Please give data" }); }
    
    if (title) {
      if (!validateString(title)) {
        return res
          .status(400)
          .send({ status: false, msg: "Title must be string" });
      }
    } else {
      return res.status(400).send({ status: false, msg: "Title is required" });
    }

    if (newsType) {
      if (!validateString(newsType)) {
        return res
          .status(400)
          .send({ status: false, msg: "NewsType must be string" });
      }
      if (
        newsType != "Education" &&
        newsType != "World" &&
        newsType != "Latest"
      ) {
        return res.status(400).send({
          status: false,
          msg: "Newstype must be education, world and latest",
        });
      }
    } else {
      return res
        .status(400)
        .send({ status: false, msg: "Newstype is required" });
    }

    if (description) {
      if (!validateString(description)) {
        return res
          .status(400)
          .send({ status: false, msg: "Description must be string" });
      }
    } else {
      return res
        .status(400)
        .send({ status: false, msg: "Description is required" });
    }

    if (date) {
      if (!validateString(date)) {
        return res
          .status(400)
          .send({ status: false, msg: "Date must be string" });
      }
    } else {
      return res.status(400).send({ status: false, msg: "Date is required" });
    }

    if (userId) {
      if (!mongoose.isValidObjectId(userId)) {
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid userId" });
      }
    } else {
      return res.status(400).send({ status: false, msg: "UserId is required" });
    }
    
    //if(!file){return res.status(400).send({status: false, msg: "Image is  required"});}
    let url = upload.single("Images")
    req.body.image = url

    const newsdata = await newsModel.create(req.body);
    return res.status(201).send({
      status: true,
      msg: "News created successfully",
      data: newsdata,
    });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

//--------------------------Get News------------------------//
const getNews = async function (req, res) {
  try {
    const data = req.query;
    
    if (Object.keys(req.query).length == 0) { return res.status(400).send({ status: false, message: "Please give data" }); }
    
    const { userId, newstype } = data;
    if (userId) {
      if (!mongoose.isValidObjectId(userId)) {
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid userId" });
      }
    }
    if (newstype) {
      if (
        newstype != "Education" &&
        newstype != "World" &&
        newstype != "Latest"
      ) {
        return res.status(400).send({
          status: false,
          msg: "Please provide valid newstype as education, world and latest only",
        });
      }
    }
    const newsData = await newsModel.find(data);
    if (!newsData) {
      return res.status(404).send({ status: false, msg: "News not found" });
    }
    return res
      .status(200)
      .send({ status: true, msg: "News fetch successfully", data: newsData });
  } catch (error) {
    return res.status(500).send({ status: true, msg: error.message });
  }
};

//-------------------------------Update News-----------------------------//
const updateNews = async function (req, res) {
  try {
    const newsId = req.params.newsId;
    const checknewsId = await newsModel.findById(newsId);
    //console.log(checknewsId)
    if (!checknewsId) {
      return res.status(404).send({ status: false, msg: "News not found" });
    }
    const { title, newsType, description } = req.body;

    if (Object.keys(req.body).length == 0) { return res.status(400).send({ status: false, message: "Please give data" }); }
    
    if(title){
      if(!validateString(title)){return res.status(400).send({status: false, msg: "Title must be string"});}
    }

    if(newsType){
      if(!validateString(newsType)){return res.status(400).send({status: false, msg: "NewsType must be string"});}
    }

    if(description){
      if(!validateString(description)){return res.status(400).send({status: false, msg: "Description must be string"});}
    }

    const updateNews = await newsModel.findOneAndUpdate(
      { _id: newsId },
      {
        $set: {
          title: req.body.title,
          newstype: req.body.newsType,
          description: req.body.description,
        },
      },
      { new: true }
    );
    return res.status(200).send({
      status: true,
      msg: "News updated successfully",
      data: updateNews,
    });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

//-------------------------------Delete News-----------------------------//
const deleteNews = async function (req, res) {
  try {
    let newsId = req.params.newsId;

    if (!mongoose.isValidObjectId(newsId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid newsId" });
    }

    let newsdata = await newsModel.findOne({ _id: newsId, isDeleted: false });
    if (!newsdata) {
      return res.status(404).send({ status: false, message: "News not Found" });
    }

    const deleteNews = await newsModel.findOneAndUpdate(
      { _id: newsId },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
    return res.status(200).send({
      status: true,
      message: "News deleted successfully",
      data: deleteNews,
    });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

module.exports = { createNews, getNews, deleteNews, updateNews };
