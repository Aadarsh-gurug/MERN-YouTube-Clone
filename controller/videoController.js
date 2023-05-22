import Video from '../modals/videoModel.js'
import User from '../modals/userModel.js'
import Grid from 'gridfs-stream';
import dotent from 'dotenv'
import mongoose from 'mongoose';
dotent.config()

const conn = mongoose.connection;
let gfs, gridfsBucket;
conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'videos' })
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('videos')
});


export const uploadVideoController = async (req, res) => {
    try {
        const { title, description } = req.body
        if (!title || !description) {
            return res.status(200).json({ message: 'Title And Description Is Required.', success: false })
        }
        if (!req.files.video[0]) {
            return res.status(200).json({ message: 'Video must be provided.', success: false })
        }
        if (!req.files.thumbnail[0]) {
            return res.status(200).json({ message: 'Video must be provided.', success: false })
        }
        const user = await User.findById(req.userId)
        const video = await Video({
            video: req.files.video[0].filename,
            thumbnail: req.files.thumbnail[0].filename,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profile: user.profile.originalname ? true : false
            },
            userId: req.userId,
            title: title,
            description: description
        }).save()
        return res.status(201).json({ message: 'Video uploaded successfully.', success: true, video })
    } catch (error) {
        return res.status(500).json({ message: 'Error while uploding the video.', error, success: false })
    }
}

export const getVideoController = async (req, res) => {
    try {
          const file = await gfs.files.findOne({ filename: req.params.filename })
        if (!file) {
            return res.status(500).send({ message: 'File Note Exist.' })
        }
        const range = req.headers.range;
        if (range && file?.contentType.includes('video')) {
            const videoSize = file.length;
            const start = Number(range.replace(/\D/g, ""));
            const end = videoSize - 1;
            const contentLength = end - start + 1;
            const headers = {
                "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": file.contentType,
            };
            const readStream = gridfsBucket.openDownloadStream(file?._id, { start, end })
            res.writeHead(206, headers);
            readStream.pipe(res);
        } else {
            const readStream = gridfsBucket.openDownloadStream(file._id);
            res.set("Content-type", file.contentType)
            readStream.pipe(res);
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error while getting the video.', error, success: false })
    }
}

export const getVideosController = async (req, res) => {
    try {
        const videos = await Video.find({}).sort({ createdAt: 'descending' }).limit(9)
        if (videos) {
            return res.status(200).json({ message: 'Videos fetched successfully.', success: true, videos })
        }
        return res.status(200).json({ message: 'Videos dont exist.', success: false })
    } catch (error) {
        return res.status(500).json({ message: 'Error while getting All videos', error, success: false })
    }
}

export const loadMoreVideosController = async (req, res) => {
    try {
        const perPage = 9;
        const page = req.params.page ? req.params.page : 1;
        const videos = await Video.find({}).skip((page - 1) * perPage).limit(perPage).sort({ createdAt: 'descending' })
        if (videos) {
            return res.status(200).json({ message: 'More Videos fetched successfully.', success: true, videos })
        }
        return res.status(200).json({ message: 'More Videos dont exist.', success: false })
    } catch (error) {
        return res.status(500).json({ message: 'Error while loading more videos', error, success: false })
    }
}

export const getUserVideosController = async (req, res) => {
    try {
        const videos = await Video.find({ userId: req.userId }).sort({ createdAt: 'descending' })
        if (videos) {
            return res.status(200).json({ message: 'Videos fetched successfully.', success: true, videos })
        }
        return res.status(200).json({ message: 'Videos dont exist.', success: false })
    } catch (error) {
        return res.status(500).json({ message: 'Error while getting All videos', error, success: false })
    }
}

export const deleteVideoController = async (req, res) => {
    try {
        const video = await Video.findByIdAndDelete(req.params.id)
        if (video) {
            return res.status(200).json({ message: 'Video Deleted successfully.', success: true, video })
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error while Deleting video', error, success: false })
    }
}

export const updateVideoController = async (req, res) => {
    try {
        const { title, description } = req.body
        if (!title || !description) {
            return res.status(200).json({ message: 'Title And Description Is Required.', success: false })
        }
        await Video.findByIdAndUpdate(req.params.id, { title, description })
        return res.status(201).json({ message: 'Video Details Update successfully.', success: true })
    } catch (error) {
        return res.status(500).json({ message: 'Error while updating the video.', error, success: false })
    }
}


export const getSingleVideoController = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id)
        if (video) {
            return res.status(200).json({ message: 'Video Fetched successfully.', success: true, video })
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error while Getting Single video', error, success: false })
    }
}

export const getRelatedVideosController = async (req, res) => {
    try {
        console.log(req.params.id);
        const videos = await Video.find({ userId: req.params.id }).limit(6).sort({ createdAt: 'descending' })
        if (videos) {
            return res.status(200).json({ message: 'Related Videos fetched successfully.', success: true, videos })
        }
        return res.status(200).json({ message: 'Related Videos Not Found', success: false })
    } catch (error) {
        return res.status(500).json({ message: 'Error while Related videos', error, success: false })
    }
}

export const searchProductController = async (req, res) => {
    try {
        const { keyword } = req.params;
        const videos = await Video.find({ $or: [{ title: { $regex: keyword, $options: "i" } }, { description: { $regex: keyword, $options: "i" } }] }).sort({ createdAt: 'descending' })
        if (videos) {
            return res.status(200).json({ message: 'Searched Videos fetched successfully.', success: true, videos })
        }
        return res.status(200).json({ message: 'Searched Videos Not Found', success: false })
    } catch (error) {
        return res.status(500).json({ message: 'Error while Related videos', error, success: false })
    }
}
