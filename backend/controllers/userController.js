const User = require('../models/userModel');

// Obține un utilizator după ID
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizatorul nu a fost găsit'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Actualizează un utilizator
exports.updateUser = async (req, res, next) => {
  try {
    // Verificăm dacă utilizatorul încerca să-și actualizeze propriul cont
    if (req.user.id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Nu aveți permisiunea să actualizați acest utilizator'
      });
    }

    // Câmpuri care pot fi actualizate de utilizator
    const allowedUpdates = ['email'];
    const updateData = {};

    // Filtrăm datele primite pentru a permite doar actualizări permise
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    // Actualizăm utilizatorul
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizatorul nu a fost găsit'
      });
    }

    // Actualizăm datele și salvăm
    Object.keys(updateData).forEach(key => {
      user[key] = updateData[key];
    });

    await user.save();

    res.status(200).json({
      success: true,
      data: {
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
    next(error);
  }
};

// Șterge un utilizator
exports.deleteUser = async (req, res, next) => {
  try {
    // Verificăm dacă utilizatorul încearcă să-și șteargă propriul cont
    if (req.user.id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Nu aveți permisiunea să ștergeți acest utilizator'
      });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizatorul nu a fost găsit'
      });
    }

    // În loc să ștergem fizic utilizatorul, îl marcăm ca inactiv
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contul a fost dezactivat cu succes'
    });
  } catch (error) {
    next(error);
  }
};