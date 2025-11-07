import express from 'express'
import { gschoolConnection, deleteUser, getProfile, getProfileById, getUserData, updateCoverPicture, updatePicture, updateProfile } from '../Controllers/ProfileController.js'
import authUser from '../utils/authMiddleware.js'
import { uploadProfile } from '../utils/upload.js'

const router = express.Router()

router.get('/school/role', authUser, gschoolConnection)
router.get('/:id', authUser, getProfile)
router.get('/find/:id', authUser, getProfileById)
router.put('/:id', authUser, updateProfile)
router.put('/picture/:id', authUser, uploadProfile.single('profilePicture'), updatePicture)
router.put('/cover/:id', authUser, uploadProfile.single('coverPicture'), updateCoverPicture)
router.delete('/:id', authUser, deleteUser)
router.get('/data/:id', authUser, getUserData)

export default router
