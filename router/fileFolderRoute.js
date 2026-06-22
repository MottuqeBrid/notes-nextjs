import express from 'express';
import { userMiddleware } from '../middleware/userMiddleware';
import { getUserModel } from '../models/userModel.js';
import { getFileModel } from '../models/fileModel.js';
import { saveDeviceData } from '../lib/saveDevicedata.js';

const router = express.Router();

router.post('/folder', userMiddleware, async (req, res) => {
	try {
		const User = await getUserModel();
		const File = await getFileModel();
		const { id } = req.user;
		const user = await User.findById(id).populate('folders');
		await saveDeviceData(req, user._id, ['create-folder']);
		if (!user) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}
		const { name } = req.body;
		const existingFolder = user.folders.find((folder) => folder.name === name);
		if (existingFolder) {
			return res.status(409).json({ success: false, message: 'Folder with the same name already exists' });
		}
		const folder = await new File({
			...req.body,
			owner: user._id,
		});
		await folder.save();
		user.folders.push(folder._id);
		await user.save();
		return res.status(201).json({ success: true, message: 'Folder created successfully', folder });
	} catch (error) {
		console.error('POST /folder error:', error);
		return res.status(500).json({ success: false, message: 'Failed to create folder' });
	}
});

router.get('/folders', userMiddleware, async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;
	const skip = (page - 1) * limit;
	try {
		const User = await getUserModel();
		const { id } = req.user;
		const user = await User.findById(id).populate('folders');
		await saveDeviceData(req, user._id, ['get-folders']);
		if (!user) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}
		if (user.folders.length === 0) {
			return res.status(404).json({ success: false, message: 'No folders found' });
		}
		if (skip >= user.folders.length) {
			return res.status(404).json({ success: false, message: 'Page not found' });
		}
		if (limit <= 0) {
			return res.status(400).json({ success: false, message: 'Invalid limit value' });
		}
		if (page <= 0) {
			return res.status(400).json({ success: false, message: 'Invalid page value' });
		}
		const folders = user.folders.slice(skip, skip + limit);
		return res.status(200).json({ success: true, message: 'Folders fetched successfully', folders });
	} catch (error) {
		console.error('GET /folders error:', error);
		return res.status(500).json({ success: false, message: 'Failed to fetch folders' });
	}
});

router.get('/folder/:id', userMiddleware, async (req, res) => {
	try {
		const User = await getUserModel();
		const { id } = req.user;
		const user = await User.findById(id).populate('folders');
		await saveDeviceData(req, user._id, ['get-folder', 'folder-id:' + req.params.id]);
		if (!user) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}
		const folder = user.folders.find((folder) => folder._id.toString() === req.params.id && !folder.isDeleted);
		if (!folder) {
			return res.status(404).json({ success: false, message: 'Folder not found' });
		}
		return res.status(200).json({ success: true, message: 'Folder fetched successfully', folder });
	} catch (error) {
		console.error('GET /folder/:id error:', error);
		return res.status(500).json({ success: false, message: 'Failed to fetch folder' });
	}
});

router.delete('/folder/:id', userMiddleware, async (req, res) => {
	try {
		const User = await getUserModel();
		const File = await getFileModel();
		const { id } = req.user;
		const user = await User.findById(id).populate('folders');
		if (!user) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}
		const folder = user.folders.find((folder) => folder._id.toString() === req.params.id && !folder.isDeleted);
		if (!folder) {
			return res.status(404).json({ success: false, message: 'Folder not found' });
		}
		user.folders = user.folders.filter((folder) => folder._id.toString() !== req.params.id);
		await user.save();
		await saveDeviceData(req, user._id, ['delete-folder', 'folder-id:' + req.params.id]);
		const deletedFolder = await File.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
		return res.status(200).json({ success: true, message: 'Folder deleted successfully', folder });
	} catch (error) {
		console.error('DELETE /folder/:id error:', error);
		return res.status(500).json({ success: false, message: 'Failed to delete folder' });
	}
});

export default router;
