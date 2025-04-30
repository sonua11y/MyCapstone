const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const contentPath = path.join(__dirname, '../content.json');

// Get all content
router.get('/', async (req, res) => {
  try {
    const content = await fs.readFile(contentPath, 'utf8');
    res.json(JSON.parse(content));
  } catch (error) {
    res.status(500).json({ message: 'Error reading content', error: error.message });
  }
});

// Update specific content
router.put('/:section', async (req, res) => {
  try {
    const content = JSON.parse(await fs.readFile(contentPath, 'utf8'));
    const { section } = req.params;
    
    if (!content.titles[section]) {
      return res.status(404).json({ message: 'Section not found' });
    }

    content.titles[section] = { ...content.titles[section], ...req.body };
    await fs.writeFile(contentPath, JSON.stringify(content, null, 2));
    
    res.json(content.titles[section]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating content', error: error.message });
  }
});

module.exports = router; 