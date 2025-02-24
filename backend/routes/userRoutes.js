const express = require('express');
const { protect } = require('../middleware/auth');
const { getUser, updateUser, deleteUser } = require('../controllers/userController');
const router = express.Router();

// Rute pentru gestionarea utilizatorilor
router.get('/:id', protect, getUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

// Rută de test pentru verificarea funcționalității
router.get('/test', (req, res) => {
  res.json({ message: 'Rutele pentru utilizatori funcționează!' });
});

module.exports = router;