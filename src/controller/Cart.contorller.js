// import Cart from '../models/Cart.model.js';
// import Product from '../models/Product.model.js'; // Assuming you have a Product model

// // 1. Add Item to Cart
// export const addItemToCart = async (req, res) => {
//     try {
//         const { productId, quantity } = req.body;

//         const userId = req.user?.id;
//         const referenceWebsite = req.user?.referenceWebsite;
//         const identifier = `${userId}-${referenceWebsite}`;

//         if (!userId) {
//             return res.status(401).json({ message: 'User not authenticated or reference website missing.' });
//         }
//         if (!productId || !quantity) {
//             return res.status(400).json({ message: 'Product ID and Quantity are required.' });
//         }

//         const product = await Product.findById(productId);
//         if (!product) {
//             return res.status(404).json({ message: 'Product not found.' });
//         }

//         let cart = await Cart.findOne({ identifier });
//         if (!cart) {
//             cart = new Cart({
//                 identifier,
//                 items: [{ product: productId, quantity, price: product.price, total: product.actualPrice * quantity }],
//                 totalAmount: product.actualPrice * quantity,
//             });
//         } else {
//             const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
//             if (existingItemIndex > -1) {
//                 const item = cart.items[existingItemIndex];
//                 item.quantity += quantity;
//                 item.total = item.quantity * item.price;
//             } else {
//                 cart.items.push({ product: productId, quantity, price: product.price, total: product.actualPrice * quantity });
//             }
//         }
//         cart.totalAmount = cart.items.reduce((total, item) => total + item.total, 0);
//         await cart.save();
//         res.status(200).json({ message: 'Item added to cart successfully', cart });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Failed to add item to cart', error: error.message });
//     }
// };

// // 2. Update Cart Item Quantity
// export const updateCartItemQuantity = async (req, res) => {
//     try {
//         const { productId, quantity } = req.body;

//         // Ensure required fields are provided
//         if (!req.user?.id || !req.user?.referenceWebsite || !productId || quantity === undefined) {
//             return res.status(400).json({ message: 'User, Product ID, and Quantity are required.' });
//         }

//         const userId = req.user.id;
//         const referenceWebsite = req.user.referenceWebsite;
//         const identifier = `${userId}-${referenceWebsite}`;

//         console.log(`Updating cart for identifier: ${identifier}, Product: ${productId}, Quantity: ${quantity}`);

//         // Ensure quantity is a valid number
//         const parsedQuantity = Number(quantity);
//         if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
//             return res.status(400).json({ message: 'Quantity must be a valid positive number.' });
//         }

//         const cart = await Cart.findOne({ identifier });
//         if (!cart) {
//             return res.status(404).json({ message: 'Cart not found for the user and website.' });
//         }

//         const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
//         if (itemIndex === -1) {
//             return res.status(404).json({ message: 'Product not found in the cart.' });
//         }

//         const item = cart.items[itemIndex];

//         // Ensure actualPrice is a valid number
//         if (!item.hasOwnProperty('actualPrice')) {
//             return res.status(400).json({ message: 'Product actualPrice is missing from the cart item.' });
//         }

//         const actualPrice = Number(item.actualPrice);
//         if (isNaN(actualPrice) || actualPrice < 0) {
//             return res.status(400).json({ message: `Invalid actual price: ${item.actualPrice}` });
//         }

//         // Calculate and validate total price
//         const totalPrice = parsedQuantity * actualPrice;
//         if (isNaN(totalPrice)) {
//             return res.status(500).json({ message: `Failed to calculate total price: ${parsedQuantity} * ${actualPrice} = NaN` });
//         }

//         // Update quantity and total price
//         item.quantity = parsedQuantity;
//         item.total = totalPrice;

//         console.log(`Updated item: Quantity = ${item.quantity}, Total = ${item.total}`);

//         // Recalculate total cart amount
//         const totalAmount = cart.items.reduce((total, item) => total + (Number(item.total) || 0), 0);
//         cart.totalAmount = totalAmount;

//         await cart.save();

//         res.status(200).json({ message: 'Cart item updated successfully', cart });
//     } catch (error) {
//         console.error('Error updating cart item:', error);
//         res.status(500).json({ message: 'Failed to update cart item', error: error.message });
//     }
// };



