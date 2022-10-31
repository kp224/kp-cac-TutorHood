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

// MongoDB setup using Mongoose
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})

const db = mongoose.connection

db.on('error', error => console.error(error))
db.once('open', error => console.log('Connected to Mongoose'))

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

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
app.get('/', checkAuthenticated, function(req, res) {
    res.render('index.ejs', {name: req.user.name})
})

// login get function
app.get('/login', checkNotAuthenticated, function(req, res) {
    res.render('login.ejs')
})

// login post function
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

// register get function
app.get('/register', checkNotAuthenticated, function(req, res) {
    res.render('register.ejs')
})

// register post function
app.post('/register', checkNotAuthenticated, async function(req, res) {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            position: req.body.optradio
        })

        res.redirect('/login')

    } catch {
        res.redirect('/register')
        console.log('did not work')
    }
    console.log(users)
})

app.delete('/logout', function (req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
})

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(process.env.PORT || 3000)