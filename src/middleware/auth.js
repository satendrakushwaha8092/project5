/*const jwt = require('jsonwebtoken')



const authentication = async function (req, res, next) {

    try {
        const bearerHeader = req.header('Authorization', 'Bearer Token')

        if (!bearerHeader) {
            return res.status(400).send({ status: false, msg: "token is required" })
        }
        const bearer = bearerHeader.split(' ');
        const token = bearer[1];
        let decodetoken = jwt.verify(token, "project5")
        if (!decodetoken) {
            return res.status(401).send({ status: false, msg: "please enter the right token" })
        }

        req.userId = decodetoken.userId
        next()

    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })

    }


}

module.exports = { authentication }*/
const jwt = require("jsonwebtoken")

const authentication = async  function (req, res, next) {
    try {
        const token = req.headers['x-api-key']
        if (!token)
            return res.status(403).send({ status: false, msg: "Missing authentication token request" })

            const bearer = token.split(' ');
            const newtoken = bearer[1];
       const decodedToken =  jwt.verify(newtoken, 'project5')
       if (!decodedToken){
           res.status(403).send({status:false,msg:"invalid authentication request"})
           return
       }
       //res.setHeader("x-api-key", token);
       req.userId = decodedToken.userId;
       next()
    }catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}



module.exports.authentication=authentication

/*const jwt = require("jsonwebtoken")
const userModel = require("../models/userModel");


const authenticate = function (req, res, next) {
    try {
        let token = req.headers['x-api-key'];
        if (!token) token = req.headers["x-api-key"];
        if (!token) return res.status(404).send({ status: false, msg: "token must be present" });
        console.log(token);
        next()
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}



const authorise = async function (req, res, next) {

    try {
        let userId=req.params.userId
        user = await userModel.findById({_id:userId})
        if (!user) return res.status(400).send({status:false,msg:"user is not found"})

        let token = req.headers['x-api-key'];
        let decodedToken = jwt.verify(token, 'project5')

        console.log(decodedToken)
        console.log(user)

        if (!decodedToken) return res.staus(404).send({ status: false, msg: "token is not valid" })
        if (decodedToken.userId != user._id) return res.status(400).send({ status: false, msg: 'User logged is not allowed to modify the requested users data' })

        next()
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}



module.exports.authenticate = authenticate
module.exports.authorise = authorise;*/