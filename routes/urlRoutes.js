const express = require('express');
const router = express.Router();
const { createShortUrl, getShortUrls, getShortUrl } = require('../controllers/urlController');
const { redisCachingMiddleware } = require('../helpers/redis');


/**
 * @swagger
 * tags:
 *   name: Short URLs
 *   description: API to manage URL shortening.
 */

/**
 * @swagger
 * /urls/shortUrls:
 *   post:
 *     summary: Create a short URL
 *     tags: [Short URLs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - fullUrl
 *             properties:
 *               fullUrl:
 *                 type: string
 *                 description: The full URL to be shortened.
 *                 example: https://www.example.com
 *               shortUrl:
 *                 type: string
 *                 description: Optional custom short URL.
 *                 example: example123
 *     responses:
 *       201:
 *         description: Short URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique identifier for the short URL.
 *                 full:
 *                   type: string
 *                   description: The full URL.
 *                 short:
 *                   type: string
 *                   description: The shortened URL identifier.
 *                 clicks:
 *                   type: integer
 *                   description: The number of clicks on the short URL.
 *                   example: 0
 *                 user:
 *                   type: string
 *                   description: The user ID who created the short URL.
 *       400:
 *         description: Invalid URL or Short URL already exists
 */

/**
 * @swagger
 * /urls:
 *   get:
 *     summary: Get all short URLs for the logged-in user
 *     tags: [Short URLs]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of short URLs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The unique identifier for the short URL.
 *                   full:
 *                     type: string
 *                     description: The full URL.
 *                   short:
 *                     type: string
 *                     description: The shortened URL identifier.
 *                   clicks:
 *                     type: integer
 *                     description: The number of clicks on the short URL.
 *                     example: 0
 *                   user:
 *                     type: string
 *                     description: The user ID who created the short URL.
 *       401:
 *         description: Unauthorized, user needs to log in
 */

/**
 * @swagger
 * /urls/{shortUrl}:
 *   get:
 *     summary: Redirect to the full URL using the short URL
 *     tags: [Short URLs]
 *     parameters:
 *       - in: path
 *         name: shortUrl
 *         schema:
 *           type: string
 *         required: true
 *         description: The short URL identifier.
 *     responses:
 *       302:
 *         description: Redirects to the full URL
 *       404:
 *         description: Short URL not found
 */


router.post('/shortUrls', createShortUrl);

router.get('/', getShortUrls);
router.get('/:shortUrl', redisCachingMiddleware(), getShortUrl);

module.exports = router;

