const express = require('express');
const multer = require('multer');
const { sendBulkEmailWithTemplate, sendBulkEmailWithoutTemplate, createTemplate } = require('../controllers/emailController');

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post('/with-template', upload.single('file'), sendBulkEmailWithTemplate);

router.post('/without-template', upload.single('file'), sendBulkEmailWithoutTemplate);
router.get('/generate-template', createTemplate);

module.exports = router;
