const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API for user registration, login, and authentication.
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - username
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The user's first name.
 *                 example: John
 *               lastName:
 *                 type: string
 *                 description: The user's last name.
 *                 example: Doe
 *               username:
 *                 type: string
 *                 description: The username, which must be unique.
 *                 example: johndoe123
 *               email:
 *                 type: string
 *                 description: The user's email, which must be unique.
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: The user's password (minimum 6 characters).
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully and JWT token issued.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully.
 *                 token:
 *                   type: string
 *                   description: The JWT token.
 *       400:
 *         description: Bad request, possibly due to validation errors or existing user.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: password123
 *     responses:
 *       200:
 *         description: User logged in successfully and JWT token issued.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User logged in successfully.
 *                 token:
 *                   type: string
 *                   description: The JWT token.
 *       400:
 *         description: Invalid credentials.
 *       500:
 *         description: Internal server error.
 */



router.get('/register', (req, res) => res.render('register'));
router.post('/register', authController.register);
router.get('/login', (req, res) => res.render('login'));
router.post('/login', authController.login);


module.exports = router;
