import User from '../modals/userModel.js'
import bcrypt from 'bcrypt'
import JWT from 'jsonwebtoken'
import Video from '../modals/videoModel.js';

export const userRegisterController = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!email || !password || !firstName || !lastName) {
            return res.status(200).json({ message: 'Email, Password, FirstNam, LastName are required', success: false })
        }
        const existingUser = await User.findOne({ email: email })
        if (existingUser) {
            return res.status(200).json({ message: 'User Already Exists Please Login', success: false })
        }
        if (req.file) {
            if (req.file?.mimetype !== "image/jpeg") {
                if (req.file?.mimetype !== "image/png") {
                    return res.status(200).json({ message: 'only image files are accepted.', success: false })
                }
            }
            if (req.file?.size > 1000000) {
                return res.status(200).json({ message: 'profile pic size should be less than 1 mb.', success: false })
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        if (req.file) {
            await User.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                profile: req.file
            })
        } else {
            await User.create({
                firstName,
                lastName,
                email,
                password: hashedPassword
            })
        }
        return res.status(201).json({ message: 'User Registered Successfully.', success: true })
    } catch (error) {
        return res.status(500).json({ message: 'Error while Register the user.', error, success: false })
    }
}



export const userLoginController = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(200).json({ message: 'Email, Password are required', success: false })
        }
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(200).json({ message: 'invalid login credentials.', success: false })
        }
        const match = await bcrypt.compare(password, user?.password)
        if (!match) {
            return res.status(200).json({ message: 'invalid login credentials.', success: false })
        }
        const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET)
        if (user.profile.fieldname) {
            const profile = `/api/v1/auth/user-profile/${user._id}`
            return res.status(200).json({
                message: 'User Logged In Successfully.',
                success: true,
                token,
                profile,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    createdAt: user.createdAt
                }
            })
        }
        return res.status(200).json({
            message: 'User Logged In Successfully.',
            success: true,
            token,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                createdAt: user.createdAt
            }
        })
    } catch (error) {
        return res.status(500).json({ message: 'Error while login the user.', error, success: false })
    }
}


export const userProfileController = async (req, res) => {
    try {
        const { profile } = await User.findById(req.params.id)
        if (profile) {
            res.set("Content-type", profile.mimetype)
            res.status(200).send(profile.buffer)
        } else {
            return res.status(404).send('profile does not exist')
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error while getting user profile.', error, success: false })
    }
}

export const userUpdateController = async (req, res) => {
    try {
        const { firstName, lastName, email, password, newPassword } = req.body;
        if (!email || !password) {
            return res.status(200).json({ message: 'Email, Password are required', success: false })
        }
        const user = await User.findOne({ email: email })
        const match = await bcrypt.compare(password, user?.password)
        if (!match) {
            return res.status(200).json({ message: 'invalid password.', success: false })
        }
        if (req.file) {
            if (req.file?.mimetype !== "image/jpeg") {
                if (req.file?.mimetype !== "image/png") {
                    return res.status(200).json({ message: 'only image files are accepted.', success: false })
                }
            }
            if (req.file?.size > 1000000) {
                return res.status(200).json({ message: 'profile pic size should be less than 1 mb.', success: false })
            }
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        if (req.file) {
            await User.findByIdAndUpdate(user?._id, {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                profile: req.file
            })
        } else {
            await User.findByIdAndUpdate(user?._id, {
                firstName,
                lastName,
                email,
                password: hashedPassword
            })
        }
        return res.status(201).json({ message: 'User Updated Successfully.', success: true })
    } catch (error) {
        return res.status(500).json({ message: 'Error while updating the user.', error, success: false })
    }
}


export const deleteUserController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(200).json({ message: 'Email, Password are required', success: false })
        }
        const user = await User.findOne({ email: email })
        const match = await bcrypt.compare(password, user?.password)
        if (!match) {
            return res.status(200).json({ message: 'invalid password.', success: false })
        }
        await User.findByIdAndDelete(user._id)
        await Video.deleteMany({ userId: req.userId })
        return res.status(202).json({ message: 'User Deleted Successfully.', success: true, user })
    } catch (error) {
        return res.status(500).json({ message: 'Error while Deleting the user.', error, success: false })
    }
}