// // 3. Remove Item from Cart
// export const removeItemFromCart = async (req, res) => {
//     try {
//         const { productId } = req.body;

//         const userId = req.user?.id;
//         const referenceWebsite = req.user?.referenceWebsite;
//         const identifier = `${userId}-${referenceWebsite}`;

//         if (!identifier || !productId) {
//             return res.status(400).json({ message: 'Identifier and Product ID are required.' });
//         }

//         const cart = await Cart.findOne({ identifier });
//         if (!cart) {
//             return res.status(404).json({ message: 'Cart not found for the user and website.' });
//         }

//         const updatedItems = cart.items.filter(item => item.product.toString() !== productId);
//         if (updatedItems.length === 0) {
//             await Cart.deleteOne({ identifier });
//             return res.status(200).json({ message: 'Cart is now empty' });
//         }

//         cart.items = updatedItems;
//         cart.totalAmount = cart.items.reduce((total, item) => total + item.total, 0);
//         await cart.save();
//         res.status(200).json({ message: 'Item removed from cart successfully', cart });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Failed to remove item from cart', error: error.message });
//     }
// };

// // 4. Get Cart for a User
// export const getCart = async (req, res) => {
//     try {
//         const userId = req.user?.id;
//         const referenceWebsite = req.user?.referenceWebsite;
//         const identifier = `${userId}-${referenceWebsite}`;

//         if (!identifier) {
//             return res.status(400).json({ message: 'Identifier is required.' });
//         }

//         const cart = await Cart.findOne({ identifier }).populate('items.product', 'productName images price actualPrice discount');
//         if (!cart) {
//             return res.status(404).json({ message: 'No cart found for the user and website.' });
//         }

//         res.status(200).json({ message: 'Cart retrieved successfully', cart });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Failed to retrieve cart', error: error.message });
//     }
// };

// // 5. Checkout Cart
// export const checkoutCart = async (req, res) => {
//     try {
//         const userId = req.user?.id;
//         const referenceWebsite = req.user?.referenceWebsite;
//         const identifier = `${userId}-${referenceWebsite}`;

//         if (!identifier) {
//             return res.status(400).json({ message: 'Identifier is required.' });
//         }
//         const cart = await Cart.findOne({ identifier });
//         if (!cart) {
//             return res.status(404).json({ message: 'No cart found for the user and website.' });
//         }

//         cart.isCheckedOut = true;
//         cart.lastUpdated = Date.now();
//         await cart.save();

//         res.status(200).json({ message: 'Cart checked out successfully', cart });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Failed to checkout cart', error: error.message });
//     }
// };






import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js'; // Assuming you have a Product model

