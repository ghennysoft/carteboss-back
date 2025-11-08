import PostModel from "../Models/postModel.js"
import ProfileModel from "../Models/profileModel.js";
import CarteModel from "../Models/carteModel.js";
import dotenv from 'dotenv';
import axios from "axios";

dotenv.config(); 

export const createPost = async (req, res) => {
    console.log(req.body);
    
    try {
        const newPost = new CarteModel(req.body);
        await newPost.save();
        console.log(newPost)
        
        res.status(201).json(newPost)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const updatePicture = async (req, res) => {
    const paramId = req.params.id;
    let image = {};
    if(req.file){
        image = {
            url: process.env.SPACES_ENDPOINT_CDN+req.file.key
        };
        try {
            const picture = await CarteModel.findByIdAndUpdate(paramId, {
                $set: {profilePicture: image}
            });
            res.status(200).json({"picture": picture})
        } catch (error) {
            res.status(500).json(error)            
        }
    } else {
        res.status(403).json("Access Denied, you can only update your profile!")
    }
}

export const updateCoverPicture = async (req, res) => {
    const paramId = req.params.id;
    let image = {};
    if(req.file){
        image = {
            url: process.env.SPACES_ENDPOINT_CDN+req.file.key
        };
        try {
            const picture = await CarteModel.findByIdAndUpdate(paramId, {
                $set: {coverPicture: image}
            });
            res.status(200).json({"picture": picture})
        } catch (error) {
            res.status(500).json(error)            
        }
    } else {
        res.status(403).json("Access Denied, you can only update your profile!")
    }
}

export const updateQrCode = async (req, res) => {
    const paramId = req.params.id;
    let image = {};
    console.log(req.file)
    console.log(req.files)
    console.log(req.body)
    if(req.file){
        image = {
            url: process.env.SPACES_ENDPOINT_CDN+req.file.key
        };
        try {
            const picture = await CarteModel.findByIdAndUpdate(paramId, {
                $set: {qrCode: {data: req.body.data, url: process.env.SPACES_ENDPOINT_CDN+req.file.key}}
            });
            res.status(200).json({"picture": picture})
        } catch (error) {
            res.status(500).json(error)            
        }
    } else {
        res.status(403).json("Access Denied, you can only update your profile!")
    }
}

export const getAllPosts = async (req, res) => {  
    try {
        const posts = await CarteModel.find().sort({createdAt: -1})
        res.status(200).json(posts)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getPost = async (req, res) => {
    const id = req.params.id;
    try {
        const post = await CarteModel.findById(id)
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