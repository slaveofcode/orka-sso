const fs = require('fs');
const passport = require('passport');
const { MultiSamlStrategy } = require('@node-saml/passport-saml');

const pubcert = fs.readFileSync(`./${process.env.SAML_CERT_FILE}`, "utf-8")
let privkey;

if (process.env.SAML_PRIVATE_FILE) {
  privkey = fs.readFileSync(`./${process.env.SAML_PRIVATE_FILE}`, "utf-8")
}

passport.serializeUser((user, done) => {
  console.log('serialize ', user)
  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log('deserialize ', user)
  done(null, user);
});

// see detail config param at: https://github.com/node-saml/passport-saml/#core
const providerConfig = {
  jumpcloud: {
    entryPoint: process.env.SAML_ENTRYPOINT,
    issuer: process.env.SAML_ISSUER_NAME,
    audience: process.env.SAML_AUDIENCE,
    callbackUrl: process.env.SAML_CALLBACK_URL, 
    cert: pubcert, // cert must be provided 
    signatureAlgorithm: process.env.SAML_SIGNATURE_ALG,
    privateKey: privkey,
    wantAssertionsSigned: false,
    wantAuthnResponseSigned: false,
    identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  },
  // another provider config here...
}

function findProvider(req, cb) {
  console.log('findProvider', req);
  const orgId = req.params.id;

  // TODO: find orgId on DB

  cb(null, providerConfig.jumpcloud)
}

function findByEmail(email, cb) {
  console.log('profile email', email)
  cb(null, { name: 'john' })
}

function findByNameID(nameId, cb) {
  console.log('profile name', nameId)
  cb(null, { name: 'john' })
}

const strategy = new MultiSamlStrategy(
    {
      passReqToCallback: false,
      additionalLogoutParams: {
        logout: true
      },
      logoutCallbackUrl: '/logout/success',
      getSamlOptions: function (request, done) {
        findProvider(request, function (err, providerConfig) {
          if (err) {
            return done(err);
          }
          return done(null, providerConfig);
        });
      },
    },
    // function (req, profile, done) { // if `passReqToCallback` is true, put `req` param at beginning
    function (profile, done) {
      // for signon
      // see here for more detail about `profile` object: https://github.com/node-saml/node-saml/blob/86a1654aea5d59460912f26a1ef11b666e0c5830/src/types.ts#L233
      console.log('profile on signon:', profile)
      findByEmail(profile.nameID, function (err, user) {
        if (err) {
          return done(err);
        }
        return done(null, user);
        // return done(new Error('dummy error'));
      });
    },
    // function (req, profile, done) { // if `passReqToCallback` is true, put `req` param at beginning
    function (profile, done) {
      // for logout
      console.log('profile on logout:', profile)
      findByNameID(profile.nameID, function (err, user) {
        if (err) {
          return done(err);
        }
        return done(null, user);
      });
    }
  )


passport.use('myMultiSaml', strategy);

module.exports = passport;

