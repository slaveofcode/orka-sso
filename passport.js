const fs = require('fs');
const passport = require('passport');
const { MultiSamlStrategy } = require('@node-saml/passport-saml');

const pubcert = fs.readFileSync("./pubcert.pem", "utf-8")

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

function findProvider(req, cb) {
  console.log('findProvider params:', req.params);
  const orgId = req.params.id;

  // TODO: find orgId on DB

  cb(null, { orgName: 'orka' })
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
      passReqToCallback: true,
      entryPoint: process.env.SAML_ENTRYPOINT,
      issuer: "passport-saml",
      //callbackUrl: "https://sso.orka.land/login/sso/callback",
      callbackUrl: process.env.SAML_CALLBACK_URL, 
      cert: pubcert, // cert must be provided 
      signatureAlgorithm: 'sha256',
      identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      getSamlOptions: function (request, done) {
        findProvider(request, function (err, provider) {
          if (err) {
            return done(err);
          }
          return done(null, provider.configuration);
        });
      },
    },
    function (req, profile, done) {
      // for signon
      findByEmail(profile.email, function (err, user) {
        if (err) {
          return done(err);
        }
        return done(null, user);
      });
    },
    function (req, profile, done) {
      // for logout
      findByNameID(profile.nameID, function (err, user) {
        if (err) {
          return done(err);
        }
        return done(null, user);
      });
    }
  )


passport.use(strategy);

module.exports = passport;

