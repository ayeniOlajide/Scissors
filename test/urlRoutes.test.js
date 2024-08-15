const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // Replace with your actual app file
const User = require('../models/user');
const ShortUrl = require('../models/shortUrl');

let mongoServer;
let token;

beforeAll(async () => {
    // Start the in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create a test user and log in to get a JWT token
    await request(app)
        .post('/auth/register')
        .send({
            firstName: 'John',
            lastName: 'Doe',
            username: 'johndoe123',
            email: 'johndoe@example.com',
            password: 'password123'
        });

    const loginRes = await request(app)
        .post('/auth/login')
        .send({
            email: 'johndoe@example.com',
            password: 'password123'
        });

    token = loginRes.body.token;
}, 10000); // Increased timeout for setup

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
}, 10000); // Increased timeout for teardown

describe('URL Shortening Routes', () => {
    it('POST /urls/shortUrls - should create a short URL', async () => {
        const res = await request(app)
            .post('/urls/shortUrls')
            .set('Authorization', `Bearer ${token}`)
            .send({
                fullUrl: 'https://www.example.com'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('full', 'https://www.example.com');
        expect(res.body).toHaveProperty('short');
        expect(res.body).toHaveProperty('clicks', 0);
        expect(res.body).toHaveProperty('user');
    });

    it('GET /urls - should get all short URLs for the logged-in user', async () => {
        const res = await request(app)
            .get('/urls')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /urls/:shortUrl - should redirect to the full URL', async () => {
        const shortUrl = await ShortUrl.findOne({ full: 'https://www.example.com' });

        const res = await request(app)
            .get(`/urls/${shortUrl.short}`);

        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('https://www.example.com');
    });

    it('GET /urls/:shortUrl - should return 404 if short URL not found', async () => {
        const res = await request(app)
            .get('/urls/nonexistent');

        expect(res.statusCode).toBe(404);
    });
});
