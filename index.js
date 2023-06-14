require('dotenv').config()
const express = require('express');
const passport = require('./passport');
const session = require('express-session')

const app = new express();

const sessConfig = {
  secret: process.env.SESSION_SECRET_KEY || 'im a flying panda',
  resave: false,
  saveUninitialized: true,
  cookie: {}
}

if (process.env.MODE === 'production') {
  app.disable('x-powered-by')
  app.enable('trust proxy');
  sessConfig.cookie.secure = true;
}

app.use(express.urlencoded({
  extended: true,
}));
app.use(express.json({ limit: '15mb' }));
// app.use(session(sessConfig)) // enable if `passReqToCallback` is `true` and `session` is `true`
app.use(passport.initialize());
//app.use(passport.session());

app.get('/ping', (req, res) => {
  res.json({
    alive: true,
    timestamp: new Date(),
  })
});

app.post('/login/sso/callback',
  passport.authenticate('myMultiSaml', {
    successRedirect: '/login/success',
    failureRedirect: '/login/failed',
    failureFlash: true,
    session: false,
  }),
  (req, res) => {
  res.send('OK')
})

app.get('/login/sso', passport.authenticate('myMultiSaml', {
  session: false,
  // successRedirect: '/login/success',
  // failureRedirect: '/login/failed',
}))

app.get('/login/success', (req, res) => {
  res.send('Login SSO Success')
})

app.get('/login/failed', (req, res) => {
  res.send('Login SSO Failed')
})

console.log(`server started at :${process.env.SERVER_PORT}`)

app.listen(process.env.SERVER_PORT);

