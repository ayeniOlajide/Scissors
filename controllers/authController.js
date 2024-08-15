const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const registerSchema = Joi.object({
	firstName: Joi.string().required(),
	lastName: Joi.string().required(),
	username: Joi.string().required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().required(),
});

exports.register = async (req, res) => {
	try {
		const { error } = registerSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		const { firstName, lastName, username, email, password } = req.body;

		const userExists = await User.findOne({ email });
		if (userExists) return res.status(400).send("User already exists");
		console.log(password);
		const hashedPassword = bcrypt.hashSync(password, 10);
		console.log(hashedPassword);

		const user = new User({
			firstName,
			lastName,
			username,
			email,
			password: hashedPassword,
		});
		await user.save();

		const token = jwt.sign(
			{ _id: user._id },
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: "1h" }
		);
		res.cookie("jwt", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
		});
		res.redirect("/urls");
	} catch (error) {
		console.error("Server Error:", error);
		res.status(500).send("Server error");
	}
};

exports.login = async (req, res) => {
	try {
		const { error } = loginSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.status(400).send("Invalid credentials");
		console.log(password, user.password);
		const validPassword = await bcrypt.compare(password, user.password);
		console.log(validPassword);
		if (!validPassword) return res.status(400).send("Invalid credentials");
		const token = jwt.sign(
			{ _id: user._id },
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: "1h" }
		);
		res.cookie("jwt", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
		});
		res.redirect("/urls");
	} catch (error) {
		console.error("Server Error:", error);
		res.status(500).send("Server error");
	}
};

exports.getUserURLList = async (req, res) => {
	try {
		const { userId } = req.body;
		if (!userId)
			return res
				.status(400)
				.json({ status: false, message: "User ID is required" });

		const allUserUrl = await urlSubmitModel.find({ userId });
		if (allUserUrl.length > 0) {
			res.json({ status: true, success: allUserUrl });
		} else {
			res.json({ status: false, message: "No data found" });
		}
	} catch (error) {
		console.error("Server Error:", error);
		res.status(500).send("Server error");
	}
};

exports.logout = (req, res) => {
	res.cookie("jwt", "", { maxAge: 1 });
	res.send("Logged out successfully");
};
