const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const userSchema = new Schema(
	{
		firstName: {
			type: String,
			required: [true, "First name is required"],
		},
		lastName: {
			type: String,
			required: [true, "Last name is required"],
		},
		username: {
			type: String,
			required: [true, "Username is required"],
			unique: true,
			lowercase: true,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [6, "Password must be at least 6 characters long"],
		},
	},
	{
		timestamps: true,
	}
);

// Hash password before saving
// userSchema.pre("save", async function (next) {
// 	const user = this;

// 	// Only hash the password if it has been modified (or is new)
// 	if (!user.isModified("password")) return next();

// 	try {
// 		const salt = await bcrypt.genSalt(10); // Generate salt
// 		const hash = await bcrypt.hash(user.password, salt); // Hash the password
// 		user.password = hash; // Replace plain text password with hash
// 		next();
// 	} catch (error) {
// 		return next(error);
// 	}
// });

// Validate password
userSchema.methods.passwordIsValid = async function (inputPassword) {
	return await bcrypt.compare(inputPassword, this.password);
};

// Model export
module.exports = mongoose.model("User", userSchema);
