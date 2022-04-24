const aws = require('aws-sdk')

aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async(file) => {
        return new Promise(async function(resolve, reject) {
                //this function will upload file to aws and return the link
                let s3 = new aws.S3({ apiVersion: "2006-03-01" }) //we will be using s3 service of aws
                    // await uploadFile(file)
                var uploadParams = {
                    ACL: "public-read",
                    Bucket: "classroom-training-bucket", // HERE
                    Key: "sk/" + file.originalname, // HERE "satendra/smiley.jpg"
                    Body: file.buffer
                }

                s3.upload(uploadParams, function(err, data) {
                    if (err) {
                        return reject({ "error": err })
                    }

                    console.log(data)
                    console.log(" file uploaded succesfully ")
                    return resolve(data.Location) // HERE
                })

                // let data= await s3.upload(uploadParams)
                // if (data) return data.Location
                // else return "there is an error"

            }

        )
    }
    
module.exports.uploadFile = uploadFile