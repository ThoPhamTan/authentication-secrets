//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/userDB");

const UserSchema = new mongoose.Schema({
    email: String,
    password: String
});


UserSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = mongoose.model("User", UserSchema);


app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){


    // User.findOne({email: req.body.email}).then((result) => {
    //     if ( result ) {
    //         console.log("Email already exists. Go to login page");
    //         res.redirect("/login");
    //     } else {
            console.log("This is new registration");
            const newUser = new User({
                email: req.body.email,
                password: req.body.password
            });
            newUser.save().then(() => {
                console.log("Register successfully");
                res.render("secrets");
            }).catch((err) => {
                console.log(err);
            });
    //     }
    // });
});

app.post("/login", function(req, res){
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email: email}).then((result) => {
        console.log(result);
        if ( result.password === password ) {
            res.render("secrets");
        } else {
            console.log("Incorrect email or password");
            res.redirect("/login");
        }
    });
});







app.listen(3000, function(){
    console.log("Server is started on port 3000");
});