const userModel = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

function validateString(input) {
  if (typeof input === "string") {
    return true;
  } else {
    return false;
  }
}

//-------------------------Create User-----------------------------//
const createUser = async function (req, res) {
  try {
    let { name, email, password, isAdmin, userType } = req.body;

    if (Object.keys(req.body).length == 0) { return res.status(400).send({ status: false, message: "Please give data" }); }
    
    if (name) {
      if (!validateString(name)) {
        return res
          .status(400)
          .send({ status: false, msg: "Name must be string" });
      }
    } else {
      return res.status(400).send({ status: false, msg: "Name is required" });
    }

    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const validEmail = emailRegex.test(email);

    if (!validEmail) {
      return res
        .status(400)
        .send({ status: true, msg: "Please enter valid email" });
    }
    if (email) {
      const checkemail = await userModel.findOne({ email: email });
      if (checkemail) {
        return res.status(400).send({
          status: false,
          msg: "Email is already in use, Please use another email",
        });
      }
    } else {
      return res.status(400).send({ status: false, msg: "Email is required" });
    }

    if (password) {
      const passwordRegex =
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/;
      const validPassword = passwordRegex.test(password);
      if (!validPassword) {
        return res.status(400).send({
          status: false,
          msg: "Please enter valid password at least one special character, uppercase and number",
        });
      }
    } else {
      return res
        .status(400)
        .send({ status: false, msg: "Password is required" });
    }

    if (userType) {
      if (!validateString(userType)) {
        return res
          .status(400)
          .send({ status: false, msg: "UserType must be string" });
      }
      if (userType != "User" && userType != "Partner" && userType != "Client" && userType != "Admin") {
        return res.status(400).send({
          status: false,
          msg: "Please enter usertype as admin, user, partner and client only",
        });
      }
    } else {
      return res
        .status(400)
        .send({ status: false, msg: "UserType is required" });
    }

    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);

    const userData = {
      name: name,
      email: email,
      password: hash,
      isAdmin: isAdmin,
      userType: userType,
    };
    const saveData = await userModel.create(userData);
    return res.status(201).send({
      status: true,
      msg: "User is created successfully",
      data: saveData,
    });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

//-------------------------Login User-----------------------------//
const loginUser = async function (req, res) {
  try {
    let { email, password } = req.body;

    if (Object.keys(req.body).length == 0) { return res.status(400).send({ status: false, message: "Please give some data" }); }

    if (!email && !password) {
      return res
        .status(400)
        .send({ staus: false, msg: "Email and Password is required" });
    }

    const users = await userModel.findOne({ email: email });
    if (!users) {
      return res.status(400).send({ status: false, msg: "Incorrect email" });
    }

    const comparePassword = await bcrypt.compare(password, users.password);
    if (!comparePassword) {
      return res.status(401).send({ status: false, msg: "Incorrect password" });
    }

    let token = jwt.sign({ userId: users._id }, "news", { expiresIn: 6000 });

    res.setHeader("x-api-key", token);

    return res
      .status(200)
      .send({ status: true, msg: "User logged in successsfully", data: token });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

//-------------------------------Get User Details------------------------------//
const getUserDetails = async function (req, res) {
  try {
    const userType = req.params.userType;

    const getData = await userModel.find({ userType });

    return res.status(200).send({ status: true, data: getData });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

//--------------------------------Update User Type--------------------------------//
const updateUserType = async function (req, res) {
  try {
    const decoded = req.decodedToken;
    console.log(decoded);
    const userId = decoded.userId;
    console.log(userId);
    const users = await userModel.findOne({ _id: userId });

    if (users.isAdmin != true) {
      return res.status(403).send({ status: false, msg: "Permission Denied" });
    } else {
      const { userId, userType } = req.body;

      if (Object.keys(req.body).length == 0) { return res.status(400).send({ status: false, message: "Please give some data" }); }
      
      if (userId) {
        if (!mongoose.isValidObjectId(userId)) {
          return res
            .status(400)
            .send({ status: false, msg: "Please provide valid userId" });
        }
      } else {
        return res
          .status(400)
          .send({ status: false, msg: "UserId is required" });
      }
      if (userType) {
        if (!validateString(userType)) {
          return res
            .status(400)
            .send({ status: false, msg: "UserType must be string" });
        }
        if (
          userType != "User" &&
          userType != "Client" &&
          userType != "Partner"
        ) {
          return res.status(400).send({
            status: false,
            msg: "Please provide usertype as client, partner and user only",
          });
        }
      } else {
        return res
          .status(400)
          .send({ status: false, msg: "UserType is required" });
      }

      const updatedUser = await userModel.findByIdAndUpdate(
        { _id: userId },
        { $set: { userType: userType } },
        { new: true }
      );

      return res.status(200).send({
        status: true,
        msg: "User updated successfully",
        data: updatedUser,
      });
    }
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

module.exports = { createUser, loginUser, getUserDetails, updateUserType };
