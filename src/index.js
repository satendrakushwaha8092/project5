const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const { default: mongoose } = require('mongoose');
const app = express();
const multer = require("multer")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any())

mongoose.connect("mongodb+srv://Satendrakushwaha:LR42b0N3nw0xCgNl@cluster0.pa1oj.mongodb.net/groupXDatabase?authSource=admin&replicaSet=atlas-c5v59u-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true", {    
    useNewUrlParser: true
    })
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use('/', route);


app.listen(process.env.PORT || 3000, function() {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});