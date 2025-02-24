const { Sequelize } = require('sequelize');
const { config } = require('./env');

// Crearea instanței Sequelize pentru MySQL
const sequelize = new Sequelize(
  config.DB.NAME,
  config.DB.USER,
  config.DB.PASSWORD,
  {
    host: config.DB.HOST,
    port: config.DB.PORT,
    dialect: 'mysql',
    logging: config.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Testare conexiune
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexiunea la baza de date a fost testată cu succes.');
  } catch (error) {
    console.error('Nu s-a putut conecta la baza de date:', error);
  }
};

// Exportăm instanța Sequelize și funcția de testare
module.exports = {
  sequelize,
  testConnection
};