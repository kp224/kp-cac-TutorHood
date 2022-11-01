if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const User = require('./model/User.js')
const emailValid = require('email-validator')
const explicitTest = require('swearjar')
// const connectFlash = require('connect-flash')


// MongoDB setup using Mongoose
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })

const db = mongoose.connection

db.on('error', error => console.error(error))
db.once('open', error => console.log('Connected to Mongoose'))


// const initializePassport = require('./passport-config')
// initializePassport(
//     passport,
//     email => users.find(user => user.email === email),
//     id => users.find(user => user.id === id)
// )

const users = []

app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/public'));

app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.set('views', __dirname + '/views')

app.get('/', function (req, res) {
    res.render('index.ejs')
})


// login get function
app.get('/login', function (req, res) {
    res.render('login.ejs')
})

//login post function
app.post('/login', async function (req, res) {
    var userDatay = await User.find({ email: req.body.email, password: req.body.password }).exec();
    var xy = await User.find({ email: req.body.email, password: req.body.password })
    var s = xy[0]._id.toString()
    console.log(s)
    if (userDatay.length === 1) {
        console.log('userdata is a valid object')
        // res.render('dashboard.ejs', {data: userData})

        
        console.log(xy)
        const currentUser = await User.findById(s).exec();
        
        currentUser.subject = req.body.optradio;
        await currentUser.save();
        console.log(currentUser);


        req.flash('_id', s)

        // userData.subject = req.body.optradio;

        // await userData.save();

        // console.log(userData)

        res.redirect('/dashboard')

    } else {
        console.log('userdata is not a valid object')
        res.redirect('/login')
    }
})


// dashboard get function
app.get('/dashboard', async function (req, res) {

    const userId = req.flash('_id')[0]
    const userData = await User.findById(userId).exec();


    // const storedEmail = (req.flash('email')[0])
    // const userData = await User.find({ email: storedEmail })

    console.log('fjdaslkfjokejfaoisf',userData)


    const allUserData = await User.find({})
    // console.log(allUserData)



    const chosenSubject = req.body.optradio



    if (userData.position === 1) {
        console.log("student")
        const qualifiedData = await User.findOne({position: 1, subject: chosenSubject})
        res.render('dashboard.ejs', {data: userData, qualifiedUser: qualifiedData})
    } else if (userData.position === 0) {
        console.log("teacher")
        const qualifiedData = await User.findOne({position: 0, subject: chosenSubject})
        res.render('dashboard.ejs', {data: userData, qualifiedUser: qualifiedData})
    }

    







    // res.render('dashboard.ejs', { data: userData, allUser: allUserData })



})

// dashboard post function
app.post('/dashboard', async function (req, res) {
    console.log(req.body.optradio)

    // 1 - English
    // 2 - History
    // 3 - Language
    // 4 - Science
    // 5 - Math
    // 6 - Computer Science

    //subject chosen is

    const x = req.body.optradio

    if (userData.position === 1) {
        print("student")

        const qualifiedData = await User.find({ position: 1, subject: x })
    } else if (userData.position === 0) {
        print("teacher")

        const qualifiedData = await User.find({ position: 0, subject: x })
    }
})



// register get function
app.get('/register', function (req, res) {
    res.render('register.ejs')
})

// register post function
app.post('/register', async function (req, res) {
    try {
        const userData = await User.find({ email: req.body.email })

        console.log(userData)

        if (emailValid.validate(req.body.email) && userData.length === 0 && explicitTest.profane(req.body.name) === false) {
            users.push({
                id: Date.now().toString(),
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                position: req.body.optradio
            })

            const user = new User({
                id: Date.now().toString(),
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                position: req.body.optradio
            })

            req.session.user = users;
            req.session.save;

            user.save()

            res.redirect('/login')
        } else {
            res.redirect('/register')
        }

    } catch {
        res.redirect('/register')
    }
})

app.delete('/logout', function (req, res) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
})

app.listen(process.env.PORT || 3000)