import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profile: {
        fieldname: String,
        originalname: String,
        encoding: String,
        mimetype: String,
        buffer: Buffer,
        size: Number
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;