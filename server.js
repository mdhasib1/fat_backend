const express = require('express');
const mysql = require('mysql2/promise'); 
const app = express();
const port = 3000;
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const cors = require("cors");
const Product = require('./routes/Product');
const bodyParser = require('body-parser');
const brandRoutes = require('./routes/brandRoutes')
const imageRouter = require('./routes/imageUploadRoutes')
const ups = require('./routes/UPSRoutes')
const orders = require('./routes/OrderRoutes')
const favoriteRoutes = require('./routes/favoriteRoutes')
const taxRoutes = require('./routes/taxRoutes')
const paymentRoutes = require('./routes/PaymentRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(bodyParser.json());

dotenv.config();

app.use(
  cors({
    origin:"http://localhost:5173",
    credentials: true,
  })
);

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const db = mysql.createPool(dbConfig);


async function createDatabaseIfNotExists() {
  try {
    const [rows] = await db.query(`SHOW DATABASES LIKE '${process.env.DB_DATABASE}'`);
    if (rows.length === 0) {
      await db.query(`CREATE DATABASE ${process.env.DB_DATABASE}`);
      console.log(`Database ${process.env.DB_DATABASE} created.`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
  }
}


async function createTablesIfNotExists() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        city VARCHAR(255) DEFAULT NULL,
        state VARCHAR(255) DEFAULT NULL,
        country VARCHAR(255) DEFAULT NULL,
        zipcode VARCHAR(255) DEFAULT NULL,
        address VARCHAR(255) DEFAULT NULL,
        phone VARCHAR(255) DEFAULT NULL,
        role ENUM('customer', 'admin') DEFAULT 'customer',
        order_history JSON DEFAULT '[]'
      );
    `);

    await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id CHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      brand VARCHAR(255) NOT NULL,
      shape VARCHAR(255) NOT NULL,
      size VARCHAR(255) NOT NULL,
      strength VARCHAR(255) NOT NULL,
      wrapper VARCHAR(255) NOT NULL,
      binder VARCHAR(255) NOT NULL,
      filler VARCHAR(255) NOT NULL,
      grade VARCHAR(255) NOT NULL,
      blender VARCHAR(255) NOT NULL,
      sku VARCHAR(255) NOT NULL,
      country_of_origin VARCHAR(255) NOT NULL,
      images JSON NOT NULL,
      display BOOLEAN DEFAULT true
    );    
  `);
  
    await db.query(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id CHAR(36) PRIMARY KEY,
      product_id CHAR(36) NOT NULL,
      packageqty VARCHAR(255) NOT NULL,
      packagetype VARCHAR(255) NOT NULL,
      oldPrice DECIMAL(10, 2) NOT NULL,
      currentPrice DECIMAL(10, 2),
      stock INT NOT NULL,
      outstock VARCHAR(255) DEFAULT 'instock',
      FOREIGN KEY (product_id) REFERENCES products(id)
    );    
  `);

  await db.query(`
  CREATE TABLE IF NOT EXISTS favorites (
    id CHAR(36) PRIMARY KEY,
    userId CHAR(36) NOT NULL,
    productId CHAR(36) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (productId) REFERENCES products(id)
  );
`);
await db.query(`
  CREATE TABLE IF NOT EXISTS orders (
    id CHAR(36) PRIMARY KEY,
    userId CHAR(36) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    totalAmount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL,
    paymentstatus ENUM('pending', 'confirm', 'reject') NOT NULL,
    paymentID CHAR(36),
    FOREIGN KEY (userId) REFERENCES users(id)
  );  
`);

await db.query(`
  CREATE TABLE IF NOT EXISTS order_items (
    id CHAR(36) PRIMARY KEY,
    orderId CHAR(36) NOT NULL,
    productId CHAR(36) NOT NULL,
    quantity INT NOT NULL,
    pricePerItem DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (orderId) REFERENCES orders(id),
    FOREIGN KEY (productId) REFERENCES products(id)
  );
`);
await db.query(`
CREATE TABLE IF NOT EXISTS  reviews (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  productId VARCHAR(36) NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (productId) REFERENCES products(id)
);`);

    await db.query(`
    CREATE TABLE IF NOT EXISTS brands (
      id VARCHAR(36) PRIMARY KEY,
      brand_name VARCHAR(255) NOT NULL,
      display BOOLEAN DEFAULT true
    );      
  `);
  
    console.log('Tables created.');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}





async function initializeDatabase() {
  await createDatabaseIfNotExists();
  await createTablesIfNotExists();
}

initializeDatabase().then(() => {
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/products', Product);
  app.use('/api/brands', brandRoutes);
  app.use('/api/upload', imageRouter);
  app.use('/api/ups', ups);
  app.use('/api', favoriteRoutes);
  app.use('/api/tax', taxRoutes);
  app.use('/api', paymentRoutes);
  app.use('/api', reviewRoutes);
  app.use('/api', orders);





  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
