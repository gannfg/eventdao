// Simple test script to verify API endpoints
// Run this after starting the server with: node test-api.js

const BASE_URL = 'http://localhost:4000';

async function testAPI() {
  console.log('🧪 Testing EventDAO User API...\n');

  try {
    // Test 1: Create a user
    console.log('1. Creating a test user...');
    const createResponse = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser123',
        wallet_address: '11111111111111111111111111111111111111111111' // 44 chars
      })
    });

    if (createResponse.ok) {
      const user = await createResponse.json();
      console.log('✅ User created:', user.user);
      const userId = user.user.id;

      // Test 2: Get all users
      console.log('\n2. Getting all users...');
      const getAllResponse = await fetch(`${BASE_URL}/api/users`);
      if (getAllResponse.ok) {
        const users = await getAllResponse.json();
        console.log('✅ All users:', users.users.length, 'found');
      }

      // Test 3: Get user by ID
      console.log('\n3. Getting user by ID...');
      const getByIdResponse = await fetch(`${BASE_URL}/api/users/${userId}`);
      if (getByIdResponse.ok) {
        const user = await getByIdResponse.json();
        console.log('✅ User by ID:', user.user.username);
      }

      // Test 4: Get user by wallet address
      console.log('\n4. Getting user by wallet address...');
      const getByWalletResponse = await fetch(`${BASE_URL}/api/users/wallet/11111111111111111111111111111111111111111111`);
      if (getByWalletResponse.ok) {
        const user = await getByWalletResponse.json();
        console.log('✅ User by wallet:', user.user.username);
      }

      // Test 5: Update user
      console.log('\n5. Updating user...');
      const updateResponse = await fetch(`${BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'updateduser123'
        })
      });

      if (updateResponse.ok) {
        const user = await updateResponse.json();
        console.log('✅ User updated:', user.user.username);
      }

      // Test 6: Delete user
      console.log('\n6. Deleting user...');
      const deleteResponse = await fetch(`${BASE_URL}/api/users/${userId}`, {
        method: 'DELETE'
      });

      if (deleteResponse.status === 204) {
        console.log('✅ User deleted successfully');
      }

    } else {
      const error = await createResponse.json();
      console.log('❌ Failed to create user:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🎉 API testing completed!');
}

testAPI();
