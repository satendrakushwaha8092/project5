// const userModel = require("../model/userModel")
// const bcrypt = require("bcrypt")
// const mongoose = require("mongoose")
// const aws = require("aws-sdk")
// const jwt = require("jsonwebtoken")
//     // AWS-S3 CONNECTION:
// aws.config.update({
//     accessKeyId: "AKIAY3L35MCRVFM24Q7U",
//     secretAccessKey: "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",
//     region: "ap-south-1"
// })

// let uploadFile = async(file) => {
//         return new Promise(async function(resolve, reject) {
//                 //this function will upload file to aws and return the link
//                 let s3 = new aws.S3({ apiVersion: "2006-03-01" }) //we will be using s3 service of aws
//                     // await uploadFile(file)
//                 var uploadParams = {
//                     ACL: "public-read",
//                     Bucket: "classroom-training-bucket", // HERE
//                     Key: "arnab/" + file.originalname, // HERE "radhika/smiley.jpg"
//                     Body: file.buffer
//                 }

//                 s3.upload(uploadParams, function(err, data) {
//                     if (err) {
//                         return reject({ "error": err })
//                     }

//                     console.log(data)
//                     console.log(" file uploaded succesfully ")
//                     return resolve(data.Location) // HERE
//                 })

//                 // let data= await s3.upload(uploadParams)
//                 // if (data) return data.Location
//                 // else return "there is an error"

//             }

//         )
//     }
//     // (1)API TO CREATE AWS LINKS:

// const writeFile = async function(req, res) {
//     try {
//         let files = req.files
//         if (files && files.length > 0) {
//             //upload to s3 and get the uploaded link
//             // res.send the link back to frontend/postman
//             let uploadedFileURL = await uploadFile(files[0])
//             res.status(201).send({ msg: "file uploaded succesfully", data: uploadedFileURL })
//         } else {
//             res.status(400).send({ msg: "No file found" })
//         }
//     } catch (err) {
//         res.status(500).send({ msg: err })
//     }
// }

