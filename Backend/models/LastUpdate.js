const mongoose = require('mongoose');

const lastUpdateSchema = new mongoose.Schema({
    collectionName: {
        type: String,
        required: true,
        unique: true
    },
    lastUpdatedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updateType: {
        type: String,
        enum: ['CSV_UPLOAD', 'DIRECT_MODIFICATION', 'SYSTEM'],
        default: 'SYSTEM'
    },
    updatedBy: {
        type: String,
        required: false
    }
}, { 
    collection: 'LastUpdates',
    timestamps: true 
});

const LastUpdate = mongoose.model('LastUpdate', lastUpdateSchema);

module.exports = LastUpdate; 