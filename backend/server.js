import express from 'express';

const app = express();
const PORT = 8081 || process.env.PORT;

import router from './routes/index.js';
app.use(router);

app.listen(PORT, (req, res) => {
	console.log(`listening on port ${PORT}`);
});
