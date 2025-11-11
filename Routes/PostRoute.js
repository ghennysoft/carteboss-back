import express from 'express'
import { createPost, deletePost, getAllPosts, getPost, updatePost, updatePicture, updateCoverPicture, updateQrCode, updateDeletedPost, updateCompanyLogo } from '../Controllers/PostController.js'
import authUser from '../utils/authMiddleware.js'
import { uploadPost } from '../utils/upload.js'

const router = express.Router()

router.get('/all', getAllPosts)
router.post('/create', createPost)
router.put('/qrcode/:id', uploadPost.single('qrCode'), updateQrCode)
router.put('/picture/:id', uploadPost.single('profilePicture'), updatePicture)
router.put('/cover/:id', uploadPost.single('coverPicture'), updateCoverPicture)
router.put('/logo/:id', uploadPost.single('logoPicture'), updateCompanyLogo)
router.get('/:id', getPost)
router.put('/:id', updatePost)
router.put('/delete/:id', updateDeletedPost)
router.delete('/:id', deletePost)

export default router
