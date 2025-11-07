import UserModel from "../Models/userModel.js";
import ProfileModel from "../Models/profileModel.js";
import { createError } from "../error.js";
import PostModel from "../Models/postModel.js";
import {createAccessToken, createRefreshToken} from "../utils/jwtTokens.js"
import axios from "axios";
import dotenv from 'dotenv';

dotenv.config()

// Search data
export const gschoolConnection = async (req, res) => {
    const token = req.headers.authorization;
    try {
        const [pupilResponse, teacherResponse, roleResponse] = await Promise.all([
            axios.get(`${process.env.SCHOOL_API_URL}pupils/find/${req.user._id}`, {
                headers: { Authorization: token }
            }).catch(() => null), // Gérer les erreurs sans bloquer
            axios.get(`${process.env.SCHOOL_API_URL}teachers/find/${req.user._id}`, {
                headers: { Authorization: token }
            }).catch(() => null),
            axios.get(`${process.env.SCHOOL_API_URL}schools/find/${req.user._id}`, {
                headers: { Authorization: token }
            }).catch(() => null)
        ]);
        // Extraire les données des réponses
        const pupil = pupilResponse?.data || null;
        const teacher = teacherResponse?.data || null;
        const role = roleResponse?.data || null;

        // Vérifier les rôles
        const hasValidRole = pupil || teacher || role?.admin || role?.director;
        if (hasValidRole) {
            // console.log({ RESULTAT: 'YES, ONE GSCHOOL CONNECTION' });
            // Renvoyer uniquement les données nécessaires
            res.status(200).json({
                isConnection: true,
                pupil: pupil?.pupil,
                teacher,
                admin: role?.admin || false,
                director: role?.director || false,
            });
        } else {
            // Renvoyer uniquement les données nécessaires
            res.status(200).json({ isConnection: false });
            // console.log({ RESULTAT: 'NO GSCHOOL CONNECTION' });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

// Search data
// export const searchData = async (req, res) => {
//     const searchTerm = req.query.q || ''
    
//     try {
//         // Search user
//         const searchParts = searchTerm.split(' ').map(part => part.trim()).filter(part => part.length > 0);

//         let profiles = [];

//         if (searchParts.length === 1) {
//             // Recherche par prénom ou nom seul
//             profiles = await UserModel.find({
//                 $or: [
//                     { firstname: { $regex: searchParts[0], $options: 'i' } },
//                     { lastname: { $regex: searchParts[0], $options: 'i' } }
//                 ]
//             })
//             .select('username firstname lastname')
//             .populate('profileId', 'profilePicture')
//         } else if (searchParts.length === 2) {
//             // Recherche avec prénom + nom ou nom + prénom
//             const [part1, part2] = searchParts;
      
//             profiles = await UserModel.find({
//               $or: [
//                 {
//                   firstname: { $regex: part1, $options: 'i' },
//                   lastname: { $regex: part2, $options: 'i' }
//                 },
//                 {
//                   firstname: { $regex: part2, $options: 'i' },
//                   lastname: { $regex: part1, $options: 'i' }
//                 }
//               ]
//             })
//             .select('username firstname lastname')
//             .populate('profileId', 'profilePicture')
//         }
        

//         // Search post
//         const posts = await PostModel.find({content: {$regex: searchTerm, $options: 'i'}})

//         // Search question
//         const questions = await QuestionModel.find({content: {$regex: searchTerm, $options: 'i'}})

//         res.status(200).json({profiles, posts, questions})
//     } catch (error) {
//         res.status(500).json(error)
//     }
// }

export const getProfileById = async (req, res) => {
    const paramId = req.params.id;
    try {
        const profile = await UserModel.findById(paramId)
        .select("firstname lastname")

        if(!profile){
            return res.status(404).json("No such profile exist");
        }
        return res.status(200).json(profile); 
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export const getProfile = async (req, res) => {
    const paramId = req.params.id;
    try {
        const user = await UserModel.findOne({username: paramId});
        
        const profile = await ProfileModel.findOne({userId: user._id})
        .select('userId profilePicture coverPicture status school option university filiere profession entreprise bio birthday createdAt followings followers gender subjects reputation level experience privileges badges')
        .populate("userId", "city country firstname lastname phone_code username")
        .populate({
            path: "followings.user",
            select: 'userId profilePicture status school option university filiere profession entreprise',
            populate: {
                path: 'userId',
                select: 'username firstname lastname',
            }
        })
        .populate({
            path: "followers.user",
            select: 'userId profilePicture status school option university filiere profession entreprise',
            populate: {
                path: 'userId',
                select: 'username firstname lastname',
            }
        })

        if(profile){
            res.status(200).json(profile)
        }else{
            res.status(404).json("No such profile exist")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

// Update Profile
export const updateProfile = async (req, res) => {
    const paramId = req.params.id;
    if(paramId) {
        try {
            const profile = await ProfileModel.findByIdAndUpdate(paramId, {$set: req.body})
            const user = await UserModel.updateOne({profileId: paramId}, {$set: req.body})

            const profileToken = await ProfileModel.findById(profile._id)
                .select('birthday gender status option school userId')
                .populate('userId', 'username firstname lastname phone_code')
                
            const new_access_token = createAccessToken({user: profileToken});
            const new_refresh_token = createRefreshToken();

            res.status(200).json({
                'profile': profileToken,
                'token': new_access_token,
                'refreshToken': new_refresh_token,
            })
        } catch (error) {
            console.log(error)
            res.status(500).json(error);
        }
    } else {
        return (createError(403, "Access Denied, you can only update your profile!"));
    }
}

// Update Profile & Complete profile infos after register
export const updatePicture = async (req, res) => {
    const paramId = req.params.id;
    if(paramId.toString() === req.user._id.toString()) {
        let image = {};
        if(req.file){
            image = {
                type: req.file.contentType.split("/")[0],
                url: process.env.SPACES_ENDPOINT_CDN+req.file.key
            };
        }
        try {
            const picture = await ProfileModel.findByIdAndUpdate(paramId, {
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

// Update Profile & Complete profile infos after register
export const updateCoverPicture = async (req, res) => {
    const paramId = req.params.id;
    if(paramId.toString() === req.user._id.toString()) {
        let image = {};
        if(req.file){
            image = {
                type: req.file.contentType.split("/")[0],
                url: process.env.SPACES_ENDPOINT_CDN+req.file.key
            };
        }
        try {
            const picture = await ProfileModel.findByIdAndUpdate(paramId, {
                $set: {coverPicture: image}
            });
            res.status(200).json({"coverPicture": picture})
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(403).json("Access Denied, you can only update your profile!")
    }
}

// Delete User
export const deleteUser = async (req, res) => {
    const paramId = req.params.id;
    const currentUserId = req.user.id;

    if(paramId === currentUserId) {
        try { 
            const user = await UserModel.findByIdAndDelete(paramId);
            res.status(201).json("User deleted successfully")
        } catch (err) {
    (err);
        }
    } else {
        retur(createError(403, "Access Denied, you can only delete your profile!"))
    }
}

export const getUserData = async (req, res) => {
    const id = req.params.id;
    try {
        const profile = await ProfileModel.findById(id)

        const posts = await PostModel.find({author: profile._id}).sort({createdAt: -1})
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

        const questions = await QuestionModel.find({author: profile._id}).sort({createdAt: -1})
        .populate({
            path: 'author',
            select: 'userId profilePicture -_id',
            populate: {
                path: 'userId',
                select: 'username firstname lastname',
            }
        })
        .populate({
            path: 'answers',
            populate: {
                path: 'author',
                select: 'userId profilePicture studyAt domain',
                populate: {
                    path: 'userId',
                    select: 'username firstname lastname',
                }
            }
        })
        .populate({
            path: 'subjects',
            select: '_id name',
        })

        const answers = await AnswerModel.find({author: profile._id}).sort({createdAt: -1})
        .populate({
            path: 'author',
            select: 'userId profilePicture -_id',
            populate: {
                path: 'userId',
                select: 'username firstname lastname',
            }
        })
        .populate({
            path: 'questionId',
            select: 'content likes dislikes viewers'
        })

        res.status(200).json({posts, questions, answers})
    } catch (error) {
        res.status(500).json(error)
    }
}