// //## User APIs:
// // (1)### POST /register:
// const createUser = async function(req, res) {
//     // Check req.body is empty or not
//     const data = req.body
//     try {
//         if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, msg: "please enter the details of the user" })
//             // check fname
//         if (!data.fname) return res.status(400).send({ status: false, msg: "firstname of the user is not present" })
//         if (data.fname.trim().length == 0) return res.status(400).send({ status: false, msg: "enter the firstname in proper format" })
//             // check lname
//         if (!data.lname) return res.status(400).send({ status: false, msg: "lastname of the user is not present" })
//         if (data.lname.trim().length == 0) return res.status(400).send({ status: false, msg: "enter the lastname in proper format" })
//             //check phone number
//         if (!data.phone) return res.status(400).send({ status: false, msg: "phone no. of the user is not present" })
//             // validation of phone number
//         if (!(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(data.phone.trim()))) {
//             return res.status(400).send({ status: false, msg: "phone no. is not in indian-format" })
//         }
//         //check phone no. is already registered or not 
//         let dupPhone = await userModel.findOne({ phone: data.phone.trim() })
//         if (dupPhone) return res.status(400).send({ status: false, msg: `${data.phone} is already registered` })
//             //check email
//         if (!data.email) return res.status(400).send({ status: false, msg: "email of the user is not present" })
//             // validation of email
//         if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(data.email.trim()))) return res.status(400).send({ status: false, msg: "email ID is not valid" })
//             //check email is already registered or not
//         let dupEmail = await userModel.findOne({ email: data.email.trim() })
//         if (dupEmail) return res.status(400).send({ status: false, msg: `${data.email} is already registered` })
//             // check password
//         if (!data.password) return res.status(400).send({ status: false, msg: "password of the user is not present" })
//             // validation of password
//         let validPass = data.password.trim().length >= 8 && data.password.trim().length <= 15
//         if (!validPass) return res.status(400).send({ status: false, msg: "Password length should be between 8 to 15" })
//             // encrypting the password:
//         const salt = await bcrypt.genSalt(10);
//         data.password = await bcrypt.hash(data.password, salt);
//         // check profileimage:
//         if (!data.profileImage) return res.status(400).send({ status: false, msg: "profileImage of the user is not present" })
//         if (!/^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/.test(data.profileImage.trim())) { return res.status(400).send({ status: false, msg: "photoImage is invalid" }) }
//         // check address
//         if (Object.keys(data).includes('address')) {
//             if (Object.keys(data.address).includes('shipping')) {
//                 if (!data.address.shipping.street) return res.status(400).send({ status: false, msg: 'shipping-street is mandatory' })
//                 if (data.address.shipping.street.trim().length == 0) return res.status(400).send({ status: false, msg: 'please provide the street name' })
//                 if (!data.address.shipping.city) return res.status(400).send({ status: false, msg: 'shipping-city is mandatory' })
//                 if (data.address.shipping.city.trim().length == 0) return res.status(400).send({ status: false, msg: 'please provide the city name' })
//                 if (!data.address.shipping.pincode) return res.status(400).send({ status: false, msg: 'shipping-pincode is mandatory' })
//                 if (data.address.shipping.pincode.trim().length == 0) return res.status(400).send({ status: false, msg: 'please provide the pincode' })
//             } else {
//                 return res.status(400).send({ status: false, msg: 'shipping is mandatory' })
//             }
//             if (Object.keys(data.address).includes('billing')) {
//                 if (!data.address.billing.street) return res.status(400).send({ status: false, msg: 'billing-street is mandatory' })
//                 if (data.address.billing.street.trim().length == 0) return res.status(400).send({ status: false, msg: 'please provide the street name' })
//                 if (!data.address.billing.city) return res.status(400).send({ status: false, msg: 'billing-city is mandatory' })
//                 if (data.address.billing.city.trim().length == 0) return res.status(400).send({ status: false, msg: 'please provide the city name' })
//                 if (!data.address.billing.pincode) return res.status(400).send({ status: false, msg: 'billing-pincode is mandatory' })
//                 if (data.address.billing.pincode.trim().length == 0) return res.status(400).send({ status: false, msg: 'please provide the pincode' })
//             } else {
//                 return res.status(400).send({ status: false, msg: 'billing is mandatory' })
//             }
//         } else {
//             return res.status(400).send({ status: false, msg: 'address is mandatory' })
//         }

//         let data = await userModel.create(data);
//         return res.status(201).send({ status: true, msg: "user is successfully created", data: data })
//     } catch (error) {
//         return res.status(500).send({ status: false, msg: error.message })
//     }
// }

// //(2) ## GET /user/:userId/profile :

// const isValidObjectId = function(ObjectId) {
//     return mongoose.Types.ObjectId.isValid(ObjectId)
// }
// const getUser = async function(req, res) {
//     try {
//         let userId = req.params.userId;
//         if (userId.trim().length == 0) return res.status(400).send({ status: false, msg: "please enter the details of the user" })
//         if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "invalid userId" })
//         const findUser = await userModel.findById({ _id: userId })
//         if (!findUser) return res.status(400).send({ status: false, msg: "this userId is not present" })
//         return res.status(200).send({ status: true, msg: "user profile found succesfully", data: findUser })
//     } catch (error) {
//         return res.status(500).send({ status: false, msg: error.message })
//     }
// }

// // (3)## PUT /user/:userId/profile:

// const updateUser = async function(req, res) {
//     try {
//         let data = req.body
//         let userId = req.params.userId

//         // if(!Object.keys(data).length>0) return res.status(400).send({status:true, message:"Please Provide Some data to update"})

