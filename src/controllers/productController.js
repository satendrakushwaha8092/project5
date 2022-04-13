const productModel = require("../models/productModel")
const aws = require("../aws/aws.js")
const mongoose = require('mongoose')

// ==================================VALIDATION===============================================

const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


const isValidData = function(value) {
    if (typeof(value) === "string" && (value).trim().length === 0) { return false }

    return true
}


// =========================================================================================


const createProduct = async function(req, res) {
    try {
        let data = req.body;

        let { title, description, price } = data

        let files = req.files


        if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL = await aws.uploadFile(files[0])
            data.productImage = uploadedFileURL;
        } else {
            res.status(400).send({ status: false, msg: "productImage is required" })
        }


        if (Object.keys(data).length == 0) {
            res.status(400).send({
                status: false,
                msg: "BAD REQUEST"
            })
            return
        }


        if (!isValid(title)) {
            res.status(400).send({
                status: false,
                msg: "Title is mandatory"
            })
            return
        }


        let isTitleAlreadyExists = await productModel.findOne({ title })
        if (isTitleAlreadyExists) {
            res.status(400).send({
                status: false,
                msg: "This title already exists"
            })
            return
        }


        if (!isValid(description)) {
            res.status(400).send({
                status: false,
                msg: "Description is mandatory"
            })
            return
        }


        if (!isValid(price)) {
            res.status(400).send({
                status: false,
                msg: "Price is mandatory"
            })
            return
        }


        if (!(/(\-?\d+\.?\d{0,2})/.test(price))) {
            res.status(400).send({
                status: false,
                msg: "Invalid Price Number"
            })
            return
        }
        let availableSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]

        if (!availableSizes.includes(data.availableSizes.trim())) return res.status(400).send({
            status: false,
            msg: "availableSizes should be from [S, XS, M, X, L, XXL, XL]"
        })
        else {
            let createdProduct = await productModel.create(data)
            return res.status(201).send({
                status: true,
                msg: "Product Successfully Created",
                data: createdProduct
            })

        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, msg: error.message });
    }
};
//===============================GET BY QUERY==================================

const productsDetails = async function(req, res) {

    try {

        const requestQuery = req.query

        const { size, name, priceGreaterThan, priceLessThan, priceSort } = requestQuery

        const finalFilter = [{ isDeleted: false }]

        if (validator.isValidString(name)) {
            finalFilter.push({ title: { $regex: name, $options: 'i' } })
        }
        if (validator.isValidString(size)) {
            if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size))) {
                return res.status(400).send({ status: false, message: "please enter valid size  " })
            }
            finalFilter.push({ availableSizes: size })
        }

        if (validator.isValidNumber(priceGreaterThan)) {

            finalFilter.push({ price: { $gt: priceGreaterThan } })
        }
        if (validator.isValidNumber(priceLessThan)) {

            finalFilter.push({ price: { $lt: priceLessThan } })
        }

        // if there is a price to sort 
        if (validator.isValidNumber(priceSort)) {

            if (priceSort != 1 || priceSort != -1) {
                return res.status(400).send({ status: false, message: "pricesort must to 1 or -1" })
            }
            const fillteredProductsWithPriceSort = await productModel.find({ $and: finalFilter }).sort({ price: priceSort })

            if (Array.isArray(fillteredProductsWithPriceSort) && fillteredProductsWithPriceSort.length === 0) {
                return res.status(404).send({ status: false, message: "data not found" })
            }

            return res.status(200).send({ status: false, message: "products with sorted price", data: fillteredProductsWithPriceSort })
        }

        //   
        const fillteredProducts = await productModel.find({ $and: finalFilter })

        if (Array.isArray(fillteredProducts) && fillteredProducts.length === 0) {
            return res.status(404).send({ status: false, message: "data not found" })
        }

        return res.status(200).send({ status: false, message: "products without sorted price", data: fillteredProducts })


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}

//=============================GET PRODUCT======================================


const getProductDetails = async function(req, res) {
    try {
        let productId = req.params.productId;


        if (!isValid(productId.trim().length == 0)) {
            res.status(400).send({ status: false, msg: "ProductId is required" })
            return
        }


        if (!isValidObjectId(productId)) {
            res.status(400).send({ status: false, msg: "Invalid ProductId" })
            return
        }


        let productData = await productModel.findById({ _id: productId })
        if (!productData) {
            res.status(404).send({
                status: false,
                msg: "No Product data found with this productId"
            })
            return


        } else {
            res.status(200).send({
                status: true,
                msg: "Congratulations",
                data: productData
            })
            return
        }


    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
};


//====================================UPDATE PRODUCT==============================================

const updateTheProduct = async function(req, res) {
    try {

        let productId = req.params.productId;



        if (!isValidObjectId(productId)) {
            res.status(400).send({ status: false, msg: "Invalid ProductId" })
            return
        }



        let data = req.body;

        let { title, description, price, style, availableSizes, installments } = data

        if (!isValidData(title)) {
            return res.status(400).send({ status: false, Message: "title can not be empty" })

        }
        const isTitleUsed = await productModel.findOne({ title: title })
        if (isTitleUsed) {
            return res.status(400).send({ status: false, msg: "title should be unique" })
        }




        if (!isValidData(description)) {
            return res.status(400).send({ status: false, msg: "description can not be empty" })
        }

        if (price) {
            if (!/(\-?\d+\.?\d{0,2})/.test(price)) {
                return res.status(400).send({ status: false, msg: "price can not be empty" })
            }
        }

        if (!isValidData(style)) {
            return res.status(400).send({ status: false, msg: "style can not be empty" })
        }




        if (!isValidData(availableSizes)) {
            return res.status(400).send({ status: false, msg: "availableSizes can not be empty" })
        }

        if (availableSizes) {
            let availableSize = ["S", "XS", "M", "X", "L", "XXL", "XL"]
            if (!availableSize.includes(availableSizes)) return res.status(400).send({
                status: false,
                msg: "availableSizes should be from [S, XS, M, X, L, XXL, XL]"
            })
        }

        if (!isValidData(installments)) {
            return res.status(400).send({ status: false, msg: "installments can not be empty" })
        }

        const files = req.files
        if (files) {
            if (files && files.length > 0) {
                const productImage = await aws.uploadFile(files[0])

                data.productImage = productImage;

            }
        }

        const dataMore = await productModel.findByIdAndUpdate({ _id: productId }, data, { new: true });

        return res.status(200).send({ status: true, msg: "updated book data", data: dataMore })


    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: error.message });

    }
}


const productDelete = async function(req, res) {
    try {

        let productId = req.params.productId.trim()


        if (!isValidObjectId(productId)) {

            return res.status(404).send({ status: false, msg: "Invalid ProductId" })
        }


        const productFind = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productFind) {
            return res.status(404).send({ status: false, msg: "productId is already deleted" })
        }


        const productDeleted = await productModel.findOneAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })
        return res.status(200).send({ status: true, msg: "product is deleted", data: productDeleted })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}






module.exports = {
    createProduct,
    productDelete,
    updateTheProduct,
    getProductDetails
}