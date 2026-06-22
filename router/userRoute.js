import express from 'express';
import { getUserModel } from '../models/userModel.js';
import { getOtpModel } from '../models/otpModel.js';
import { comparePassword, hashPassword } from '../lib/password';
import { generateToken } from '../lib/jwt';
import { userMiddleware } from '../middleware/userMiddleware';
import { generateOTP } from '../lib/otp';
import { saveDeviceData } from '../lib/saveDevicedata.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
	const { password, name, email } = req.body;
	if (!password || !name || !email) {
		return res.status(400).json({ success: false, message: 'Invalid user data' });
	}
	try {
		const User = await getUserModel();
		const OTP = await getOtpModel();
		const existingUser = await User.findOne({ email: email.toLowerCase() });
		if (existingUser) {
			return res.status(409).json({ success: false, message: 'Email already in use' });
		}
		const hashedPassword = await hashPassword(password);

		const user = await new User({
			name,
			email: email.toLowerCase(),
			password: hashedPassword,
		});
		await user.save();
		await saveDeviceData(req, user._id, ['signup']);

		const otp = await new OTP({
			code: generateOTP(),
			user: user._id,
		});
		await otp.save();
		user.otps.push(otp._id);
		await user.save();
		const token = await generateToken({ id: user._id, role: user.role });
		res.cookie('token', token, { httpOnly: true });
		return res.status(201).json({ success: true, message: 'User created successfully', token });
	} catch (err) {
		console.error('POST /user error:', err);
		return res.status(500).json({ success: false, message: 'Failed to create user' });
	}
});

router.post('/login', async (req, res) => {
	try {
		const User = await getUserModel();
		const { email, password } = req.body;
		const user = await User.findOne({ email: email.toLowerCase() });
		await saveDeviceData(req, user._id, ['login']);
		if (!user) {
			return res.status(401).json({ success: false, message: 'Invalid credentials' });
		}
		const isPasswordValid = await comparePassword(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ success: false, message: 'Invalid credentials' });
		}
		const token = await generateToken({ id: user._id, role: user.role });
		res.cookie('token', token, { httpOnly: true });
		return res.status(200).json({ success: true, message: 'Login successful', token });
	} catch (err) {
		console.error('POST /user/login error:', err);
		return res.status(500).json({ success: false, message: 'Failed to login' });
	}
});

router.get('/me', userMiddleware, async (req, res) => {
	try {
		const User = await getUserModel();
		const user = await User.findById(req.user.id).select('-password');
		await saveDeviceData(req, user._id, ['login-me']);
		return res.status(200).json({ success: true, message: 'Users retrieved successfully', user });
	} catch (err) {
		console.error('GET /user error:', err);
		return res.status(500).json({ success: false, message: 'Failed to retrieve users' });
	}
});

export default router;
