const userModel = require("../models/userModel")
const bcrypt = require('bcrypt')
const aws = require("../aws/aws.js")
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const multer = require('multer')


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidData2 = function (value) {
    if (typeof (value) === "string" && (value).trim().length === 0) return false
    return true
}


const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

// ============================================CREATE USER===============================================

const createUser = async function (req, res) {
    try {
        let dt = req.body
        let data = JSON.parse(dt.abcd)
        let files = req.files

        if (Object.keys(data) == 0) return res.status(400).send({
            status: false,
            msg: "No input provided"
        })


        if (!isValid(data.fname)) {
            return res.status(400).send({
                status: false,
                msg: "fname is required"
            })
        }


        if (!isValid(data.lname)) {
            return res.status(400).send({
                status: false,
                msg: "lname is required"
            })
        }

        if (!isValid(data.email)) {
            return res.status(400).send({
                status: false,
                msg: "email is required"
            })
        }

        if (!/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(data.email)) {
            return res.status(400).send({
                status: false,
                msg: "valid email is required"
            })
        }

        let dupliEmail = await userModel.findOne({ email: data.email })
        console.log(dupliEmail)
        if (dupliEmail) {
            return res.status(400).send({
                status: false,
                msg: "email is already exists"
            })
        }

        if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL = await aws.uploadFile(files[0])
            data.profileImage = uploadedFileURL;
        } else {
            return res.status(400).send({ msg: "profileImage is required" })
        }

        if (!isValid(data.phone)) {
            return res.status(400).send({
                status: false,
                msg: "phone number is required"
            })
        }

        if (!/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(data.phone)) {
            return res.status(400).send({
                status: false,
                msg: "valid phone number is required"
            })
        }

        let dupliPhone = await userModel.findOne({ phone: data.phone })
        if (dupliPhone) {
            return res.status(400).send({
                status: false,
                msg: "phone number already exits"
            })
        }

        if (!isValid(data.password)) {
            return res.status(400).send({
                status: false,
                msg: "password is required"
            })
        }


        if (data.password.length < 8 || data.password.length > 15) {
            return res.status(400).send({
                status: false,
                msg: "passowrd min length is 8 and max length is 15"
            })
        }


        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);


        if (!isValid(data.address)) {
            return res.status(400).send({
                status: false,
                msg: "Plz enter address"
            })
        }


        if (!isValid(data.address.shipping)) {
            return res.status(400).send({
                status: false,
                msg: "Plz enter shipping address"
            })
        }


        if (!isValid(data.address.billing)) {
            return res.status(400).send({
                status: false,
                msg: "Plz enter billing address"
            })
        }


        if (!isValid(data.address.shipping.street)) {
            return res.status(400).send({
                status: false,
                msg: "Plz enter shipping street"
            })
        }


        if (!isValid(data.address.shipping.city)) {
            return res.status(400).send({
                status: false,
                msg: "Plz enter shipping city"
            })
        }


        if (!/^[1-9]{1}[0-9]{5}$/.test(data.address.shipping.pincode)) {
            return res.status(400).send({
                status: false,
                msg: "Plz enter shipping pincode"
            })
        }


        if (!isValid(data.address.billing.street)) {
            return res.status(400).send({
                status: false,
                msg: "Plz enter billing street"
            })
        }


        if (!isValid(data.address.billing.city)) {
            return res.status(400).send({
                status: false,
                msg: "Plz enter billing city"
            })
        }


        if (!/^[1-9]{1}[0-9]{5}$/.test(data.address.billing.pincode)) {
            return res.status(400).send({
                status: false,
                msg: "Plz enter billing pincode"
            })
        }


        // ============================================================================================

        let savedData = await userModel.create(data)
        res.status(201).send({
            status: true,
            msg: "user created successfully",
            msg2: savedData
        })


    } catch (error) {
        res.status(500).send({
            status: false,
            msg: error.message
        })
    }
}

// =====================================LOGIN USER===========================================

const loginUser = async function (req, res) {
    try {
        let user = req.body

        if (Object.keys(user) == 0) {
            return res.status(400).send({
                status: false,
                msg: "please provide data"
            })
        }


        let email = req.body.email
        let password = req.body.password


        if (!email) {
            return res.status(400).send({
                status: false,
                msg: "email is required"
            })
        }


        if (!password) {
            return res.status(400).send({
                status: false,
                msg: "password is required"
            })
        }


        let userEmailFind = await userModel.findOne({ email: email })
        if (!userEmailFind) {
            return res.status(400).send({
                status: false,
                msg: "email or password are not matching"
            })
        };


        bcrypt.compare(password, userEmailFind.password, function (err, result) {
            if (result) {
                let token = jwt.sign({
                    userId: userEmailFind._id,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60
                }, "project5");

                res.status(200).send({
                    status: true,
                    message: "user login successfully",
                    data: {
                        userId: userEmailFind._id,
                        token: token
                    }
                });
            } else {
                return res.status(401).send({
                    status: true,
                    message: "plz provide correct password"
                })
            }
        })


    } catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }

}

// ==============================================GET USER============================================

