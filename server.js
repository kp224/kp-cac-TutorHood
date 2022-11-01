if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const User = require("./model/User.js");
const emailValid = require("email-validator");
const explicitTest = require("swearjar");

// MongoDB setup using Mongoose
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });

const db = mongoose.connection;

db.on("error", (error) => console.error(error));
db.once("open", (error) => console.log("Connected to Mongoose"));

const users = [];

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.set("views", __dirname + "/views");

app.get("/", function (req, res) {
  res.render("index.ejs");
});

// login get function
app.get("/login", function (req, res) {
  res.render("login.ejs");
});

//login post function
app.post("/login", async function (req, res) {
  var userDatay = await User.find({
    email: req.body.email,
    password: req.body.password,
  }).exec();
  var xy = await User.find({
    email: req.body.email,
    password: req.body.password,
  });
  var s = xy[0]._id.toString();
  if (userDatay.length === 1) {
    const currentUser = await User.findById(s).exec();
    currentUser.subject = req.body.optradio;

    await currentUser.save();

    req.flash("_id", s);

    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});

// dashboard get function
app.get("/dashboard", async function (req, res) {
  try {
    const userId = req.flash("_id")[0];
    const userData = await User.findById(userId).exec();

    const allUserData = await User.find({});

    const chosenSubject = userData.subject;

    if (userData.position === 1) {
      const qualifiedData = await User.findOne({
        position: 0,
        subject: chosenSubject,
      });
      res.render("dashboard.ejs", {
        data: userData,
        qualifiedUser: qualifiedData,
      });
    } else if (userData.position === 0) {
      const qualifiedData = await User.findOne({
        position: 1,
        subject: chosenSubject,
      });
      res.render("dashboard.ejs", {
        data: userData,
        qualifiedUser: qualifiedData,
      });
    }
  } catch {
    res.redirect("/login");
  }
});

// register get function
app.get("/register", function (req, res) {
  res.render("register.ejs");
});

// register post function
app.post("/register", async function (req, res) {
  try {
    const userData = await User.find({ email: req.body.email });

    if (
      emailValid.validate(req.body.email) &&
      userData.length === 0 &&
      explicitTest.profane(req.body.name) === false
    ) {
      users.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        position: req.body.optradio,
      });

      const user = new User({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        position: req.body.optradio,
      });

      req.session.user = users;
      req.session.save;

      user.save();

      res.redirect("/login");
    } else {
      res.redirect("/register");
    }
  } catch {
    res.redirect("/register");
  }
});

app.delete("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.listen(process.env.PORT || 3000);
