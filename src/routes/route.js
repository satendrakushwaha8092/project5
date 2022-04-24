const express = require('express');
const mongoose = require("mongoose")
const router = express.Router();
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const auth = require('../middleware/auth')



//================================USER===================================


router.post("/register", userController.createUser)
router.post("/login", userController.loginUser)
router.get("/user/:userId/profile",auth.authentication, userController.getUser)
router.put("/user/:userId/profile", auth.authentication,userController.userUpdate)


//============================PRODUCT====================================


router.post("/products", productController.createProduct)
router.get("/products", productController.getProductByQuery)
router.get("/products/:productId", productController.getProductDetails)
router.put("/products/:productId", productController.updateTheProduct)
router.delete("/products/:productId", productController.productDelete)



// ==================================CART===========================


router.post("/users/:userId/cart",auth.authentication, cartController.createcart)
router.put("/users/:userId/cart", auth.authentication,cartController.updatecart)
router.get("/users/:userId/cart", auth.authentication,cartController.getcart)
router.delete("/users/:userId/cart",auth.authentication, cartController.deletecart)


// ============================ORDER=================================

router.post("/users/:userId/orders",auth.authentication, orderController.createorder)
router.put("/users/:userId/orders",auth.authentication, orderController.updateorder)



module.exports = router