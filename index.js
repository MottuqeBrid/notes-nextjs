import { httpServerHandler } from 'cloudflare:node';
import express from 'express';
import cors from 'cors';
import { connectDB } from './lib/db.js';
import indexHtml from './files/index.html';

// importing routes
import userRoutes from './router/userRoute.js';
import noteRoutes from './router/noteRoute.js';
import fileRoutes from './router/fileFolderRoute.js';

// importing models to ensure they are registered
import { saveDeviceData } from './lib/saveDevicedata.js';

const app = express();

const version = process.env.VERSION || 'v1';
const configuredPort = Number.parseInt(process.env.PORT ?? '', 10);
const port = Number.isFinite(configuredPort) ? configuredPort : 3000;

console.log(version, port);
// cors configuration to allow requests from the frontend
app.use(
	cors({
		origin: ['http://localhost:5173', 'http://localhost:5174'],
		credentials: true,
	}),
);
app.use(express.json());

// Database connection middleware
let dbConnected = false;

app.use(async (req, res, next) => {
	if (!dbConnected) {
		try {
			await connectDB();
			dbConnected = true;
			console.log('Database connected');
			await saveDeviceData(req, null, ['db-connected']);
		} catch (err) {
			return res.status(503).json({ error: 'Database unavailable' });
		}
	}
	next();
});

// API routes
// user routes
app.use(`/${version}/user`, userRoutes);
// note routes
app.use(`/${version}/note`, noteRoutes);
app.use(`/${version}/file`, fileRoutes);

// Basic route to check if the API is running
app.get(`/${version}/health`, (req, res) => {
	res.status(200).json({ status: 'OK' });
});

// Serve the index.html for the root path
app.get('/', async (req, res) => {
	await saveDeviceData(req, null, ['test']);
	res.status(200).type('html').send(indexHtml);
});

app.use((err, req, res, next) => {
	console.error('Unhandled error:', err);
	res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
	console.log(`Note API server is running on port ${port}`);
});
export default httpServerHandler({ port });
