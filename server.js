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


// MongoDB setup using Mongoose
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})

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

app.use(express.urlencoded({extended: false}))
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

// home page get function
// app.get('/', async function(req, res) {
    // try {
    //     const userData = await User.find({id: req.user.id})
    //     res.render('dashboard.ejs', {data: userData})
    // } catch {
    //     res.redirect('/login')
    //     console.log("error occured in userData code")
    // }


    // const userData = await User.find({})
    // res.redirect('/login')
// })

app.get('/', function(req, res) {
    res.render('index.ejs')
})


// login get function
app.get('/login', function(req, res) {
    res.render('login.ejs')
})

//login post function
app.post('/login', async function(req, res) {
    const userData = await User.find({email: req.body.email, password: req.body.password})

    if(userData.length === 1) {
        console.log('userdata is a valid object')
        res.render('dashboard.ejs', {data: userData})
    } else {
        console.log('userdata is not a valid object')
        res.redirect('/')
    }  
})

// register get function
app.get('/register', function(req, res) {
    res.render('register.ejs')
})

// register post function
app.post('/register', async function(req, res) {
    try {
        const userData = await User.find({email: req.body.email})

        console.log(userData)

        if (emailValid.validate(req.body.email) && userData.length === 0) {
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
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
})

app.listen(process.env.PORT || 3000)