import express from 'express';
import {
    addItemToWishlist,
    removeItemFromWishlist,
    getWishlist,
    clearWishlist
} from '../controller/Wishlist.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/add', verifyToken, addItemToWishlist);
router.post('/remove', verifyToken, removeItemFromWishlist);
router.get('/', verifyToken, getWishlist);
router.post('/clear', verifyToken, clearWishlist);

export default router;
