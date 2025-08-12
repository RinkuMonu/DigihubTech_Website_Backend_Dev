import Wishlist from '../models/Wishlist.model.js';
import Product from '../models/Product.model.js';

// 1. Add item to wishlist
export const addItemToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user?.id;
        const referenceWebsite = req.user?.referenceWebsite;
        const identifier = `${userId}-${referenceWebsite}`;

        if (!userId || !referenceWebsite) {
            return res.status(401).json({ message: 'User not authenticated or reference website missing.' });
        }

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required.' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        let wishlist = await Wishlist.findOne({ identifier });
        if (!wishlist) {
            wishlist = new Wishlist({
                identifier,
                items: [{ product: productId }]
            });
        } else {
            const exists = wishlist.items.find(item => item.product.toString() === productId);
            if (exists) {
                return res.status(409).json({ message: 'Product already in wishlist.' });
            }
            wishlist.items.push({ product: productId });
        }

        await wishlist.save();
        res.status(200).json({ message: 'Item added to wishlist successfully', wishlist });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add item to wishlist', error: error.message });
    }
};

// 2. Remove item from wishlist
export const removeItemFromWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user?.id;
        const referenceWebsite = req.user?.referenceWebsite;
        const identifier = `${userId}-${referenceWebsite}`;

        if (!identifier || !productId) {
            return res.status(400).json({ message: 'Identifier and Product ID are required.' });
        }

        const wishlist = await Wishlist.findOne({ identifier });
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found.' });
        }

        wishlist.items = wishlist.items.filter(item => item.product.toString() !== productId);
        await wishlist.save();

        res.status(200).json({ message: 'Item removed from wishlist successfully', wishlist });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to remove item from wishlist', error: error.message });
    }
};

// 3. Get wishlist
export const getWishlist = async (req, res) => {
    try {
        const userId = req.user?.id;
        const referenceWebsite = req.user?.referenceWebsite;
        const identifier = `${userId}-${referenceWebsite}`;

        if (!identifier) {
            return res.status(400).json({ message: 'Identifier is required.' });
        }

        const wishlist = await Wishlist.findOne({ identifier }).populate('items.product', 'productName images price actualPrice discount');
        if (!wishlist) {
            return res.status(404).json({ message: 'No wishlist found.' });
        }

        res.status(200).json({ message: 'Wishlist retrieved successfully', wishlist });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve wishlist', error: error.message });
    }
};

// 4. Clear wishlist
export const clearWishlist = async (req, res) => {
    try {
        const userId = req.user?.id;
        const referenceWebsite = req.user?.referenceWebsite;
        const identifier = `${userId}-${referenceWebsite}`;

        if (!identifier) {
            return res.status(400).json({ message: 'Identifier is required.' });
        }

        await Wishlist.deleteOne({ identifier });
        res.status(200).json({ message: 'Wishlist cleared successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to clear wishlist', error: error.message });
    }
};
