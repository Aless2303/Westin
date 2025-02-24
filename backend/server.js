const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { config } = require('./config/env');
const { sequelize } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorMiddleware = require('./middleware/error');

// Inițializare aplicație Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Logging în modul development
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rute
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Rută de bază pentru verificarea funcționalității API-ului
app.get('/', (req, res) => {
  res.json({ message: 'Bine ai venit la API-ul Westin!' });
});

// Middleware pentru tratarea erorilor
app.use(errorMiddleware);

// Port
const PORT = config.PORT || 5000;

// Pornire server
const startServer = async () => {
  try {
    // Sincronizare cu baza de date
    await sequelize.sync();
    console.log('Conexiunea la baza de date a fost stabilită cu succes.');
    
    app.listen(PORT, () => {
      console.log(`Serverul rulează pe portul ${PORT} în modul ${config.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Eroare la conectarea la baza de date:', error);
    process.exit(1);
  }
};

startServer();