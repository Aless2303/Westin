// Middleware pentru gestionarea erorilor
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
  
    // Log pentru dezvoltator
    console.error('Error:', err);
  
    // Erori Sequelize
    if (err.name === 'SequelizeValidationError') {
      const message = Object.values(err.errors).map(val => val.message);
      error.message = message.join(', ');
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  
    // Eroare unică (ex: email sau username duplicat)
    if (err.name === 'SequelizeUniqueConstraintError') {
      const message = Object.values(err.errors).map(val => val.message);
      error.message = message.join(', ');
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  
    // Eroare de relație între tabele
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      error.message = 'Eroare de relație între tabele';
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  
    // Răspuns generic pentru orice altă eroare
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Eroare de server'
    });
  };
  
  module.exports = errorHandler;