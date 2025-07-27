// Update script.js dengan konfigurasi API yang benar
const API_BASE_URL = "https://backend-4y4oyyhdg-fidelmirrr4-5370s-projects.vercel.app/api"

// Fungsi API call dengan error handling yang lebih baik
async function apiCall(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    console.log(`🔄 API Call: ${options.method || "GET"} ${url}`)

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`✅ API Success: ${endpoint}`, data)
    return data
  } catch (error) {
    console.error(`❌ API Error for ${endpoint}:`, error)
    throw error
  }
}

// Update fungsi-fungsi API
async function loadLocations() {
  try {
    return await apiCall("/locations")
  } catch (error) {
    console.error("Error loading locations:", error)
    return []
  }
}

async function loadCriteria() {
  try {
    return await apiCall("/criteria")
  } catch (error) {
    console.error("Error loading criteria:", error)
    return []
  }
}

async function loadResults() {
  try {
    return await apiCall("/results")
  } catch (error) {
    console.error("Error loading results:", error)
    return { saw_results: [], wp_results: [] }
  }
}

async function addLocation(locationData) {
  try {
    return await apiCall("/locations", {
      method: "POST",
      body: JSON.stringify(locationData),
    })
  } catch (error) {
    console.error("Error adding location:", error)
    throw error
  }
}

async function updateLocation(id, locationData) {
  try {
    return await apiCall(`/locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(locationData),
    })
  } catch (error) {
    console.error("Error updating location:", error)
    throw error
  }
}

async function deleteLocationAPI(id) {
  try {
    return await apiCall(`/locations/${id}`, {
      method: "DELETE",
    })
  } catch (error) {
    console.error("Error deleting location:", error)
    throw error
  }
}

async function addCriteria(criteriaData) {
  try {
    return await apiCall("/criteria", {
      method: "POST",
      body: JSON.stringify(criteriaData),
    })
  } catch (error) {
    console.error("Error adding criteria:", error)
    throw error
  }
}

async function updateCriteria(id, criteriaData) {
  try {
    return await apiCall(`/criteria/${id}`, {
      method: "PUT",
      body: JSON.stringify(criteriaData),
    })
  } catch (error) {
    console.error("Error updating criteria:", error)
    throw error
  }
}

async function deleteCriteriaAPI(id) {
  try {
    return await apiCall(`/criteria/${id}`, {
      method: "DELETE",
    })
  } catch (error) {
    console.error("Error deleting criteria:", error)
    throw error
  }
}

// Test koneksi API
async function testAPIConnection() {
  try {
    const health = await apiCall("/health")
    console.log("🟢 API Connection: OK", health)
    return true
  } catch (error) {
    console.error("🔴 API Connection: Failed", error)
    return false
  }
}

// Initialize API connection test
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Testing API connection...")
  const isConnected = await testAPIConnection()

  if (isConnected) {
    console.log("✅ API ready, initializing app...")
    // Initialize your app here
  } else {
    console.error("❌ API connection failed, using offline mode")
    // Show error message to user
    const errorDiv = document.createElement("div")
    errorDiv.innerHTML = `
            <div style="background: #fee2e2; border: 1px solid #fecaca; color: #991b1b; padding: 16px; border-radius: 8px; margin: 16px;">
                <h3>⚠️ API Connection Error</h3>
                <p>Unable to connect to backend API. Please check:</p>
                <ul>
                    <li>Backend deployment status</li>
                    <li>CORS configuration</li>
                    <li>Network connectivity</li>
                </ul>
                <p><strong>API URL:</strong> ${API_BASE_URL}</p>
            </div>
        `
    document.body.insertBefore(errorDiv, document.body.firstChild)
  }
})
