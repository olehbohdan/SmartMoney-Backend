import jwt from 'jsonwebtoken';  // Use import for jsonwebtoken

// Export the middleware function using export default
export default function(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify token using JWT secret
    req.user = decoded.user;  // Attach decoded user information to the request object
    next();  // Continue to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};