//         if (!isValid2(data.fname)) {
//             res.status(400).send({ status: false, message: "First name can't be empty" })
//             return
//         }
//         if (!isValid2(data.lname)) {
//             res.status(400).send({ status: false, message: "last name can't be empty" })
//             return
//         }
//         if (!isValid2(data.email)) {
//             res.status(400).send({ status: false, message: "Email Id can't be empty" })
//             return
//         }
//         if (!isValid2(data.profileImage)) {
//             res.status(400).send({ status: false, message: "profileImage Link can't be empty" })
//             return
//         }
//         if (!isValid2(data.phone)) {
//             res.status(400).send({ status: false, message: "Mobile No. can't be empty" })
//             return
//         }
//         if (!isValid2(data.password)) {
//             res.status(400).send({ status: false, message: "Password can't be empty" })
//             return
//         }
//         // if (!isValid2(data.address.shipping.street)) {
//         //     res.status(400).send({ status: false, message: "Shipping Street name can't be empty" })
//         //     return
//         //   }
//         // if (!isValid2(data.address.shipping.city)) {
//         //     res.status(400).send({ status: false, message: "Shipping City name can't be empty" })
//         //     return
//         //   }
//         // if (!isValid2(data.address.billing.street)) {
//         //     res.status(400).send({ status: false, message: "billing Street name can't be empty" })
//         //     return
//         //   }
//         // if (!isValid2(data.address.billing.city)) {
//         //     res.status(400).send({ status: false, message: "billing City name can't be empty" })
//         //     return
//         //   }
//         if (data.email && !(isValidEmail.test(data.email))) {
//             res.status(400).send({ status: false, message: 'please provide valid Email ID' })
//             return
//         }
//         if (data.password && !(isValidPassword.test(data.password))) {
//             res.status(400).send({ status: false, message: 'please provide valid password(minLength=8 , maxLength=15)' })
//             return
//         }
//         if (data.phone && !(isValidPhoneNo.test(data.phone))) {
//             res.status(400).send({ status: false, message: 'please provide valid Mobile no.' })
//             return
//         }
//         if (data.password) {
//             const salt = bcrypt.genSaltSync(10);
//             const encryptedPass = await bcrypt.hash(data.password, salt);

//             data.password = encryptedPass
//         }

//         const isEmailPresent = await UserModel.findOne({ email: data.email })
//         if (isEmailPresent) {
//             res.status(400).send({ status: false, message: "This email is already present you can't upadate it" })
//         }
//         const isPhonePresent = await UserModel.findOne({ phone: data.phone })
//         if (isPhonePresent) {
//             res.status(400).send({ status: false, message: "This Mobile No. is already present you can't upadate it" })
//         }

//         let userData = await UserModel.findOneAndUpdate(userId, data, { new: true })
//         res.status(200).send({ status: true, message: "User profile updated", data: userData });


//     } catch (err) {
//         res.status(500).send({ status: false, message: err.message })
//     }
// }


// module.exports.createUser = createUser;
// module.exports.writeFile = writeFile;
// module.exports.getUser = getUser;
// module.exports.updateUser = updateUser;




// const updateProduct = async function(req, res) {
//     try {

//         let data = req.body;
//         let productId = req.params.productId;

//         const { title, description, price, currencyId, currencyFormat, productImage } = data

//         if (!isValid(data.length == 0)) {
//             res.status(400).send({
//                 status: false,
//                 msg: "Input via body is required"
//             })
//             return
//         }


//         if (!isValid(productId.length == 0)) {
//             res.status(400).send({
//                 status: false,
//                 msg: "productId is required"
//             })
//             return
//         }


//         if (!isValidObjectId(productId)) {
//             res.status(400).send({
//                 status: false,
//                 msg: "Invalid ProductId"
//             })
//             return
//         }


//         let productUpdatedData = await productModel.findById({ _id: productId, isDeleted: false })

//         if (!isValid(productUpdatedData)) {
//             res.status(404).send({
//                 status: false,
//                 msg: "No user data found with this Id"
//             })
//             return

//         } else {
//             await productModel.findByIdAndUpdate({ _id: productId, isDeleted: false }, data, { new: true })
//             let updateDetails = await productModel.find({ _id: productId })
//             res.status(200).send({
//                 status: true,
//                 msg: "Data updated Successfully",
//                 data: updateDetails
//             })
//             return
//         }




//     } catch (error) {
//         res.status(500).send({ status: false, msg: error.message });
//     }

// }