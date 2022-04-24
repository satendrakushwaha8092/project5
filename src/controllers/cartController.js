const mongoose = require('mongoose')
const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

// ============================================CREATE CART===============================================

const createcart = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!isValidObjectId(userId)) {
            return res.status(400).send({
                status: false,
                msg: "userId is not valid"
            })
        }

        if (!await userModel.findOne({ _id: userId })) {
            return res.status(400).send({
                status: false,
                msg: "userId is not present"
            })
        }


        let data = req.body
        data.userId = userId

        let isUserIdAlreadyUsed = await cartModel.findOne({ userId: data.userId })
        if (isUserIdAlreadyUsed) {
            return res.status(400).send({
                status: false,
                msg: "cart has  been made with this user id go and add items"
            })
        }

        for (let i = 0; i < data.items.length; i++) {
            if (!isValid(data.items[i].productId)) {
                return res.status(400).send({
                    status: false,
                    msg: "productId is mandatory"
                })
            }
            if (!isValidObjectId(data.items[i].productId)) {
                return res.status(400).send({
                    status: false,
                    msg: "productId is not valid"
                })
            }
            if (!await productModel.findById({ _id: data.items[i].productId, isDeleted: false })) {
                return res.status(400).send({
                    status: false,
                    msg: "productId is not present"
                })
            }

            if (!isValid(data.items[i].quantity)) {
                return res.status(400).send({
                    status: false,
                    msg: "quantity is mandatory"
                })
            }
            if (!isValidObjectId(data.items[i].quantity)) {
                return res.status(400).send({
                    status: false,
                    msg: "quantity is not valid"
                })
            }


            for (let j = 0; j < data.items.length; j++) {
                if (i != j) {
                    if (data.items[i].productId == data.items[j].productId) {
                        return res.status(400).send({
                            status: false,
                            msg: `${data.items[i].productId} you are added this product update quantity`
                        })
                    }
                }
            }
            let availableQuantity = (await productModel.findById({ _id: data.items[i].productId })).installments

            if (availableQuantity < data.items[i].quantity) {
                return res.status(400).send({
                    status: false,
                    msg: `${data.items[i].productId} product is out of stock`,
                    availableQuantity: `${availableQuantity}`
                })
            }

            if (data.items[i].quantity < 1) {
                return res.status(400).send({
                    status: false,
                    msg: `${data.items[i].productId} product quantity is  must min 1`
                })
            }
        }


        data.totalPrice = 0
        data.totalItems = 0
        let price = 0
        //let quantity = 0
        for (let i = 0; i < data.items.length; i++) {
            let findprice = await productModel.findById({ _id: data.items[i].productId })
            price = price + findprice.price * data.items[i].quantity  //calculating price productwise and calculate total price
            data.totalPrice = price  //assigning total price
        }

        data.totalItems = data.items.length  //calculating items and assigned in total items



        // ============================================================================================

        let savedData = await cartModel.create(data)
        res.status(201).send({
            status: true,
            msg: "cart created successfully",
            msg2: savedData
        })


    } catch (error) {
        res.status(500).send({
            status: false,
            msg: error.message
        })
    }
}

// ============================================UPDATE CART===============================================

const updatecart = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!isValidObjectId(userId)) {
            return res.status(400).send({
                status: false,
                msg: "userId is not valid"
            })
        }
        if (!await userModel.findOne({ _id: userId })) {
            return res.status(400).send({
                status: false,
                msg: "userId is not present"
            })
        }

        if (!await cartModel.findOne({ userId: userId })) {
            return res.status(400).send({
                status: false,
                msg: "cart is not present"
            })
        }


        let data = req.body

        for (let i = 0; i < data.items.length; i++) {
            if (!isValid(data.items[i].productId)) {
                return res.status(400).send({
                    status: false,
                    msg: "productId is mandatory"
                })
            }
            if (!isValidObjectId(data.items[i].productId)) {
                return res.status(400).send({
                    status: false,
                    msg: "productId is not valid"
                })
            }
            if (!await productModel.findById({ _id: data.items[i].productId, isDeleted: false })) {
                return res.status(400).send({
                    status: false,
                    msg: "productId is not present"
                })
            }

            if (!isValid(data.items[i].quantity)) {
                return res.status(400).send({
                    status: false,
                    msg: "quantity is mandatory"
                })
            }
            if (!isValidObjectId(data.items[i].quantity)) {
                return res.status(400).send({
                    status: false,
                    msg: "quantity is not valid"
                })
            }
            for (let j = 0; j < data.items.length; j++) {
                if (i != j) {
                    if (data.items[i].productId == data.items[j].productId) {
                        return res.status(400).send({
                            status: false,
                            msg: `${data.items[i].productId} you are added this product update quantity`
                        })
                    }
                }
            }
            let availableQuantity = (await productModel.findById({ _id: data.items[i].productId })).installments

            if (availableQuantity < data.items[i].quantity) {
                return res.status(400).send({
                    status: false,
                    msg: `${data.items[i].productId} product is out of stock`, availableQuantity: `${availableQuantity}`
                })
            }

            if (data.items[i].quantity < 1) {
                return res.status(400).send({
                    status: false,
                    msg: `${data.items[i].productId} product quantity is must min 1`
                })
            }
        }

        data.totalPrice = 0
        data.totalItems = 0
        let price = 0
        for (let i = 0; i < data.items.length; i++) {
            let findprice = await productModel.findById({ _id: data.items[i].productId })
            price = price + findprice.price * data.items[i].quantity
            data.totalPrice = price

        }
        data.totalItems = data.items.length


        // ============================================================================================

        let savedData = await cartModel.findOneAndUpdate({ userId: userId }, data, { new: true })
        res.status(201).send({
            status: true,
            msg: " cart updated successfully",
            msg2: savedData
        })


    } catch (error) {
        res.status(500).send({
            status: false,
            msg: error.message
        })
    }
}

// ============================================GET CART===============================================

const getcart = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!isValidObjectId(userId)) {
            return res.status(400).send({
                status: false,
                msg: "userId is not valid"
            })
        }
        if (!await cartModel.findOne({ userId: userId })) {
            return res.status(400).send({
                status: false,
                msg: "cart is not present"
            })
        }

        if (!await userModel.findOne({ _id: userId })) {
            return res.status(400).send({
                status: false,
                msg: "userId is not present"
            })
        }

        const cartdata = await cartModel.findOne({ userId: userId })
        return res.status(200).send({ status: true, msg: "success", data: cartdata })
    }
    catch (error) {
        res.status(500).send({
            status: false,
            msg: error.message
        })
    }
}

// ============================================DELETE CART===============================================

const deletecart = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!isValidObjectId(userId)) {
            return res.status(400).send({
                status: false,
                msg: "userId is not valid"
            })
        }
        if (!await cartModel.findOne({ userId: userId })) {
            return res.status(400).send({
                status: false,
                msg: "cart is not present"
            })
        }

        if (!await cartModel.findOne({ userId: userId, totalItems: totalItems = 0, totalPrice: totalPrice = 0 })) {
            return res.status(400).send({
                status: false,
                msg: "cart has some product"
            })
        }
        const cartDeleted = await cartModel.findOneAndDelete({ userId: userId }, { new: true })
        return res.status(200).send({ status: true, msg: "cart is deleted", data: cartDeleted })
    }
    catch (error) {
        res.status(500).send({
            status: false,
            msg: error.message
        })
    }
}


module.exports.createcart = createcart
module.exports.updatecart = updatecart
module.exports.getcart = getcart
module.exports.deletecart = deletecart
