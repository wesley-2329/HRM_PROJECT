const axios = require('axios');

async function testClockOut() {
  const baseURL = 'http://localhost:5001/api';
  
  // Start server locally in background
  console.log('Testing flow...');
  try {
    // 1. Login
    console.log('1. Logging in...');
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: 'johnwesley.290305@gmail.com',
      password: 'employee123',
      role: 'employee'
    });
    
    const token = loginRes.data.token;
    console.log('Login successful, token retrieved.');
    
    // Save state header
    let mockStateHeader = loginRes.headers['x-mock-state'];
    console.log('Received initial state header size:', mockStateHeader ? mockStateHeader.length : 0);
    
    // 2. Clock-In
    console.log('\n2. Clocking in...');
    const clockInRes = await axios.post(`${baseURL}/timesheet/clock-in`, {
      clockIn: '10:00 AM',
      date: '2026-07-16'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-mock-state': mockStateHeader
      }
    });
    
    mockStateHeader = clockInRes.headers['x-mock-state'];
    console.log('Clock-in successful. Returned data:', clockInRes.data);
    console.log('Received post-clock-in state header size:', mockStateHeader ? mockStateHeader.length : 0);
    
    // Verify that active shift is in the state
    if (mockStateHeader) {
      const stateObj = JSON.parse(mockStateHeader);
      console.log('Current state timesheets:', stateObj.mockTimesheets);
    }
    
    // 3. Clock-Out
    console.log('\n3. Clocking out...');
    const clockOutRes = await axios.post(`${baseURL}/timesheet/clock-out`, {
      clockOut: '06:00 PM',
      date: '2026-07-16'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-mock-state': mockStateHeader
      }
    });
    
    mockStateHeader = clockOutRes.headers['x-mock-state'];
    console.log('Clock-out successful. Returned data:', clockOutRes.data);
    
    if (mockStateHeader) {
      const stateObj = JSON.parse(mockStateHeader);
      console.log('Final state timesheets after clock out:', stateObj.mockTimesheets);
    }
    
  } catch (err) {
    console.error('Error during test:', err.response ? err.response.data : err.message);
  }
}

testClockOut();
