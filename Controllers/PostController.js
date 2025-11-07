import PostModel from "../Models/postModel.js"
import ProfileModel from "../Models/profileModel.js";
import dotenv from 'dotenv';

dotenv.config(); 

export const createPost = async (req, res) => {
    const {author, postType, target, content, postBg} = req.body;
    let postMedia = [];
    if(req.files.length!==0){
        req.files.forEach(file => {
            postMedia.push({
                type: file.contentType.split("/")[0],
                url: process.env.SPACES_ENDPOINT_CDN+file.key
            });
        });
    }
    
    try {
        const newPost = new PostModel({
           author,
           postType,
           target,
           content,
           media: postMedia,
           postBg: JSON.parse(postBg),
        });
        await newPost.save();

        // Récupérer les abonnés de l'utilisateur
        const user = await ProfileModel.findById(newPost.author).populate('userId followers');
        const followers = user.followers;
        
        res.status(201).json({newPost, user})
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getAllPosts = async (req, res) => {  
    const currentUser = req.user;  
    try {
        const posts = await PostModel.find().sort({createdAt: -1})
        .populate({
            path: 'comments',
            populate: {
                path: 'author',
                select: 'userId profilePicture birthday status school option university filiere profession entreprise',
                populate: {
                    path: 'userId',
                    select: 'username firstname lastname',
                }
            }
        })
        .populate({
            path: 'author',
            select: 'userId profilePicture birthday status school option university filiere profession entreprise',
            populate: {
                path: 'userId',
                select: 'username firstname lastname',
            }
        })
        res.status(200).json({currentUser, posts})
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getPost = async (req, res) => {
    const id = req.params.id;
    try {
        const post = await PostModel.findById(id)
        .populate({
            path: 'comments',
            populate: {
                path: 'author',
                select: 'userId profilePicture birthday status school option university filiere profession entreprise',
                populate: {
                    path: 'userId',
                    select: 'username firstname lastname',
                }
            }
        })
        .populate({
            path: 'author',
            select: 'userId profilePicture birthday status school option university filiere profession entreprise',
            populate: {
                path: 'userId',
                select: 'username firstname lastname',
            }
        })
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const updatePost = async (req, res) => {
    const postId = req.params.id;
    const {currentUserId} = req.body;
    try {
        const post = await PostModel.findById(postId)
        if(post.userId === currentUserId) {
            await post.updateOne({$set:req.body})
            res.status(200).json('Post Updated!')
        } else {
            res.status(403).json('Action Forbidden')
        }
    } catch (error) {
        res.status(500).json(error)
    }
} 

export const deletePost = async (req, res) => {
    const postId = req.params.id;
    const {currentUserId} = req.body;
    try {
        const post = await PostModel.findById(postId)
        if(post.userId === currentUserId) {
            await post.deleteOne();
            res.status(200).json('Post Deleted!')
        } else {
            res.status(403).json('Action Forbidden')
        }
    } catch (error) {
        res.status(500).json(error)
    }
}