const getUser = async function (req, res) {
    try {
        let userId = req.params.userId.trim()

        if (!isValidObjectId(userId)) {
            return res.status(400).send({
                status: false,
                msg: "path param is invalid"
            })
        }


        const findUser = await userModel.findById({ _id: userId })
        if (!findUser) {
            return res.status(404).send({
                status: false,
                msg: "userId is not present"
            })
        }

        return res.status(200).send({
            status: true,
            msg: "user found",
            data: findUser
        })


    } catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
}

// ==========================================UPDATE USER==============================================


const userUpdate = async function (req, res) {

    let dt = req.body
    let updatedData = JSON.parse(dt.abcd);
    const userId = req.params.userId

    if (!isValidObjectId(userId)) {
        return res.status(400).send({
            status: false,
            msg: "path param is invalid"
        })
    }


    const findUser = await userModel.findById({ _id: userId })
    if (!findUser) {
        return res.status(404).send({
            status: false,
            msg: "user is  not found"
        })
    }


    //=======================================fname validation=====================================


    if (Object.keys(updatedData) == 0) return res.status(400).send({
        status: false,
        msg: "No input provided"
    })

    if (!isValidData2(updatedData.fname)) {
        return res.status(400).send({
            status: false,
            Message: "First name is required"
        })
    }


    //===================================lname validation==========================================


    if (!isValidData2(updatedData.lname)) {
        return res.status(400).send({
            status: false,
            Message: "Last name is required"
        })
    }

    //================================email validation==============================================

    if (!isValidData2(updatedData.email)) {
        return res.status(400).send({
            status: false,
            Message: "email is required"
        })
    }

    if (updatedData.email) {
        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(updatedData.email))) return res.status(400).send({
            status: false,
            msg: "Please provide a valid email"
        });

        const isEmailUsed = await userModel.findOne({ email: updatedData.email })
        if (isEmailUsed) {
            return res.status(400).send({ status: false, msg: "email must be unique" })
        }
    }

    //=======================profile pic upload and validation==========================

    let saltRounds = 10
    const files = req.files


    if (files && files.length > 0) {

        const profilePic = await aws.uploadFile(files[0])

        updatedData.profileImage = profilePic

    }



    //===============================phone validation-========================================

    if (updatedData.phone) {
        if (!(/^([+]\d{2})?\d{10}$/.test(updatedData.phone))) return res.status(400).send({
            status: false,
            msg: "please provide a valid phone number"
        })

        const isPhoneUsed = await userModel.findOne({ phone: updatedData.phone })
        if (isPhoneUsed) {
            return res.status(400).send({
                status: false,
                msg: "phone number must be unique"
            })
        }
    }
    //======================================password validation-====================================

    if (!isValidData2(updatedData.password)) {
        return res.status(400).send({
            status: false,
            Message: "pasword is required"
        })
    }

    if (updatedData.password) {

        if (updatedData.password.length < 8 || updatedData.password.length > 15) {
            return res.status(400).send({
                status: false,
                msg: "passowrd min length is 8 and max length is 15"
            })
        }

        const encryptPassword = await bcrypt.hash(updatedData.password, saltRounds)

        updatedData.password = encryptPassword
    }


    //========================================address validation=================================

    if (!isValidData2(updatedData.address)) {
        return res.status(400).send({
            status: false,
            Message: "address is required like shipping and billing"
        })
    }

    if (!isValidData2(updatedData.address.shipping)) {
        return res.status(400).send({
            status: false,
            Message: "address of shiiping is required like street,city and pincode"
        })
    }

    if (!isValidData2(updatedData.address.billing)) {
        return res.status(400).send({
            status: false,
            Message: "address of billing is required like street,city and pincode"
        })
    }

    if (updatedData.address) {

        if (updatedData.address.shipping) {

            if (!isValid(updatedData.address.shipping.street)) {
                return res.status(400).send({ status: false, Message: "shipping street name is required" })
            }

            if (!isValid(updatedData.address.shipping.city)) {
                return res.status(400).send({ status: false, Message: "shipping city name is required" })
            }

            if (!isValid(updatedData.address.shipping.pincode)) {
                return res.status(400).send({ status: false, Message: "shipping pincode is required" })
            }

        }

        if (updatedData.address.billing) {
            if (!isValid(updatedData.address.billing.street)) {
                return res.status(400).send({ status: false, Message: "Please provide street name in billing address" })
            }

            if (!isValid(updatedData.address.billing.city)) {
                return res.status(400).send({ status: false, Message: "Please provide city name in billing address" })
            }

            if (!isValid(updatedData.address.billing.pincode)) {
                return res.status(400).send({ status: false, Message: "Please provide pincode in billing address" })
            }
        }
    }

    //=========================================update data=============================

    const updatedUser = await userModel.findOneAndUpdate({ _id: userId }, updatedData, { new: true })

    return res.status(200).send({ status: true, message: "User profile updated", data: updatedUser });

}


//==============================================================================================


module.exports.createUser = createUser
module.exports.loginUser = loginUser,
    module.exports.getUser = getUser,
    module.exports.userUpdate = userUpdate