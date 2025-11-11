import mongoose from "mongoose";
import { type } from "os";

const CarteSchema = mongoose.Schema(
    {        
        profilePicture: {
            url: String,
        },
        coverPicture: {
            url: String,
        },
        companyLogo: {
            url: String,
        },
        qrCode: {
            data: String,
            url: String,
        },


        // Identité
        name: {
            type: String,
            trim: true,
            required: true,
        },
        profession: {
            type: String,
            required: true,
        },
        company: {
            type: String,
            required: true,
        },
        bio: {
            type: String,
        },


        // Contacts
        phoneNumber: {
            type: String,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        address: {
            type: String,
        },

        
        // Liens
        website: {
            title: String,
            url: String,
        },
        facebook: {
            title: String,
            url: String,
        },
        whatsapp: {
            title: String,
            url: String,
        },
        instagram: {
            title: String,
            url: String,
        },
        linkedin: {
            title: String,
            url: String,
        },
        x: {
            title: String,
            url: String,
        },
        tiktok: {
            title: String,
            url: String,
        },
        youtube: {
            title: String,
            url: String,
        },

        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default: Date.now
        },
    },
    {timestamps: true},
)

const CarteModel = mongoose.model("CarteBoss", CarteSchema);

export default CarteModel;