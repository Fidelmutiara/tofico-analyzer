// API Configuration
const API_BASE_URL = "https://backend-4y4oyyhdg-fidelmirrr4-5370s-projects.vercel.app/api"

// API Helper Functions
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    throw error
  }
}

// API Functions
async function loadLocations() {
  return await apiCall("/locations")
}

async function addLocation(locationData) {
  return await apiCall("/locations", {
    method: "POST",
    body: JSON.stringify(locationData),
  })
}

async function updateLocation(id, locationData) {
  return await apiCall(`/locations/${id}`, {
    method: "PUT",
    body: JSON.stringify(locationData),
  })
}

async function deleteLocationAPI(id) {
  return await apiCall(`/locations/${id}`, {
    method: "DELETE",
  })
}

async function loadCriteria() {
  return await apiCall("/criteria")
}

async function addCriteria(criteriaData) {
  return await apiCall("/criteria", {
    method: "POST",
    body: JSON.stringify(criteriaData),
  })
}

async function updateCriteria(id, criteriaData) {
  return await apiCall(`/criteria/${id}`, {
    method: "PUT",
    body: JSON.stringify(criteriaData),
  })
}

async function deleteCriteriaAPI(id) {
  return await apiCall(`/criteria/${id}`, {
    method: "DELETE",
  })
}

async function loadResults() {
  return await apiCall("/results")
}

async function resetData() {
  return await apiCall("/reset-data", {
    method: "POST",
  })
}

async function checkHealth() {
  return await apiCall("/health")
}

// Test API Connection
async function testAPIConnection() {
  try {
    const health = await checkHealth()
    console.log("✅ API Connection successful:", health)
    return true
  } catch (error) {
    console.error("❌ API Connection failed:", error)
    return false
  }
}

// Initialize API connection test
testAPIConnection()
