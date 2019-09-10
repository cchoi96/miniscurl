const express = require('express');
const router = express.Router();

// @route   POST /logout
// @desc    Clear cookie
router.post('/', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/');
});

module.exports = router;