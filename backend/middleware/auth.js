const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const User = require('../models/userModel');

// Middleware pentru protejarea rutelor - verifică dacă utilizatorul este autentificat
exports.protect = async (req, res, next) => {
  let token;

  // Verificăm dacă există un token în header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Verificăm dacă token-ul există
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Nu sunteți autorizat să accesați această resursă'
    });
  }

  try {
    // Verificăm validitatea token-ului
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Găsim utilizatorul în baza de date
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilizatorul nu mai există'
      });
    }

    // Adăugăm utilizatorul la obiectul request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Nu sunteți autorizat să accesați această resursă',
      error: error.message
    });
  }
};