import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
    {
        // User Infos
        username: {
            type: String,
            trim: true,
            unique: true,
        },
        firstname: {
            type: String,
            required: true,
            trim: true,
        },
        lastname: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            // minlength: 6,
            // private: true
        },


        // Others Infos
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user',
        },
        online: {
            type: Boolean,
            default: false
        },
        lastSeen: {
            type: Date,
            default: Date.now
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        otp: String,
        otpExpiration : String,
        refreshTokens: [String],
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        isEmailVerified: {
            type: Boolean,
            default: false
        },
    },
    {timestamps: true},
)

const UserModel = mongoose.model("Users", UserSchema)

// UserModel.collection.createIndex({firstname: 1, lastname: 1});

export default UserModel