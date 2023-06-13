require('dotenv').config()
const express = require('express');
const passport = require('./passport');

const app = new express();

app.use(express.urlencoded({
  extended: true,
}));
app.use(express.json({ limit: '15mb' }));
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
    failureRedirect: '/login/failed',
    failureFlash: true,
  }),
  (req, res) => {
  res.send('OK')
})

app.get('/login/sso', passport.authenticate('myMultiSaml', {
  successRedirect: '/login/success',
  failureRedirect: '/login/failed',
  additionalParams: { provider: 'jumpcloud'}
}))

app.get('/login/success', (req, res) => {
  res.send('SSO Success')
})

app.get('/login/failed', (req, res) => {
  res.send('SSO Failed')
})

app.listen(process.env.SERVER_PORT);

