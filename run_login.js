const express = require('express');
const router = require('./backend/routes/auth');

// Create minimal Express app to test the route
const app = express();
app.use(express.json());
app.use('/api/auth', router);

const request = require('supertest');

request(app)
  .post('/api/auth/login')
  .send({ email: 'hr@company.com', password: 'admin123', role: 'hr' })
  .end((err, res) => {
    if (err) console.error('Supertest error:', err);
    console.log('Status code:', res.status);
    console.log('Response body:', res.body);
    process.exit(0);
  });
