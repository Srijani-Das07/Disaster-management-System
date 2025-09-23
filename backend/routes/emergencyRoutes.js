const express = require('express');
const { 
  getEmergencyContacts, 
  updateEmergencyContacts, 
  logEmergencyCall,
  getEmergencyServices 
} = require('../controllers/emergencyController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/contacts', authenticateToken, getEmergencyContacts);
router.put('/contacts', authenticateToken, updateEmergencyContacts);
router.post('/call/log', authenticateToken, logEmergencyCall);
router.get('/services', getEmergencyServices); // Public endpoint

module.exports = router;