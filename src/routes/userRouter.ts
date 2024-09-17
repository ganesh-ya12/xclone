import express from 'express';
import { signUp, jwtLogin, logOut, getUserDetails, changePassword, checkPassword } from '../controllers/userController';
import { protect } from '../middleware/authmiddleware'; // Ensure correct path

const router = express.Router();

// Signup route
router.post('/signup', signUp);

// Login route
router.post('/login', jwtLogin);

// Logout route
router.get('/logout', logOut);

// Get user details route (protected)
router.get('/user', protect, getUserDetails);

router.put('/changepass',protect,changePassword);
router.post('/check',protect,checkPassword);

export default router;
