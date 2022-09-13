import express from 'express';
const router = express.Router();

import { webscrape } from '../models/webscraper/index.js';

router.get('/', async (req, res) => {
	await webscrape();
	return res.status(200).json({ message: 'api available' });
});

export default router;
