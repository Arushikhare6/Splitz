const jwt = require('jsonwebtoken');

// ⚠️ THIS MUST MATCH THE SECRET IN YOUR auth.js FILE EXACTLY
const JWT_SECRET = "rasayans_secret_key_123";

const authMiddleware = (req, res, next) => {
  // 1. Get token from header
  const token = req.header('x-auth-token');

  // 2. Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Verify token
  try {
    // Use the specific secret key
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user from payload
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMiddleware;


// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//   // 1. Get token from header
//   const token = req.header('x-auth-token');

//   // 2. Check if no token
//   if (!token) {
//     return res.status(401).json({ msg: 'No token, authorization denied' });
//   }

//   // 3. Verify token
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Add user ID to request
//     next();
//   } catch (err) {
//     res.status(401).json({ msg: 'Token is not valid' });
//   }
// };

// module.exports = authMiddleware;