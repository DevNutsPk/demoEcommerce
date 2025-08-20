// Test script for order status API
const axios = require('axios');

const BASE_URL = 'http://localhost:8000';
const testOrderId = '65c2658db53f820728d0745a'; // Use an actual order ID from your DB

async function testOrderStatusAPI() {
    try {
        console.log('🧪 Testing Order Status API...\n');

        // Test 1: Fetch order details
        console.log('1. Testing GET /orders/:id');
        const orderResponse = await axios.get(`${BASE_URL}/orders/${testOrderId}`);
        console.log('✅ Order fetched successfully');
        console.log('Current status:', orderResponse.data.status);
        console.log('Status history:', orderResponse.data.statusHistory || 'None');
        console.log('');

        // Test 2: Try to update status without authentication (should fail)
        console.log('2. Testing PUT /orders/:id/status without auth (should fail)');
        try {
            await axios.put(`${BASE_URL}/orders/${testOrderId}/status`, {
                status: 'Delivered'
            });
        } catch (error) {
            console.log('✅ Correctly blocked:', error.response.data.message);
        }
        console.log('');

        // Test 3: Login as admin first (you'll need to implement this)
        console.log('3. You need to:');
        console.log('   - Make sure you have an admin user (isAdmin: true)');
        console.log('   - Login via POST /auth/login to get JWT token');
        console.log('   - Use that token in Cookie header for status update');
        console.log('');

        console.log('✅ Basic API structure is working!');
        console.log('❗ Next step: Create admin user and test with authentication');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testOrderStatusAPI();
