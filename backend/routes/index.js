import express from 'express';
const router = express.Router();

import { webscrape } from '../models/webscraper/index.js';

router.get('/:searchTerm', async (req, res) => {
	const { searchTerm } = req.params;

	const term = String(searchTerm.split('=')[1]);

	const modelQuery = await webscrape(term, 1);

	console.log(modelQuery);

	return res.status(modelQuery.status).json(modelQuery);
});

export default router;
