const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    getAllUsers,
    getUserById
} = require('../Controllers/userController');
const { protect } = require('../Middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserById);

module.exports = router;