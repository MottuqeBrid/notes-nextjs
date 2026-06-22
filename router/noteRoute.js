import express from 'express';
import { userMiddleware } from '../middleware/userMiddleware';
import { getUserModel } from '../models/userModel.js';
import { getNoteModel } from '../models/noteModel.js';
import { saveDeviceData } from '../lib/saveDevicedata.js';
const router = express.Router();

router.post('/note', userMiddleware, async (req, res) => {
	try {
		const User = await getUserModel();
		const Note = await getNoteModel();
		const user = await User.findById(req.user.id).populate('notes');
		await saveDeviceData(req, user._id, ['create-note']);
		if (!user) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}
		const { title, content } = req.body;
		const note = await new Note({
			...req.body,
			user: user._id,
		});
		await note.save();
		user.notes.push(note._id);
		await user.save();
		return res.status(201).json({ success: true, message: 'Note created successfully', note });
	} catch (error) {
		console.error('POST /notes error:', error);
		return res.status(500).json({ success: false, message: 'Failed to create note' });
	}
});

router.get('/notes', userMiddleware, async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;
	const skip = (page - 1) * limit;
	try {
		const User = await getUserModel();
		const user = await User.findById(req.user.id).populate('notes');
		await saveDeviceData(req, user._id, ['get-notes']);
		if (!user) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}
		if (user.notes.length === 0) {
			return res.status(404).json({ success: false, message: 'No notes found' });
		}
		if (skip >= user.notes.length) {
			return res.status(404).json({ success: false, message: 'Page not found' });
		}
		if (limit <= 0) {
			return res.status(400).json({ success: false, message: 'Invalid limit value' });
		}
		if (page <= 0) {
			return res.status(400).json({ success: false, message: 'Invalid page value' });
		}
		const notes = user.notes.slice(skip, skip + limit);
		return res.status(200).json({ success: true, message: 'Notes fetched successfully', notes, total: user.notes.length });
	} catch (error) {
		console.error('GET /notes error:', error);
		return res.status(500).json({ success: false, message: 'Failed to fetch notes' });
	}
});

router.get('/note/:id', userMiddleware, async (req, res) => {
	try {
		const User = await getUserModel();
		const Note = await getNoteModel();
		const user = await User.findById(req.user.id);
		await saveDeviceData(req, user._id, ['get-note', 'note-id:' + req.params.id]);
		if (!user) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}
		const note = await Note.findOne({ _id: req.params.id, user: user._id }).populate('user');
		if (!note) {
			return res.status(404).json({ success: false, message: 'Note not found' });
		}
		return res.status(200).json({ success: true, message: 'Note fetched successfully', note });
	} catch (error) {
		console.error('GET /note/:id error:', error);
		return res.status(500).json({ success: false, message: 'Failed to fetch note' });
	}
});

router.patch('/note/:id', userMiddleware, async (req, res) => {
	try {
		const User = await getUserModel();
		const Note = await getNoteModel();
		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}
		const noteInUser = user.notes.find((noteId) => noteId.toString() === req.params.id);
		if (!noteInUser) {
			return res.status(404).json({ success: false, message: 'Note not found in user notes' });
		}
		const note = await Note.findOne({ _id: req.params.id, user: user._id });
		if (!note) {
			return res.status(404).json({ success: false, message: 'Note not found' });
		}
		note.title = req.body.title;
		note.content = req.body.content;
		await note.save();
		await saveDeviceData(req, user._id, ['update-note', 'note-id:' + req.params.id]);
		return res.status(200).json({ success: true, message: 'Note updated successfully', note });
	} catch (error) {
		console.error('PATCH /note/:id error:', error);
		return res.status(500).json({ success: false, message: 'Failed to update note' });
	}
});

router.delete('/note/:id', userMiddleware, async (req, res) => {
	try {
		const User = await getUserModel();
		const Note = await getNoteModel();
		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}
		const noteInUser = user.notes.find((noteId) => noteId.toString() === req.params.id);
		if (!noteInUser) {
			return res.status(404).json({ success: false, message: 'Note not found in user notes' });
		}
		const note = await Note.findOneAndDelete({ _id: req.params.id, user: user._id });
		if (!note) {
			return res.status(404).json({ success: false, message: 'Note not found' });
		}
		await saveDeviceData(req, user._id, ['delete-note', 'note-id:' + req.params.id]);
		return res.status(200).json({ success: true, message: 'Note deleted successfully', note });
	} catch (error) {
		console.error('DELETE /note/:id error:', error);
		return res.status(500).json({ success: false, message: 'Failed to delete note' });
	}
});

router.get('/notes/search', userMiddleware, async (req, res) => {
	try {
		const User = await getUserModel();
		const user = await User.findById(req.user.id).populate('notes');
		if (!user) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}
		await saveDeviceData(req, user._id, ['search-notes']);
		const notes = user.notes.filter((note) => note.title.toLowerCase().includes(req.query.query.toLowerCase()));
		return res.status(200).json({ success: true, message: 'Notes fetched successfully', notes });
	} catch (error) {
		console.error('GET /notes/search error:', error);
		return res.status(500).json({ success: false, message: 'Failed to fetch notes' });
	}
});

export default router;
