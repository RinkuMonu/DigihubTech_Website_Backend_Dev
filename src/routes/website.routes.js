import express from 'express';
import {
    createWebsite,
    getAllWebsites,
    getWebsiteById,
    updateWebsite,
    deleteWebsite
} from '../controller/website.controller.js';  // Adjust path based on your directory structure
import { isAdmin } from '../middleware/isAdmin.js';
import upload from '../middleware/multerConfig.js';

const websiteRoutes = express.Router();

// // 1. Create a new Website
websiteRoutes.post('/add', isAdmin, upload.single("image"), createWebsite);

// // 2. Get all Websites
websiteRoutes.get('/', isAdmin, getAllWebsites);

// // 3. Get Website by ID
websiteRoutes.get('/:websiteId', getWebsiteById);

// // 4. Update Website by ID
websiteRoutes.put('/:websiteId', isAdmin, upload.single("image"), updateWebsite);

// // 5. Delete Website by ID
websiteRoutes.delete('/:websiteId', isAdmin, deleteWebsite);

export default websiteRoutes;
