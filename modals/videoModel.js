import mongoose from 'mongoose';

const videoSchema = mongoose.Schema({
    video: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    user: {
        id: mongoose.Schema.Types.ObjectId,
        firstName: String,
        lastName: String,
        email: String,
        profile: Boolean
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Video = mongoose.model('Video', videoSchema);

export default Video;