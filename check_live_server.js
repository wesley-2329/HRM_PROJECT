const axios = require('axios');

async function testLive() {
  const url = 'https://hrorbit-sigma.vercel.app/api/auth/login';
  console.log(`Sending POST to live server: ${url}`);
  try {
    const res = await axios.post(url, {
      email: 'hr@company.com',
      password: 'admin123',
      role: 'hr'
    });
    console.log('Status code:', res.status);
    console.log('Response data:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Error status code:', err.response.status);
      console.error('Error response data:', err.response.data);
    } else {
      console.error('Connection error:', err.message);
    }
  }
}

testLive();
