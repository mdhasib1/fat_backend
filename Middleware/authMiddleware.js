const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");


const protect = asyncHandler(async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
  
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer')) {
      return res.status(401).json({ error: 'Not authorized, no token.' });
    }
  
    const token = authorizationHeader.split(' ')[1];
  
    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            req.user = user;
            next();
          });
    } catch (error) {
      console.error('Token Verification Error:', error);
      res.status(401).json({ error: 'Not authorized, token failed.' });
    }
  });
  
  const admin = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
  
    if (!authorizationHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }
  
    const token = authorizationHeader.split(' ')[1];
    const role = jwt.decode(token);

    console.log(role)
  
    try {
      // Verify the token without decoding the entire payload
      const role = jwt.decode(authorizationHeader);

      console.log(role)
  
      // Check if the user is an admin
      if (role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized as an admin' });
      }
  
      // User is an admin, proceed
      next();
    } catch (error) {
      console.log(error);
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
  
  
  
  const checkStatus = (status) => asyncHandler(async (req, res, next) => {
    const user = req.user;
    if (user.status !== status) {
      res.status(403);
      throw new Error("Not authorized for this status");
    }
    next();
  });
  


module.exports = { protect, admin, checkStatus };
