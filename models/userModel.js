const db = require('../config/db');
const { v4: uuidv4 } = require('uuid'); 

const User = function (user) {
    this.uuid = uuidv4(); 
    this.name = user.name;
    this.email = user.email;
    this.password = user.password;
    this.city = user.city || null;
    this.state = user.state || null;
    this.country = user.country || null;
    this.zipcode = user.zipcode || null;
    this.address = user.address || null;
    this.phone = user.phone || null;
    this.role = user.role || 'customer';
    this.order_history = user.order_history || [];
  };
  
  User.create = (newUser, result) => {
    db.query(
      'INSERT INTO users SET id = ?, name = ?, email = ?, password = ?, city = ?, state = ?, country = ?, zipcode = ?, address = ?, phone = ?, role = ?, order_history = ?',
      [
        newUser.uuid,
        newUser.name,
        newUser.email,
        newUser.password,
        newUser.city,
        newUser.state,
        newUser.country,
        newUser.zipcode,
        newUser.address,
        newUser.phone,
        newUser.role,
        JSON.stringify(newUser.order_history), // Convert order_history to JSON
      ],
      (err, res) => {
        if (err) {
          result(err, null);
        } else {
          result(null, { uuid: newUser.uuid, ...newUser });
        }
      }
    );
  };
  
  

  User.findByEmail = (email) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE email = ?', [email], (err, res) => {
        if (err) {
          console.error('Error finding user by email:', err);
          reject(err);
        } else {
          if (res.length > 0) {
            resolve(res[0]);
          } else {
            resolve(null);
          }
        }
      });
    });
  };
  
  
  User.findById = (id, callback) => {
    db.query('SELECT * FROM users WHERE id = ?', id, (err, res) => {
      if (err) {
        console.error('Error finding user by ID:', err);
        callback(err, null);
      } else {
        if (res.length > 0) {
          callback(null, res[0]);
        } else {
          callback(null, null);
        }
      }
    });
  };
  
  User.findAll = (callback) => {
  db.query('SELECT * FROM users', (err, res) => {
    if (err) {
      console.error('Error finding all users:', err);
      callback(err, null);
    } else {
      callback(null, res);
    }
  });
};

  
  

module.exports = User;