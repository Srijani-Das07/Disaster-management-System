const express = require('express');
const { 
  getReliefCenters, 
  getReliefCenter, 
  createReliefCenter, 
  updateReliefCenterResources,
  getCentersForCache 
} = require('../controllers/reliefController');
const { bulkSyncCenters } = require('../services/syncService');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getReliefCenters);
router.get('/cache', authenticateToken, getCentersForCache);
router.get('/:id', getReliefCenter);
router.post('/', authenticateToken, authorize(['Government', 'Relief_Staff']), createReliefCenter);
router.put('/:id/resources', authenticateToken, authorize(['Government', 'Relief_Staff']), updateReliefCenterResources);
router.post('/sync', authenticateToken, authorize(['Government', 'Relief_Staff']), bulkSyncCenters);

module.exports = router;