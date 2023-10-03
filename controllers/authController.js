const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Email = require("../utils/sendEmail");
const path = require("path");
const fs = require("fs");
const bcrypt = require('bcrypt');


dotenv.config();

const generateAccessToken = (user) => {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role, 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  };


  const generateRefreshToken = (user) => {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' } 
    );
  };
  
  
  


exports.register = async (req, res) => {
  const { email, password,name } = req.body;
  const existingUser = await User.findByEmail(email);

  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  const saltRounds = 10; 
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = new User({
    name,
    email,
    password:hashedPassword,
  });

  User.create(newUser, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Registration failed' });
    }
    const token = generateAccessToken({ id: user.id, email: user.email });

    
    const logoImagePath = path.join(__dirname, 'logo.png');
    const logoImage = fs.readFileSync(logoImagePath).toString('base64');
  
    const logoAttachment = {
      content: logoImage,
      filename: 'logo.png',
      type: 'image/png',
      disposition: 'inline',
      content_id: 'logo@pawcert.com',
    };





  // Send verification email
  const message = `

  <!DOCTYPE html>
<html>
<head>
  <title>Email Verification - PawCert.com</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.5;
      background-color: #f4f4f4;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border: 1px solid #ddd;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }
    
    .logo {
      text-align: center;
      margin-bottom: 20px;
      width:250px;
      margin:0 auto;
    }

    .logo img{
      width:100%;
      margin:auto;
    }
    .logo h3{
      text-align: center;
    }
    
    h1 {
      color: #333;
      text-align: center;
      margin-bottom: 20px;
    }
    
    .content {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: #ffffff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #4CAF50;
      color: #fff;
      text-decoration: none;
      border-radius: 4px;
    }
    
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="cid:logo@pawcert.com" alt="Logo">
      <h3>FAT STOGIES Cigar</h3>
    </div>
    <h1>Thanks for Registering at FAT STOGIES Cigar</h1>
    <div class="content">
      <p>Dear ${name},</p>
      <p>For your convenience, we've created you an account on FAT STOGIES Cigar. so you can check the status of your order and checkout quicker in the future. Your account details are as follows
      </p>
      <p>To sign in to your account, please visit FAT STOGIES Cigar or click here.
      If you have any questions regarding your account, click 'Reply' in your email client and we'll be only too happy to help
      </p>

      <p>Best regards,</p>
      <p>-FAT STOGIES Cigar</p>
    </div>
    <div class="footer">
      <a href="https://fatstogies.com">www.fatstogies.com</a>
    </div>
  </div>
</body>
</html>`;
  const subject = "Thanks for Registering at FAT STOGIES Cigar ";
  const emailHeader = 'Welcome to FAT STOGIES!'
  const send_to = email; 
  const sent_from = process.env.EMAIL_USER;



  try {
    Email(subject, message, send_to, sent_from, undefined, logoAttachment,emailHeader);
  } catch (error) {
    console.error(error);
  }
    res.status(201).json({ token });
  });
};



exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findByEmail(email)
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      bcrypt.compare(password, user.password, (err, result) => {
        if (err || !result) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        const accessToken = generateAccessToken({
          id: user.id,
          email: user.email,
          role: user.role,
        });

        const refreshToken = generateRefreshToken({
          id: user.id,
          email: user.email,
          role: user.role,
        });

        // Set the access token cookie
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        });

        // Set the refresh token cookie
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        });

        res.status(200).json({ token: accessToken, message: 'success' });
      });
    })
    .catch((err) => {
      res.status(500).json({ message: 'Login failed' });
    });
};

exports.loginStatus = (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.json(false);
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    if (verified) {
      const { role, status } = verified; 
      return res.json({ isLoggedIn: true, role, status });
    }
  } catch (error) {
    console.error('Token Verification Error:', error);
  }

  return res.json({ isLoggedIn: false });
};

  
  exports.getUser = (req, res) => {
    const userID = req.params.id;
  
    User.findById(userID, (err, user) => {
      if (err) {
        res.status(500).json({ message: 'Error getting user' });
      } else if (!user) {
        res.status(404).json({ message: 'User not found' });
      } else {
        res.status(200).json(user);
      }
    });
  };
  
  exports.getAllUsers = (req, res) => {
    User.findAll((err, users) => {
      if (err) {
        console.error('Error getting all users:', err);
        res.status(500).json({ message: 'Error getting all users' });
      } else {
        res.status(200).json(users);
      }
    });
  };
  

  exports.logoutUser =  async (req, res) => {
    try {
      // Clear the access token cookie
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
  
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
  
      return res.status(200).json({ message: 'Successfully Logged Out' });
    } catch (error) {
      res.status(500).json({ message: 'Logout failed' });
    }
  }
  