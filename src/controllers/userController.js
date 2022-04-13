const userModel = require("../models/userModel")
const bcrypt = require('bcrypt')
const aws = require("../aws/aws.js")
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const multer = require('multer')


const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

// ============================================CREATE USER===============================================

const createUser = async function(req, res) {
    try {
        let data = req.body
        let files = req.files

        if (Object.keys(data) == 0) return res.status(400).send({
            status: false,
            msg: "No input provided"
        })


        if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL = await aws.uploadFile(files[0])
            data.profileImage = uploadedFileURL;
        } else {
            res.status(400).send({ msg: "profileImage is required" })
        }


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


        // if (!/^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/.test(data.profileImage)) {
        //     return res.status(400).send({
        //         status: false,
        //         msg: "profileImage is required"
        //     })
        // }

        // profileImage = await aws.uploadFile(files[0])
        // console.log(profileImage)




        if (!/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(data.phone)) {
            return res.status(400).send({
                status: false,
                msg: "valid phone number is required"
            })
        }


        if (!/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(data.email)) {
            return res.status(400).send({
                status: false,
                msg: "valid email is required"
            })
        }


        if (!isValid(data.password)) {
            return res.status(400).send({
                status: false,
                msg: "Plz enter valid password"
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

        //  =================================== duplicate data =============================================



        let dupliPhone = await userModel.find({ phone: data.phone })
        if (dupliPhone.length > 0) {
            return res.status(400).send({
                status: false,
                msg: "phone number already exits"
            })
        }


        let dupliEmail = await userModel.find({ email: data.email })
        if (dupliEmail.length > 0) {
            return res.status(400).send({
                status: false,
                msg: "email is already exists"
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

const loginUser = async function(req, res) {
    try {
        let user = req.body

        if (Object.keys(user) == 0) {
            return res.status(400).send({
                status: false,
                msg: "please provide data"
            })
        }


        let userName = req.body.email
        let password = req.body.password


        if (!userName) {
            return res.status(400).send({
                status: false,
                msg: "userName is required"
            })
        }


        if (!password) {
            return res.status(400).send({
                status: false,
                msg: "password is required"
            })
        }


        let userEmailFind = await userModel.findOne({ email: userName })
        if (!userEmailFind) {
            return res.status(400).send({
                status: false,
                msg: "userName is not correct"
            })
        };


        bcrypt.compare(password, userEmailFind.password, function(err, result) {
            if (result) {
                let token = jwt.sign({
                    userId: userEmailFind._id,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60
                }, "rushi-159");

                const userData = {
                    userId: userEmailFind._id,
                    token: token
                }
                res.status(200).send({
                    status: true,
                    message: "user login successfully",
                    data: userData
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

const getUser = async function(req, res) {
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
                msg: "could not found"
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

// const userUpdate = async function(req, res) {
//     try {

//         let userId = req.params.userId


//         if (!isValidObjectId(userId)) {
//             return res.status(400).send({
//                 status: false,
//                 msg: "userId is invalid"
//             })
//         }


//         let data = req.body

//         const findUserData = await userModel.findById({ _id: userId })
//         if (!findUserData) {
//             return res.status(400).send({
//                 status: false,
//                 msg: "no user found"
//             })
//         }


//         const salt = await bcrypt.genSalt(10);
//         data.password = await bcrypt.hash(data.password, salt);


//         let updatedUser = await userModel.findOneAndUpdate({ _id: userId }, {data }, { new: true })
//         return res.status(200).send({
//             status: true,
//             msg: "user updated successfully",
//             data: updatedUser
//         })


//     } catch (error) {
//         return res.status(500).send({
//             status: false,
//             msg: error.message
//         })
//     }
// }




const userUpdate = async function(req, res) {

    let data = req.body;
    const userId = req.params.userId


    const { fname, lname, email, phone, password, address } = data

    const updatedData = {}


    //=======================================fname validation=====================================


    if (fname) {
        if (!isValid(fname)) {
            return res.status(400).send({ status: false, Message: "First name is required" })
        }
        updatedData.fname = fname
    }


    //===================================lname validation==========================================


    if (lname) {
        if (!isValid(lname)) {
            return res.status(400).send({ status: false, Message: "Last name is required" })
        }
        updatedData.lname = lname
    }

    //================================email validation==============================================


    if (email) {

        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email.trim()))) return res.status(400).send({ status: false, msg: "Please provide a valid email" });

        const isEmailUsed = await userModel.findOne({ email: email })
        if (isEmailUsed) {
            return res.status(400).send({ status: false, msg: "email must be unique" })
        }
        updatedData.email = email
    }


    //=======================profile pic upload and validation==========================

    let saltRounds = 10
    const files = req.files


    if (files && files.length > 0) {

        const profilePic = await aws.uploadFile(files[0])

        updatedData.profileImage = profilePic

    }



    //===============================phone validation-========================================

    if (phone) {

        if (!(/^([+]\d{2})?\d{10}$/.test(phone))) return res.status(400).send({ status: false, msg: "please provide a valid phone number" })

        const isPhoneUsed = await userModel.findOne({ phone: phone })
        if (isPhoneUsed) {
            return res.status(400).send({ status: false, msg: "phone number must be unique" })
        }
        updatedData.phone = phone
    }

    //======================================password validation-====================================


    if (password) {
        if (!isValid(password)) { return res.status(400).send({ status: false, message: "password is required" }) }
        //if (!(/^(?=.?[A-Z])(?=.?[a-z])(?=.?[0-9])(?=.?[#?!@$%^&*-]).{8,15}$/.test(data.password.trim()))) { return res.status(400).send({ status: false, msg: "please provide a valid password with one uppercase letter ,one lowercase, one character and one number " }) }

        const encryptPassword = await bcrypt.hash(password, saltRounds)

        updatedData.password = encryptPassword
    }


    //========================================address validation=================================

    if (address) {

        if (address.shipping) {

            if (!isValid(address.shipping.street)) {
                return res.status(400).send({ status: false, Message: "street name is required" })
            }
            updatedData["address.shipping.street"] = address.shipping.street


            if (!isValid(address.shipping.city)) {
                return res.status(400).send({ status: false, Message: "city name is required" })
            }

            updatedData["address.shipping.city"] = address.shipping.city

            if (!isValid(address.shipping.pincode)) {
                return res.status(400).send({ status: false, Message: "pincode is required" })
            }

            updatedData["address.shipping.pincode"] = address.shipping.pincode

        }

        if (address.billing) {
            if (!isValid(address.billing.street)) {
                return res.status(400).send({ status: false, Message: "Please provide street name in billing address" })
            }
            updatedData["address.billing.street"] = address.billing.street

            if (!isValid(address.billing.city)) {
                return res.status(400).send({ status: false, Message: "Please provide city name in billing address" })
            }
            updatedData["address.billing.city"] = address.billing.city

            if (!isValid(address.billing.pincode)) {
                return res.status(400).send({ status: false, Message: "Please provide pincode in billing address" })
            }
            updatedData["address.billing.pincode"] = address.billing.pincode
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




// const updatedData = async function(req, res) {
//     try {
//         let data = req.body;
//         let userId = req.params.userId;

//         if (!isValid(userId)) {
//             res.status(400).send({ status: false, msg: "UserId is required" })
//             return
//         }
//         if (!isValidObjectId(userId)) {
//             res.status(404).send({ status: false, msg: "Invalid UserId" })
//             return
//         }

//         let userUpdatedData = await userModel.findById({ _id: userId })

//         if (!isValid(userUpdatedData)) {
//             res.status(400).send({ status: false, msg: "No user data found with this userId" })
//             return
//         } else {
//             await userModel.findByIdAndUpdate({ _id: userId }, data, { new: true })
//             let updateDetails = await userModel.find({ _id: userId })
//             res.status(200).send({ status: true, msg: "Data updated Successfully", data: updateDetails })
//             return
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({ msg: error.message });
//     }
// };