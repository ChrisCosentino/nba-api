  
const express = require('express');

const router = express.Router();

// @Route   GET api/players
// @desc    Get players
// @access  Public
router.get('/', (req, res) => {
    res.send('profile api')
});


module.exports = router;