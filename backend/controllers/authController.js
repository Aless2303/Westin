const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const User = require('../models/userModel');

// Generare token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  });
};

// Înregistrare utilizator
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Verificare dacă utilizatorul există deja
    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Numele de utilizator sau email-ul există deja'
      });
    }

    // Creare utilizator nou
    const user = await User.create({
      username,
      email,
      password
    });

    // Generare token
    const token = generateToken(user.id);

    // Returnare răspuns cu token
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        gold: user.gold,
        health: user.health,
        energy: user.energy
      }
    });
  } catch (error) {
    console.error('Eroare la înregistrare:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la înregistrare',
      error: error.message
    });
  }
};

// Autentificare utilizator
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Verificare dacă utilizatorul există
    const user = await User.findOne({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Nume de utilizator sau parolă incorecte'
      });
    }

    // Verificare parolă
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Nume de utilizator sau parolă incorecte'
      });
    }

    // Actualizare data ultimei conectări
    user.lastLogin = new Date();
    await user.save();

    // Generare token
    const token = generateToken(user.id);

    // Returnare răspuns cu token
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        gold: user.gold,
        health: user.health,
        energy: user.energy
      }
    });
  } catch (error) {
    console.error('Eroare la autentificare:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la autentificare',
      error: error.message
    });
  }
};

// Verificare token pentru a vedea dacă utilizatorul este autentificat
exports.getMe = async (req, res, next) => {
  try {
    // req.user va fi setat de middleware-ul auth
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizatorul nu a fost găsit'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Eroare la obținerea profilului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea profilului',
      error: error.message
    });
  }
};

// Inițiere proces de resetare parolă
exports.forgotPassword = async (req, res, next) => {
  try {
    const { username, email } = req.body;

    // Căutăm utilizatorul
    const user = await User.findOne({
      where: {
        username,
        email
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Nu există niciun cont cu acest nume de utilizator și email'
      });
    }

    // În implementarea reală, aici am genera un token și l-am trimite prin email
    // Pentru acum, doar simulăm acest proces

    res.status(200).json({
      success: true,
      message: 'Email de resetare a parolei trimis'
    });
  } catch (error) {
    console.error('Eroare la procesul de resetare a parolei:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la procesul de resetare a parolei',
      error: error.message
    });
  }
};