import UserModel from "../Models/userModel.js";
import ProfileModel from "../Models/profileModel.js";
import bcrypt from 'bcrypt'
import twilio from "twilio";
import otpGenerator from 'otp-generator'
import {createAccessToken, createRefreshToken} from "../utils/jwtTokens.js"

export const registerUser = async (req, res) => {
    try {
        if(!req.body.username, !req.body.firstname, !req.body.lastname, !req.body.email, !req.body.password, !req.body.confirmPassword){
            res.status(400).json("Veillez remplir tous les champs")
        } else if(req.body.password !== req.body.confirmPassword){
            res.status(400).json("Le mot de passe de confirmation est different")
        } else {
            // Check if the username already exist
            let alreadyExists = await UserModel.findOne({username: req.body.username});
            let user_name = req.body.username;
            while(alreadyExists) {
              const nb = Math.floor(100000 + Math.random() * 900000).toString();
              alreadyExists = await UserModel.findOne({username: req.body.username+nb})
              user_name = req.body.username+nb;
            }

            // Check the password length
            if(req.body.password.length < 6) res.status(400).json("Le mot de passe doit avoir au moins 6 caractères")
            
            const salt = await bcrypt.genSalt(10)
            const hashedPass = await bcrypt.hash(req.body.password, salt)
            const newUser = new UserModel({
                username: user_name,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                password: hashedPass,
            });

            await newUser.save();
            console.log(newUser);
            
            const user = await UserModel.findById(newUser._id)
            
            const access_token = createAccessToken({user});
            const refresh_token = createRefreshToken();
            
            newUser.refreshTokens.push(refresh_token);
            await newUser.save();

            res.status(201).json({
                'profile': user,
                'token': access_token,
                'refreshToken': refresh_token,
            })
        } 
    }
    catch (err) {
        res.status(500).json(err)
        console.log(err);
    }
}

export const loginUser = async (req, res) => {  
    const {data, password} = req.body
    console.log(req.body);
    
    try {
        if(!data, !password){
          res.status(400).json({message: 'Remplissez tous les champs'})
        } else {
            const user_email = await UserModel.findOne({ email: data });
            const user_username = await UserModel.findOne({ username: data });
            if(!user_email && !user_username){
                res.status(400).json({message:'Identifiants incorrects' }) 
            } else {
                let auth;
                if(user_email) auth = await bcrypt.compare(password,user_email.password)
                if(user_username) auth = await bcrypt.compare(password,user_username.password)
                if (!auth) {
                    res.status(400).json({message:'Identifiants incorrects'})
                } else {
                    let profile;
                    if(user_email) profile = await UserModel.findById(user_email._id)
                    if(user_username) profile = await UserModel.findById(user_username._id)
                        
                    const access_token = createAccessToken({user: profile});
                    const refresh_token = createRefreshToken();
                        
                    if(user_email) {
                        user_email.refreshTokens.push(refresh_token);
                        await user_email.save();
                    }

                    if(user_username) {
                        user_username.refreshTokens.push(refresh_token);
                        await user_username.save();
                    }
                    
                    res.status(200).json({
                        'profile': profile,
                        'token': access_token,
                        'refreshToken': refresh_token,
                    })
                }
            }
        }
    
    } catch (err) {
        res.status(500).json(err)
        console.error(err);
    }
}

export const generateRefreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ message: 'Invalid refresh token' });
        
        const user = await UserModel.findOne({ refreshTokens: refreshToken });
        
        if (!user) return res.status(401).json({ message: 'Invalid refresh token' });

        const profileToken = await UserModel.findById(user._id)
            
        const new_access_token = createAccessToken({user: profileToken});

        res.json({ 
            'token': new_access_token,
            'message': 'Nouveau token',
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const searchUser = async (req, res) => {
    const searchTerm = req.query.q || ''
    try {
        // Search user
        const searchParts = searchTerm.split(' ').map(part => part.trim()).filter(part => part.length > 0);
        let profiles = [];
        if (searchParts.length === 1) {
            // Recherche par prénom ou nom seul
            profiles = await UserModel.find({
                $or: [
                    { firstname: { $regex: searchParts[0], $options: 'i' } },
                    { lastname: { $regex: searchParts[0], $options: 'i' } }
                ]
            })
            .select('username firstname lastname')
            .populate('profileId', 'profilePicture')
        } else if (searchParts.length === 2) {
            // Recherche avec prénom + nom ou nom + prénom
            const [part1, part2] = searchParts;
      
            profiles = await UserModel.find({
              $or: [
                {
                  firstname: { $regex: part1, $options: 'i' },
                  lastname: { $regex: part2, $options: 'i' }
                },
                {
                  firstname: { $regex: part2, $options: 'i' },
                  lastname: { $regex: part1, $options: 'i' }
                }
              ]
            })
            .select('username firstname lastname')
            .populate('profileId', 'profilePicture')
        }

        res.status(200).json(profiles)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

export const getUser = async (req, res) => {
    const paramId = req.params.id;
    try {
        const user = await UserModel.findOne({username: paramId})
        .select('username email firstname lastname phone');

        if(user){
            res.status(200).json(user)
        }else{
            res.status(404).json("No such user exist")
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie('refresh_token', {maxAge: 0, path: "/api/auth/refresh_token"})
        res.status(200).json('Vous êtes deconnecté')
    } catch (err) {
        
    }
}

export const completeProfileSuggestions = async (req, res) => {
    try {
        const studyAt = await ProfileModel.distinct('studyAt')
        const domain = await ProfileModel.distinct('domain')
        res.status(200).json({studyAt, domain})
    } catch (error) {
        res.status(500).json(error)
    }
}





const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

const twilioClient = new twilio(accountSid, authToken);

export const sendOtp = async(req, res)=>{
    const {phoneNumber} = req.body;
    try {
        const user = await UserModel.findOne({ phone_code: phoneNumber });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const otp = otpGenerator.generate(6, {
           upperCaseAlphabets: false, 
           lowerCaseAlphabets: false, 
           specialChars: false, 
        })
        user.otp = otp;
        user.otpExpiration = Date.now() + 300000; // 5 minutes
        await user.save();

        await twilioClient.messages.create({
            body: `Votre code est: ${otp}`,
            to: phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER
        });

        res.status(200).json({ message: 'OTP envoyé avec succès' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'OTP', error });
    }
}

export const verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    const user = await UserModel.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (user.otp !== otp || user.otpExpiration < Date.now()) {
      return res.status(400).json({ message: 'OTP invalide ou expiré' });
    }

    // Réinitialiser l'OTP après vérification
    user.otp = null;
    user.otpExpiration = null;
    await user.save();

    res.status(200).json({ message: 'OTP vérifié avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la vérification de l\'OTP', error });
  }
};

export const resetPassword = async (req, res) => {
  const { phoneNumber, newPassword } = req.body;

  try {
    const user = await UserModel.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Hash du nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe', error });
  }
};
