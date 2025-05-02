// backend/src/controllers/passwordResetController.ts
import { Request, Response } from 'express';
import User from '../models/userModel';
import PasswordReset from '../models/passwordResetModel';
import { sendPasswordResetEmail } from '../utils/emailSender';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

// @desc    Request password reset
// @route   POST /api/password/request-reset
// @access  Public
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      res.status(400).json({ message: 'Numele de utilizator și adresa de email sunt obligatorii' });
      return;
    }

    // Caută utilizatorul
    const user = await User.findOne({ username, email });

    if (!user) {
      // Din motive de securitate, vom returna succes chiar dacă utilizatorul nu există
      // Aceasta previne atacurile de tip "user enumeration"
      res.status(200).json({ 
        message: 'Dacă contul există, un email cu instrucțiuni de resetare a fost trimis' 
      });
      return;
    }

    // Șterge orice token anterior
    await PasswordReset.deleteMany({ userId: user._id });

    // Generează un token unic
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Calculează data de expirare (60 minute)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 60);

    // Salvează token-ul în baza de date
    await PasswordReset.create({
      userId: user._id,
      token: tokenHash,
      expiresAt
    });

    // Trimite email-ul
    await sendPasswordResetEmail(user.email, user.username, resetToken);

    res.status(200).json({ 
      message: 'Un email cu instrucțiuni de resetare a fost trimis la adresa asociată contului' 
    });
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    res.status(500).json({ 
      message: 'A apărut o eroare la procesarea cererii de resetare a parolei' 
    });
  }
};

// @desc    Validate reset token
// @route   GET /api/password/validate-token/:token
// @access  Public
export const validateResetToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    
    if (!token) {
      res.status(400).json({ message: 'Token invalid' });
      return;
    }

    // Hash token pentru a-l compara cu cel din baza de date
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Caută token-ul valid (neexpirat)
    const passwordReset = await PasswordReset.findOne({ 
      token: tokenHash,
      expiresAt: { $gt: new Date() }
    });

    if (!passwordReset) {
      res.status(400).json({ message: 'Token-ul este invalid sau a expirat' });
      return;
    }

    res.status(200).json({ valid: true });
  } catch (error) {
    console.error('Error in validateResetToken:', error);
    res.status(500).json({ message: 'A apărut o eroare la validarea token-ului' });
  }
};

// @desc    Reset password
// @route   POST /api/password/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token-ul și noua parolă sunt obligatorii' });
      return;
    }

    // Hash token pentru a-l compara cu cel din baza de date
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Caută token-ul valid (neexpirat)
    const passwordReset = await PasswordReset.findOne({ 
      token: tokenHash,
      expiresAt: { $gt: new Date() }
    });

    if (!passwordReset) {
      res.status(400).json({ message: 'Token-ul este invalid sau a expirat' });
      return;
    }

    // Găsește utilizatorul
    const user = await User.findById(passwordReset.userId);
    
    if (!user) {
      res.status(404).json({ message: 'Nu s-a găsit niciun utilizator asociat acestui token' });
      return;
    }
        
    // Actualizează parola utilizatorului
    user.password = newPassword;
    await user.save();
    
    // Șterge token-ul de resetare
    await PasswordReset.deleteMany({ userId: user._id });

    res.status(200).json({ message: 'Parola a fost schimbată cu succes' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'A apărut o eroare la resetarea parolei' });
  }
};