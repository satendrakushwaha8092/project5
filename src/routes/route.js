const express = require('express');
const mongoose = require("mongoose")
const router = express.Router();
const userController = require('../controllers/userController')

router.post("/register", userController.createUser)
router.post("/login", userController.loginUser)
router.get("/user/:userId/profile", userController.getUser)
router.put("/user/:userId/profile", userController.userUpdate)

module.exports = router