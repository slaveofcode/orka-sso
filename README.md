# Example SAML 2.0

## Generate Private Key

> openssl genrsa -out private.pem 2048

## Generate Public Certificate

> openssl req -new -x509 -sha256 -key private.pem -out cert.pem -days 1095
