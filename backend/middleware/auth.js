// const jwt = require('jsonwebtoken');

// /**
//  * JWT Authentication Middleware
//  * Assumes JWT token is passed in Authorization header as "Bearer <token>"
//  * Extracts userId and locality from token and attaches to req.user
//  */
// const protect = (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     try {
//       // Extract token from header
//       token = req.headers.authorization.split(' ')[1];

//       // Verify token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Attach user info to request
//       req.user = {
        

//         id: decoded.id,
//         locality: decoded.locality, // Assumes locality is in JWT payload
//         pincode: decoded.pincode,   // Assumes pincode is in JWT payload
//       };

//       next();
//     } catch (error) {
//       res.status(401).json({ message: 'Not authorized, token failed' });
//     }
//   }

//   if (!token) {
//     res.status(401).json({ message: 'Not authorized, no token' });
//   }
// };

// module.exports = { protect };

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer")
    ) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 FETCH USER FROM DB
    const user = await User.findById(decoded.id).select(
      "_id locality pincode name email"
    );

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user._id,
      city: decoded.city, 
      locality: user.locality,
      pincode: user.pincode,
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = { protect };
