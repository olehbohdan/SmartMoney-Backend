import jwt from 'express-jwt';  // Use import for express-jwt
import jwksRsa from 'jwks-rsa';  // Use import for jwks-rsa

const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the signing keys provided by Auth0
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://dev-rcywf4y1jwsrcvo1.us.auth0.com/.well-known/jwks.json`,
  }),
  audience: 'https://dev-rcywf4y1jwsrcvo1.us.auth0.com/api/v2/',
  issuer: `https://dev-rcywf4y1jwsrcvo1.us.auth0.com`,
  algorithms: ['RS256'],
});

export default checkJwt;  // Export the middleware function using export default