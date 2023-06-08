//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption"); Level 2
// const md5 = require("md5"); Level 3
// const bcrypt = require("bcrypt"); Level 4
// const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(session({
    secret: "This is my secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB");

const UserSchema = new mongoose.Schema({
    email: String,
    password: String
});

// UserSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});
UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", UserSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/secrets", function(req, res){
    // console.log("redirected to secrets");
    if (req.isAuthenticated()) {
        // console.log("I'm in secrets");
        res.render("secrets");
    } else {
        // console.log("Why I'm here?");
        res.redirect("/login");
    }
});

app.get("/logout", function(req, res){
    req.logout((err) => {
        if ( err ) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
});

app.post("/register", function(req, res){
    // console.log("In register page");
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if ( err ){
            console.log(err);
            // console.log("register fail");
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                // console.log("register ok");
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login", function(req, res){

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if (err){
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
});

app.listen(3000, function(){
    console.log("Server is started on port 3000");
});