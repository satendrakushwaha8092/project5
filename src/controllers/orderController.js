const cartModel = require("../models/cartModel")
const mongoose = require('mongoose')
const userModel = require("../models/userModel")
const orderModel = require("../models/orderModel")

const isValidData = function (value) {
    if (typeof (value) === "string" && (value).trim().length === 0) return false
    return true
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const isValidStatus = function (orderstatus) {
    return ["pending", "completed", "cancled"].indexOf(orderstatus) !== -1
}

const isBoolean = function (isDeleted) {
    return [true, false].indexOf(isDeleted) !== -1
}

// ============================================CREATE ORDER===============================================

const createorder = async function (req, res) {
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

        if (await orderModel.findOne({ userId: userId })) {
            return res.status(400).send({
                status: false,
                msg: "order is already created update order"
            })
        }


        let data = req.body
        data.userId = userId

        let finditems = await cartModel.findOne({ userId: data.userId })
        data.items = finditems.items
        data.totalPrice = finditems.totalPrice

        let quantity = 0
        for (let i = 0; i < data.items.length; i++) {
            quantity = quantity + data.items[i].quantity

        }
        data.totalItems = finditems.totalItems
        data.totalQuantity = quantity


        if (data.isDeleted == true) {
            data.deletedAt = new Date()
        }
        // ============================================================================================

        let savedData = await orderModel.create(data)
        res.status(201).send({
            status: true,
            msg: "order created successfully",
            msg2: savedData
        })


    } catch (error) {
        res.status(500).send({
            status: false,
            msg: error.message
        })
    }
}

// ============================================UPDATE ORDER===============================================

const updateorder = async function (req, res) {
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

        if (!await orderModel.findOne({ userId: userId })) {
            return res.status(400).send({
                status: false,
                msg: "order is not present"
            })
        }

        let data = req.body

        let finditems = await cartModel.findOne({ userId: userId })
        data.items = finditems.items
        data.totalPrice = finditems.totalPrice

        let quantity = 0
        for (let i = 0; i < data.items.length; i++) {
            quantity = quantity + data.items[i].quantity

        }
        data.totalItems = data.items.length
        data.totalQuantity = quantity

        if (!isValidData(data.cancellable)) {
            return res.status(400).send({ status: false, message: 'cancellable value is reqd' })
        }

        if (data.cancellable) {
            if (!isBoolean(data.cancellable)) {
                return res.status(400).send({ status: false, message: 'cancellable is true or false' })
            }
        }

        if (!isValidData(data.status)) {
            return res.status(400).send({ status: false, message: 'status value is reqd' })

        }

        if (data.status) {
            if (!isValidStatus(data.status.trim())) {
                return res.status(400).send({ status: false, message: 'status should be pending, completed, cancled' })
            }
        }

        let findstatus = await orderModel.findOne({ userId: userId })
        if (data.cancellable == true) {
            if (findstatus.status == "completed") {
                return res.status(400).send({ status: false, msg: "you can not make status complete because order is already cancelled" })
            }

            if (findstatus.status == "cancled") {
                    return res.status(400).send({ status: false, msg: "you can not make status cancel because order is already cancelled" })
            }
        }

        if (!isValidData(data.isDeleted)) {
            return res.status(400).send({ status: false, message: 'isDeleted value is reqd' })
        }
        if (data.isDeleted) {

            if (!isBoolean(data.isDeleted)) {
                return res.status(400).send({ status: false, message: 'isDeleted is true or false' })
            }
        }

        if (data.isDeleted == true) {
            data.deletedAt = new Date()
        }
        let savedData = await orderModel.findOneAndUpdate({ userId: userId }, data, { new: true })
        res.status(201).send({
            status: true,
            msg: "order updated successfully",
            msg2: savedData
        })



    } catch (error) {
        res.status(500).send({
            status: false,
            msg: error.message
        })
    }
}

module.exports.createorder = createorder
module.exports.updateorder = updateorder
