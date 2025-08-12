import mongoose from 'mongoose'; // Use import instead of require
const { Schema } = mongoose;

const WebsiteListSchema = new Schema({
    websiteName: {
        type: String,
        required: true,
        trim: true,
    },
    websiteDescription: {
        type: String,
    },
    websiteURL: {
        type: String
        // validate: {
        //   validator: function(value) {
        //     return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(value); // basic URL validation
        //   },
        //   message: 'Invalid URL format'
        // }
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    activeStatus: {
        type: Boolean,
        default: true,
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductCategory'
    }],
    logoPath: {
        type: String,
        required: true,
    }
});

const Websitelist = mongoose.model('Websitelist', WebsiteListSchema);

export default Websitelist; // Export using ES module syntax
