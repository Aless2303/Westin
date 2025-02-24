const { body, validationResult } = require('express-validator');

// Validare pentru înregistrare
exports.validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Numele de utilizator trebuie să aibă între 3 și 30 de caractere')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Numele de utilizator poate conține doar litere, cifre și underscore'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Introduceți o adresă de email validă')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Parola trebuie să aibă cel puțin 6 caractere')
    .matches(/\d/)
    .withMessage('Parola trebuie să conțină cel puțin o cifră'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Parolele nu corespund');
      }
      return true;
    })
];

// Validare pentru autentificare
exports.validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Numele de utilizator este obligatoriu'),
  
  body('password')
    .notEmpty()
    .withMessage('Parola este obligatorie')
];

// Verificare rezultate validare
exports.checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ 
        param: err.param,
        message: err.msg 
      }))
    });
  }
  next();
};