const dotenv = require('dotenv');

// Încărcarea variabilelor de mediu din fișierul .env
dotenv.config();

// Configurare variabile de mediu
exports.config = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  
  // Configurare bază de date MySQL
  DB: {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    NAME: process.env.DB_NAME,
    PORT: process.env.DB_PORT,
  }
};