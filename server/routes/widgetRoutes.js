import express from 'express';
import { getWidgets, createWidget } from '../controllers/widgetController.js';

const router = express.Router();

router.get('/', getWidgets);
router.post('/', createWidget);

export default router;
