const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // Replace with your actual app file
const User = require('../models/user');

let mongoServer;

beforeAll(async () => {
    // Start the in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
  
    // Use the in-memory MongoDB server URI
    await mongoose.disconnect(); // Disconnect any existing connections
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}, 10000); // Increased timeout for setup

afterAll(async () => {
    // Close the mongoose connection and stop the in-memory MongoDB server
    await mongoose.connection.close();
    await mongoServer.stop();
}, 10000); // Increased timeout for teardown

describe('Auth Routes', () => {
    it('POST /auth/register - should register a new user', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                username: 'johndoe123',
                email: 'johndoe@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'User registered successfully.');
        expect(res.body).toHaveProperty('token');
    });

    it('POST /auth/login - should log in an existing user', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: 'johndoe@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'User logged in successfully.');
        expect(res.body).toHaveProperty('token');
    });

    it('POST /auth/login - should fail with invalid credentials', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: 'johndoe@example.com',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
});
