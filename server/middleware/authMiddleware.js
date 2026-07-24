const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token middleware
const protect = async (req, res, next) => {
  let token;


//   Check whether the request contains an Authorization header, and make sure it starts with Bearer. If both conditions are true, then the client has sent a Bearer token, so we can extract and verify the JWT."
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB (excluding password) and attach to req object
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists.',
        });
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Token failed or expired.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.',
    });
  }
};

// Restrict access to specific roles (e.g., authorize('Faculty', 'Admin'))
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this route.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };