module.exports = {
    database: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'fatstogies',
    },
    jwtSecret: process.env.JWT_SECRET || '1234567hgfdhsgfhHUJFHJFJFJBJJFH',
  };
  