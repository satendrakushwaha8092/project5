const express = require('express');
const mongoose = require("mongoose")
const router = express.Router();
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')

//================================USER===================================


router.post("/register", userController.createUser)
router.post("/login", userController.loginUser)
router.get("/user/:userId/profile", userController.getUser)
router.put("/user/:userId/profile", userController.userUpdate)


//============================PRODUCT====================================


router.post("/products", productController.createProduct)
router.get("/products/:productId", productController.getProductDetails)
router.put("/products/:productId", productController.updateTheProduct)


// =================================================================


module.exports = router