import express from 'express'
import { createPost, deletePost, getAllPosts, getPost, updatePost } from '../Controllers/PostController.js'
import authUser from '../utils/authMiddleware.js'
import { uploadPost } from '../utils/upload.js'

const router = express.Router()

router.get('/all', authUser, getAllPosts)
router.post('/create', authUser, uploadPost.array('media'), createPost)
router.get('/:id', authUser, getPost)
router.put('/:id', authUser, updatePost)
router.delete('/:id', authUser, deletePost)

export default router
