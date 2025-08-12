import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
}, { _id: false });

const cartSchema = new mongoose.Schema({
    identifier:{
        type:String,
        required:true,
        unique: true
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0,
        required: true,
    },
    isCheckedOut: {
        type: Boolean,
        default: false,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
});

cartSchema.pre('save', function (next) {
    // Recalculate the total amount
    this.totalAmount = this.items.reduce((total, item) => total + item.total, 0);
    next();
});

// Cart model
const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
