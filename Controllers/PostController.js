import CarteModel from "../Models/carteModel.js";
import dotenv from 'dotenv';

dotenv.config(); 

export const createPost = async (req, res) => {
    console.log(req.body);
    const {
        name,
        profession,
        company,
        bio,
        phoneNumber,
        email,
        address,
        websiteTitle,
        websiteLink,
        facebookTitle,
        facebookLink,
        whatsappTitle,
        whatsappLink,
        instagramTitle,
        instagramLink,
        linkedinTitle,
        linkedinLink,
        xTitle,
        xLink,
        tiktokTitle,
        tiktokLink,
        youtubeTitle,
        youtubeLink,
    } = req.body;
    
    try {
        const newPost = new CarteModel({
            name,
            profession,
            company,
            bio,
            phoneNumber,
            email,
            address,
            website: {
                title: websiteTitle,
                url: websiteLink
            },
            facebook: {
                title: facebookTitle,
                url: facebookLink
            },
            whatsapp: {
                title: whatsappTitle,
                url: whatsappLink
            },
            instagram: {
                title: instagramTitle,
                url: instagramLink
            },
            linkedin: {
                title: linkedinTitle,
                url: linkedinLink
            },
            x: {
                title: xTitle,
                url: xLink
            },
            tiktok: {
                title: tiktokTitle,
                url: tiktokLink
            },
            youtube: {
                title: youtubeTitle,
                url: youtubeLink
            },
        });
        await newPost.save();
        console.log(newPost)

        res.status(201).json(newPost)
    } catch (error) {
        console.log(error)
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
            console.log(error)
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

export const updateCompanyLogo = async (req, res) => {
    const paramId = req.params.id;
    let image = {};
    if(req.file){
        image = {
            url: process.env.SPACES_ENDPOINT_CDN+req.file.key
        };
        try {
            const picture = await CarteModel.findByIdAndUpdate(paramId, {
                $set: {companyLogo: image}
            });
            res.status(200).json({"picture": picture})
        } catch (error) {
            console.log(error)
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
    const {
        name,
        profession,
        company,
        bio,
        phoneNumber,
        email,
        address,
        websiteTitle,
        websiteLink,
        facebookTitle,
        facebookLink,
        whatsappTitle,
        whatsappLink,
        instagramTitle,
        instagramLink,
        linkedinTitle,
        linkedinLink,
        xTitle,
        xLink,
        tiktokTitle,
        tiktokLink,
        youtubeTitle,
        youtubeLink,
    } = req.body;
    try {
        const post = await CarteModel.findByIdAndUpdate(postId, {
                $set: {
                    name,
                    profession,
                    company,
                    bio,
                    phoneNumber,
                    email,
                    address,
                    website: {
                        title: websiteTitle,
                        url: websiteLink
                    },
                    facebook: {
                        title: facebookTitle,
                        url: facebookLink
                    },
                    whatsapp: {
                        title: whatsappTitle,
                        url: whatsappLink
                    },
                    instagram: {
                        title: instagramTitle,
                        url: instagramLink
                    },
                    linkedin: {
                        title: linkedinTitle,
                        url: linkedinLink
                    },
                    x: {
                        title: xTitle,
                        url: xLink
                    },
                    tiktok: {
                        title: tiktokTitle,
                        url: tiktokLink
                    },
                    youtube: {
                        title: youtubeTitle,
                        url: youtubeLink
                    },
                }
            }
        )
        await post.save();
        res.status(200).json(post)
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
} 

export const updateDeletedPost = async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await CarteModel.findById(postId)
        // if(post.userId === currentUserId) {
        
            await post.deleteOne();
            res.status(200).json('Post Deleted!')
            // await post.updateOne(
            //     {
            //         $set: {
            //             deteted: true,
            //             detetedAt: Date.now(),
            //         }
            //     }
            // )
            // res.status(200).json('Post Delete Updated!')
        // } else {
        //     res.status(403).json('Action Forbidden')
        // }
    } catch (error) {
        res.status(500).json(error)
    }
} 

export const deletePost = async (req, res) => {
    const postId = req.params.id;
    const {currentUserId} = req.body;
    try {
        const post = await CarteModel.findById(postId)
        // if(post.userId === currentUserId) {
            await post.deleteOne();
            res.status(200).json('Post Deleted!')
        // } else {
        //     res.status(403).json('Action Forbidden')
        // }
    } catch (error) {
        res.status(500).json(error)
    }
}