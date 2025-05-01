const express = require('express');
const router = express.Router();
const UpdateTracker = require('../services/updateTracker');

// Get last update time
router.get('/last-update', async (req, res) => {
    try {
        const lastUpdate = await UpdateTracker.getLastUpdate('Admin Users');
        res.json({ 
            lastUpdatedAt: lastUpdate ? lastUpdate.lastUpdatedAt : null,
            updateType: lastUpdate ? lastUpdate.updateType : null,
            updatedBy: lastUpdate ? lastUpdate.updatedBy : null
        });
    } catch (error) {
        console.error('Error fetching last update time:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 