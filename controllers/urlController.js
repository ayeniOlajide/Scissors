const ShortUrl = require("../models/shortUrl");
const validUrl = require("valid-url");
const shortid = require("shortid");

exports.createShortUrl = async (req, res) => {
	console.log(req.user);
	let { fullUrl, shortUrl } = req.body;

	if (!validUrl.isUri(fullUrl)) return res.status(400).send("Invalid URL");

	if (shortUrl) {
		const urlExists = await ShortUrl.find({
			short: shortUrl,
		});

		if (urlExists.length > 0) {
			throw new Error("Url already exists");
		}

		if (shortUrl.length < 3 || shortUrl.length > 8)
			throw new Error(
				"Short url must be at least 3 characters long, and below 8 characters."
			);
	}

	const UrlSchema = new ShortUrl({
		full: fullUrl,
		short: shortUrl ? shortUrl : shortid.generate(),
		user: req.user._id,
	});
	await UrlSchema.save();
	res.redirect("/urls");
};

exports.getShortUrls = async (req, res) => {
	console.log(req.ip);
	const shortUrls = await ShortUrl.find({
		user: req.user._id,
	});
	res.render("dashboard", { shortUrls });
};

exports.getShortUrl = async (req, res) => {
	const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
	if (!shortUrl) return res.sendStatus(404);

	shortUrl.clicks++;
	await shortUrl.save();

	res.redirect(shortUrl.full);
};
