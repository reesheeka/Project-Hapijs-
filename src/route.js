const express = require("express");
const router = express.Router();
const userController = require("./Controllers/userController");
const newsController = require("./Controllers/newsController");
const mw = require("./middleware");

//-----------------------User Routes-----------------------//
router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);
router.get("/users/:userType", userController.getUserDetails);
router.put("/updateusers", mw.authenticate, userController.updateUserType)

//-------------------------News Routes-----------------------//
router.post("/createnews", mw.authenticate, mw.authorize, newsController.createNews);
router.get("/getnews", mw.authenticate, newsController.getNews);
router.put(
  "/updatenews/:newsId",
  mw.authenticate,
  mw.authorize1,
  newsController.updateNews
);
router.post(
  "/delete/:newsId",
  mw.authenticate,
  mw.authorize1,
  newsController.deleteNews
);

router.all('/*', function (req, res) {
  res.status(400).send({ status: false, message: 'Invalid HTTP Request' });
})

module.exports = router;
