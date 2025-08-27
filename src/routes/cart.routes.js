import express from 'express';
import {
    addItemToCart,
    updateCartItemQuantity,
    removeItemFromCart,
    getCart,
    // checkoutCart
} from '../controller/Cart.contorller.js';  // Adjust path based on your directory structure
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// 1. Add item to cart
router.post('/add', verifyToken, addItemToCart);

// 2. Update cart item quantity
router.post('/update', verifyToken, updateCartItemQuantity);

// 3. Remove item from cart
router.post('/remove', verifyToken, removeItemFromCart);

// 4. Get cart for a user
router.get('/', verifyToken, getCart);

// 5. Checkout cart
// router.post('/checkout', verifyToken, checkoutCart);

export default router;
