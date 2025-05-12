const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const multer = require('multer');
const upload = multer();

router.post('/trauma', assessmentController.analyzeTrauma);
router.post('/medication', assessmentController.analyzeMedication);
router.post('/voice', upload.single('audio'), assessmentController.analyzeVoice);

module.exports = router; 