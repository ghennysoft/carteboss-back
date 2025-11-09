import express from 'express'
import { generateRefreshToken, loginUser, logoutUser, registerUser, searchUser, getUser } from '../Controllers/AuthController.js'
import authUser from '../utils/authMiddleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', authUser, logoutUser)
router.get('/search', searchUser)
router.get('/:id', getUser)
router.post('/refresh', generateRefreshToken)

export default router
