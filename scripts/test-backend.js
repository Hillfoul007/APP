#!/usr/bin/env node

const BACKEND_URL = "https://auth-back-ula7.onrender.com";

async function testBackend() {
  console.log("🔧 Testing backend connection...\n");

  try {
    // Test health endpoint
    console.log("1. Testing health endpoint...");
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();

    if (healthResponse.ok) {
      console.log("✅ Health check: OK");
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Environment: ${healthData.environment}`);
    } else {
      console.log("❌ Health check: FAILED");
      console.log(`   Status: ${healthResponse.status}`);
    }

    // Test API endpoint
    console.log("\n2. Testing API endpoint...");
    const apiResponse = await fetch(`${BACKEND_URL}/api/test`);
    const apiData = await apiResponse.json();

    if (apiResponse.ok) {
      console.log("✅ API test: OK");
      console.log(`   Message: ${apiData.message}`);
    } else {
      console.log("❌ API test: FAILED");
      console.log(`   Status: ${apiResponse.status}`);
    }

    console.log("\n🎉 Backend is ready for your frontend!");
    console.log(`📡 Backend URL: ${BACKEND_URL}`);
    console.log(`🌐 Health Check: ${BACKEND_URL}/health`);
    console.log(`🧪 API Test: ${BACKEND_URL}/api/test`);
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.log(
      "\n💡 Make sure your backend is deployed and running on Render.",
    );
  }
}

testBackend();
