import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
}, { _id: false });

const wishlistSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        unique: true,
    },
    items: [wishlistItemSchema],
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
});

wishlistSchema.pre('save', function(next) {
    this.lastUpdated = Date.now();
    next();
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
