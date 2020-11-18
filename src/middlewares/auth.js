require('dotenv').config();

module.exports = function (req, res, next) {
	const authHeader = req.headers['authorization'];

	if (typeof authHeader === 'undefined') {
    return res
      .status(401)
      .json({ data: null, error: 'Unauthorized: Missing Authorization Token' });
	}

	const token = authHeader && authHeader.split(' ')[1];

	if (token !== process.env.AUTH_TOKEN) {
		return res
			.status(403)
			.json({ data: null, error: 'Forbidden: Invalid Authorization Code' });
	}

	next();
}