const mongoose = require('mongoose');
const LastUpdate = require('../models/LastUpdate');

class UpdateTracker {
    static async trackUpdate(collectionName, updateType = 'SYSTEM', updatedBy = 'system') {
        try {
            await LastUpdate.findOneAndUpdate(
                { collectionName },
                { 
                    lastUpdatedAt: new Date(),
                    updateType,
                    updatedBy
                },
                { upsert: true }
            );
        } catch (error) {
            console.error('Error tracking update:', error);
        }
    }

    static async setupChangeStream(collectionName) {
        try {
            const collection = mongoose.connection.collection(collectionName);
            const changeStream = collection.watch();

            changeStream.on('change', async (change) => {
                await UpdateTracker.trackUpdate(
                    collectionName,
                    'DIRECT_MODIFICATION',
                    'database'
                );
            });

            console.log(`Change stream setup for collection: ${collectionName}`);
        } catch (error) {
            console.error('Error setting up change stream:', error);
        }
    }

    static async getLastUpdate(collectionName) {
        try {
            const lastUpdate = await LastUpdate.findOne({ collectionName })
                .sort({ lastUpdatedAt: -1 })
                .lean();
            return lastUpdate;
        } catch (error) {
            console.error('Error getting last update:', error);
            return null;
        }
    }
}

module.exports = UpdateTracker; 