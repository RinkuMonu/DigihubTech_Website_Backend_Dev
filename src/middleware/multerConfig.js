import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// ✅ Static Cloudinary Config (abhi ke liye hard-coded)
// cloudinary.config({
//     cloud_name: "dgcnzpurv",
//     api_key: "723517284524997",
//     api_secret: "kavO7bGj_c8gXrZQ7JAGGVXR6Tc",
// });
cloudinary.config({
    cloud_name: "dpjkoijtc",
    api_key: "791936832448338",
    api_secret: "Z20wmQTxg3R3BbQGYLWTvEjfqiQ",
});


// ✅ Set up Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'uploads', // Folder name in Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'], 
    },
});

// ✅ File filter to allow only image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// ✅ Create the multer upload middleware
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    }
});

// ✅ Optional: Multer error handler middleware
const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
    } else if (err) {
        return res.status(400).json({ message: 'File upload error', error: err.message });
    }
    next();
};

export default upload;