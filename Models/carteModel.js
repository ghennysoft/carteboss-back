import mongoose from "mongoose";

const CarteSchema = mongoose.Schema(
    {        
        profilePicture: {
            url: String,
        },
        coverPicture: {
            url: String,
        },
        companyPicture: {
            url: String,
        },


        // Identité
        name: {
            type: String,
            trim: true,
        },
        profession: {
            type: String,
        },
        company: {
            type: String,
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
            type: String,
        },
        facebook: {
            type: String,
        },
        whatsapp: {
            type: String,
        },
        instagram: {
            type: String,
        },
        linkedin: {
            type: String,
        },
        x: {
            type: String,
        },
        tiktok: {
            type: String,
        },
        youtube: {
            type: String,
        },
    },
    {timestamps: true},
)

const CarteModel = mongoose.model("CarteBoss", CarteSchema);

export default CarteModel;