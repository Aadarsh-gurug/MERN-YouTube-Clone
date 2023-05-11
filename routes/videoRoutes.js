import { Router } from 'express';
import { getVideosController, getVideoController, uploadVideoController, loadMoreVideosController, getUserVideosController, deleteVideoController, updateVideoController, getSingleVideoController, getRelatedVideosController, searchProductController } from '../controller/videoController.js';
import { requireSignIn } from '../middlewares/authMiddleware.js'
import multer from 'multer'
import { GridFsStorage } from 'multer-gridfs-storage'
import dotenv from "dotenv"
dotenv.config()
const router = Router();

const upload = multer({
    storage: new GridFsStorage({
        url: process.env.MONGO_URI,
        file: (req, file) => {
            return {
                bucketName: "videos",
                filename: `${Date.now()}-${file.originalname}`
            }
        }
    }),
    fileFilter: function (req, file, callback) {
        if (!file.mimetype.includes('video') && !file.mimetype.includes('image')) {
            return callback('Only videos are allowed.', false)
        }
        callback(null, true)
    },
})

router.post('/upload', requireSignIn, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), uploadVideoController)

router.get('/get/:filename', getVideoController)

router.get('/get-videos', getVideosController)

router.get('/more-videos/:page', loadMoreVideosController)

router.get('/user-videos', requireSignIn, getUserVideosController)

router.delete('/delete/:id', requireSignIn, deleteVideoController)

router.put('/update/:id', requireSignIn, updateVideoController)

router.get('/get-video/:id', getSingleVideoController)

router.get('/related-videos/:id', getRelatedVideosController)

router.get('/search/:keyword', searchProductController)


export default router;