// 1. Add Item to Cart
export const addItemToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const userId = req.user?.id;
        const referenceWebsite = req.user?.referenceWebsite;
        const identifier = `${userId}-${referenceWebsite}`;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated or reference website missing.' });
        }
        if (!productId || !quantity) {
            return res.status(400).json({ message: 'Product ID and Quantity are required.' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        let cart = await Cart.findOne({ identifier });
        if (!cart) {
            cart = new Cart({
                identifier,
                items: [{ product: productId, quantity, price: product.price, actualPrice: product.actualPrice, total: product.actualPrice * quantity }],
                totalAmount: product.actualPrice * quantity,
            });
        } else {
            const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
            if (existingItemIndex > -1) {
                const item = cart.items[existingItemIndex];
                item.quantity += quantity;
                item.total = item.quantity * item.price;
            } else {
                cart.items.push({ product: productId, quantity, price: product.price, actualPrice: product.actualPrice, total: product.actualPrice * quantity });
            }
        }
        cart.totalAmount = cart.items.reduce((total, item) => total + item.total, 0);
        await cart.save();
        res.status(200).json({ message: 'Item added to cart successfully', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add item to cart', error: error.message });
    }
};

// 2. Update Cart Item Quantity
export const updateCartItemQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Ensure required fields are provided
        if (!req.user?.id || !req.user?.referenceWebsite || !productId || quantity === undefined) {
            return res.status(400).json({ message: 'User, Product ID, and Quantity are required.' });
        }

        const userId = req.user.id;
        const referenceWebsite = req.user.referenceWebsite;
        const identifier = `${userId}-${referenceWebsite}`;

        console.log(`Updating cart for identifier: ${identifier}, Product: ${productId}, Quantity: ${quantity}`);

        // Ensure quantity is a valid number
        const parsedQuantity = Number(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).json({ message: 'Quantity must be a valid positive number.' });
        }

        const cart = await Cart.findOne({ identifier });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for the user and website.' });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not found in the cart.' });
        }

        const item = cart.items[itemIndex];

        // Ensure actualPrice is a valid number
        // if (!item.hasOwnProperty('actualPrice')) {
        //     return res.status(400).json({ message: 'Product actualPrice is missing from the cart item.' });
        // }

        if (!item.hasOwnProperty('actualPrice')) {
            // 👇 fallback to use item.price as actualPrice if missing (from old data)
            item.actualPrice = item.price || 0;
        }


        const actualPrice = Number(item.actualPrice);
        if (isNaN(actualPrice) || actualPrice < 0) {
            return res.status(400).json({ message: `Invalid actual price: ${item.actualPrice}` });
        }

        // Calculate and validate total price
        const totalPrice = parsedQuantity * actualPrice;
        if (isNaN(totalPrice)) {
            return res.status(500).json({ message: `Failed to calculate total price: ${parsedQuantity} * ${actualPrice} = NaN` });
        }

        // Update quantity and total price
        item.quantity = parsedQuantity;
        item.total = totalPrice;

        console.log(`Updated item: Quantity = ${item.quantity}, Total = ${item.total}`);

        // Recalculate total cart amount
        const totalAmount = cart.items.reduce((total, item) => total + (Number(item.total) || 0), 0);
        cart.totalAmount = totalAmount;

        await cart.save();

        res.status(200).json({ message: 'Cart item updated successfully', cart });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Failed to update cart item', error: error.message });
    }
};


// 3. Remove Item from Cart
export const removeItemFromCart = async (req, res) => {
    try {
        const { productId } = req.body;

        const userId = req.user?.id;
        const referenceWebsite = req.user?.referenceWebsite;
        const identifier = `${userId}-${referenceWebsite}`;

        if (!identifier || !productId) {
            return res.status(400).json({ message: 'Identifier and Product ID are required.' });
        }

        const cart = await Cart.findOne({ identifier });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for the user and website.' });
        }

        const updatedItems = cart.items.filter(item => item.product.toString() !== productId);
        if (updatedItems.length === 0) {
            await Cart.deleteOne({ identifier });
            return res.status(200).json({ message: 'Cart is now empty' });
        }

        cart.items = updatedItems;
        cart.totalAmount = cart.items.reduce((total, item) => total + item.total, 0);
        await cart.save();
        res.status(200).json({ message: 'Item removed from cart successfully', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to remove item from cart', error: error.message });
    }
};

// 4. Get Cart for a User
export const getCart = async (req, res) => {
    try {
        const userId = req.user?.id;
        const referenceWebsite = req.user?.referenceWebsite;
        const identifier = `${userId}-${referenceWebsite}`;

        if (!identifier) {
            return res.status(400).json({ message: 'Identifier is required.' });
        }

        const cart = await Cart.findOne({ identifier }).populate('items.product', 'productName images price actualPrice discount');
        if (!cart) {
            return res.status(404).json({ message: 'No cart found for the user and website.' });
        }

        res.status(200).json({ message: 'Cart retrieved successfully', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve cart', error: error.message });
    }
};

// 5. Checkout Cart
export const checkoutCart = async (req, res) => {
    try {
        const userId = req.user?.id;
        const referenceWebsite = req.user?.referenceWebsite;
        const identifier = `${userId}-${referenceWebsite}`;

        if (!identifier) {
            return res.status(400).json({ message: 'Identifier is required.' });
        }
        const cart = await Cart.findOne({ identifier });
        if (!cart) {
            return res.status(404).json({ message: 'No cart found for the user and website.' });
        }

        cart.isCheckedOut = true;
        cart.lastUpdated = Date.now();
        await cart.save();

        res.status(200).json({ message: 'Cart checked out successfully', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to checkout cart', error: error.message });
    }
};
