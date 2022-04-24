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
        let dt = req.body;
        let data=JSON.parse(dt.product)
        let { title, description, price, currencyId, currencyFormat } = data
        let files = req.files


        if (Object.keys(data).length == 0) {
            return res.status(400).send({
                status: false,
                msg: "BAD REQUEST"
            })
        }


        if (!isValid(title)) {
            return res.status(400).send({
                status: false,
                msg: "Title is mandatory"
            })
        }


        let isTitleAlreadyExists = await productModel.findOne({ title })
        if (isTitleAlreadyExists) {
            return res.status(400).send({
                status: false,
                msg: "This title already exists"
            })
        }


        if (!isValid(description)) {
            return res.status(400).send({
                status: false,
                msg: "Description is mandatory"
            })
        }


        if (!isValid(price)) {
            return res.status(400).send({
                status: false,
                msg: "Price is mandatory"
            })
        }

        if (!(/(\-?\d+\.?\d{0,2})/.test(price))) {
            return res.status(400).send({
                status: false,
                msg: "Invalid Price Number"
            })
        }

        if (!isValid(currencyId)) {
            return res
                .status(400)
                .send({ status: false, message: "currencyId  is required" });
        }
        if (!isValid(currencyFormat)) {
            return res
                .status(400)
                .send({ status: false, message: "currency Format will be updated according to currency ID " });
        }


        if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL = await aws.uploadFile(files[0])
            data.productImage = uploadedFileURL;
        } else {
            return res.status(400).send({ status: false, msg: "productImage is required" })
        }

        // let availableSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]

        // if (!availableSizes)
        //     return res.status(400).send({
        //         status: false,
        //         msg: "availableSizes should be from [S, XS, M, X, L, XXL, XL]"
        //     })

        let createdProduct = await productModel.create(data)
        return res.status(201).send({
            status: true,
            msg: "Product Successfully Created",
            data: createdProduct
        })


    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, msg: error.message });
    }
};
//===============================GET BY QUERY==================================


const getProductByQuery = async(req, res) => {
    try {
        let { name, description, price, currencyId, currencyFormat, style, size, priceGreaterThan, priceLessThan, priceSort } = req.query;
        let myObj = {};
        if (name != null) myObj.name = name;
        if (description != null) myObj.description = description;
        if (price != null) myObj.price = price;
        if (currencyId != null) myObj.currencyId = currencyId;
        if (currencyFormat != null) myObj.currencyFormat = currencyFormat;
        if (style != null) myObj.style = style;
        if (size != null) myObj.size = size;
        if (priceGreaterThan != null) myObj.priceGreaterThan = priceGreaterThan;
        if (priceLessThan != null) myObj.priceLessThan = priceLessThan;
        if (priceSort != null) myObj.priceSort = priceSort;

        myObj.isDeleted = false;

        if (!Object.keys(req.query).length > 0) return res.status(400).send({ status: true, message: "Please Provide Product data in query" })

        if ("size" in myObj) {
            myObj['availableSizes'] = size
            if (size) {
                if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size)) {
                    return res.status(400).send({ status: false, message: "Size should be from [S, XS, M, X, L, XXL, XL]" })
                }
            }
        }


        if ("name" in myObj) {
            myObj['title'] = { $regex: name }
            if (!isValid(name)) {
                res.status(400).send({ status: false, message: "Product name can't be empty" })
                return
            }
        }

        if ("priceGreaterThan" in myObj && "priceLessThan" in myObj) {
            myObj['price'] = { $gte: priceGreaterThan }
            myObj['price'] = { $lte: priceLessThan }
            const productData = await productModel.find(myObj)
            res.status(200).send({ status: true, message: `Product between price ${priceGreaterThan} to ${priceLessThan}`, data: productData })
            return
        }

        if ("priceGreaterThan" in myObj) {
            myObj['price'] = { $gte: priceGreaterThan }
            const productData = await productModel.find(myObj)
            res.status(200).send({ status: true, message: `Product greater than ${priceGreaterThan}`, data: productData })
            return
        }

        if ("priceLessThan" in myObj) {
            myObj['price'] = { $lte: priceLessThan }
            const productData = await productModel.find(myObj)
            res.status(200).send({ status: true, message: `Product less than ${priceLessThan}`, data: productData })
            return
        }


        if ("priceSort" in myObj) {

            if (priceSort == 1) {
                const productData = await productModel.find(myObj).sort({ price: 1 })
                res.status(200).send({ status: true, message: "Data Found with Ascending price", data: productData })
                return
            }
            if (priceSort == -1) {
                const productData = await productModel.find(myObj).sort({ price: -1 })
                res.status(200).send({ status: true, message: "Data Found with Descending price", data: productData })
                return
            }
            if (!(priceSort === 1 || priceSort === -1)) {
                res.status(400).send({ status: false, message: "PriceSort Should be 1=(Ascending) or -1=(Descending)" })
                return
            }
        }

        const productData = await productModel.find(myObj)

        if (productData.length === 0) {
            res.status(404).send({ status: false, message: "Product Data not Found" })
            return
        }

        res.status(200).send({ status: true, message: "Data Found", data: productData })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
};

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


        let dt = req.body;
        let data=JSON.parse(dt.product)

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
            return res.status(400).send({ status: false, msg: "size can not be empty" })
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
        return res.status(200).send({ 
            status: true,
             msg: "updated product data", 
             data: dataMore 
            })


    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: error.message });

    }
}

//===============================DELETE PRODUCT=======================

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

//================================================================================================//

module.exports = {
    createProduct,
    getProductDetails,
    productDelete,
    updateTheProduct,
    getProductByQuery
}