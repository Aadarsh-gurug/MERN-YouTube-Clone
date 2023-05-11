import { Router } from 'express';
import { deleteUserController, userLoginController, userProfileController, userRegisterController, userUpdateController } from '../controller/userController.js';
import { requireSignIn } from '../middlewares/authMiddleware.js'
import multer from 'multer'
const router = Router();

router.post('/register', multer().single('profile'), userRegisterController)

router.post('/login', userLoginController)

router.get('/user-profile/:id', userProfileController)

router.put('/update', requireSignIn, multer().single('profile'), userUpdateController)

router.post('/delete-user', requireSignIn, deleteUserController)

export default router;