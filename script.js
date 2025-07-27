// Updated script.js with API integration
// Replace your existing script.js with this updated version

// Global variables
let locations = []
let criteria = []
const currentCoordinates = { lat: 0, lng: 0 }
const editingLocationId = null
const editingCriteriaId = null

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
    showErrorMessage(`Error: ${error.message}`)
    throw error
  }
}

// Show error message to user
function showErrorMessage(message) {
  // Create or update error message element
  let errorDiv = document.getElementById("error-message")
  if (!errorDiv) {
    errorDiv = document.createElement("div")
    errorDiv.id = "error-message"
    errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fee2e2;
            color: #991b1b;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #fecaca;
            z-index: 1001;
            max-width: 400px;
        `
    document.body.appendChild(errorDiv)
  }

  errorDiv.textContent = message
  errorDiv.style.display = "block"

  // Auto hide after 5 seconds
  setTimeout(() => {
    errorDiv.style.display = "none"
  }, 5000)
}

// API Functions
async function loadLocations() {
  try {
    locations = await apiCall("/locations")
    return locations
  } catch (error) {
    locations = []
    return []
  }
}

async function addLocationAPI(locationData) {
  return await apiCall("/locations", {
    method: "POST",
    body: JSON.stringify(locationData),
  })
}

async function updateLocationAPI(id, locationData) {
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
  try {
    criteria = await apiCall("/criteria")
    return criteria
  } catch (error) {
    criteria = []
    return []
  }
}

async function addCriteriaAPI(criteriaData) {
  return await apiCall("/criteria", {
    method: "POST",
    body: JSON.stringify(criteriaData),
  })
}

async function updateCriteriaAPI(id, criteriaData) {
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
  try {
    return await apiCall("/results")
  } catch (error) {
    return { saw_results: [], wp_results: [] }
  }
}

// Tab Management
function showTab(tabName, event = null) {
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active")
  })
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.remove("active")
  })

  const tab = document.getElementById(tabName)
  if (tab) {
    tab.classList.add("active")
    if (event && event.target) {
      event.target.classList.add("active")
    } else {
      const button = document.querySelector(`.tab-button[onclick="showTab('${tabName}')"]`)
      if (button) {
        button.classList.add("active")
      }
    }
  }

  // Refresh content based on tab
  switch (tabName) {
    case "results":
      renderResults()
      break
    case "locations":
      renderLocations()
      break
    case "map":
      renderMap()
      break
    case "criteria":
      renderCriteria()
      break
  }
}

// Algorithm implementations (client-side for display)
function calculateSAW(locations, criteria) {
  if (!locations.length || !criteria.length) return []

  const normalizedMatrix = {}

  criteria.forEach((criterion) => {
    const values = locations.map((loc) => loc.criteria[criterion.id] || 0)
    const maxValue = Math.max(...values)
    const minValue = Math.min(...values)

    locations.forEach((location) => {
      if (!normalizedMatrix[location.id]) {
        normalizedMatrix[location.id] = {}
      }

      const value = location.criteria[criterion.id] || 0
      if (criterion.type === "benefit") {
        normalizedMatrix[location.id][criterion.id] = maxValue > 0 ? value / maxValue : 0
      } else {
        normalizedMatrix[location.id][criterion.id] = minValue > 0 && value > 0 ? minValue / value : 0
      }
    })
  })

  const results = locations.map((location) => {
    const score = criteria.reduce((sum, criterion) => {
      return sum + criterion.weight * (normalizedMatrix[location.id][criterion.id] || 0)
    }, 0)

    return {
      location: location.name,
      score: score,
      details: normalizedMatrix[location.id],
    }
  })

  return results.sort((a, b) => b.score - a.score)
}

function calculateWP(locations, criteria) {
  if (!locations.length || !criteria.length) return []

  const sValues = locations.map((location) => {
    let s = 1
    criteria.forEach((criterion) => {
      const value = location.criteria[criterion.id] || 0
      if (value > 0) {
        const weight = criterion.type === "cost" ? -criterion.weight : criterion.weight
        s *= Math.pow(value, weight)
      }
    })

    return {
      location: location.name,
      s: s,
    }
  })

  const totalS = sValues.reduce((sum, item) => sum + item.s, 0)
  const results = sValues.map((item) => ({
    location: item.location,
    score: totalS > 0 ? item.s / totalS : 0,
    s: item.s,
  }))

  return results.sort((a, b) => b.score - a.score)
}

// Render Functions
async function renderResults() {
  try {
    const data = await loadResults()
    const sawResults = data.saw_results || []
    const wpResults = data.wp_results || []

    // Render SAW Results
    const sawContainer = document.getElementById("saw-results")
    if (sawContainer) {
      sawContainer.innerHTML = sawResults
        .map(
          (result, index) => `
                <div class="result-card ${getRankClass(index + 1)}">
                    <div class="result-header">
                        <div class="result-name">
                            <div class="rank-icon">${getRankIcon(index + 1)}</div>
                            <span style="font-weight: 600;">${result.location}</span>
                        </div>
                        <span class="badge badge-primary">${result.score.toFixed(4)}</span>
                    </div>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${result.score * 100}%"></div>
                    </div>
                </div>
            `,
        )
        .join("")
    }

    // Render WP Results
    const wpContainer = document.getElementById("wp-results")
    if (wpContainer) {
      wpContainer.innerHTML = wpResults
        .map(
          (result, index) => `
                <div class="result-card ${getRankClass(index + 1)}">
                    <div class="result-header">
                        <div class="result-name">
                            <div class="rank-icon">${getRankIcon(index + 1)}</div>
                            <span style="font-weight: 600;">${result.location}</span>
                        </div>
                        <span class="badge badge-primary">${result.score.toFixed(4)}</span>
                    </div>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${result.score * 100}%"></div>
                    </div>
                </div>
            `,
        )
        .join("")
    }

    // Render Comparison Table
    renderComparisonTable(sawResults, wpResults)

    // Render Recommendation
    renderRecommendation(sawResults, wpResults)
  } catch (error) {
    console.error("Error rendering results:", error)
    showErrorMessage("Failed to load results. Please try again.")
  }
}

async function renderLocations() {
  try {
    await loadLocations()
    await loadCriteria()

    const container = document.getElementById("locations-list")
    if (container) {
      container.innerHTML = locations
        .map(
          (location) => `
                <div class="card location-card">
                    <div class="card-content">
                        <div class="location-header">
                            <div class="location-info">
                                <h3>${location.name}</h3>
                                <p>📍 ${location.address}</p>
                                <div class="coordinates">
                                    <span>Lat: ${location.latitude}</span>
                                    <span>Lng: ${location.longitude}</span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="button button-secondary button-sm" onclick="editLocation(${location.id})">✏️</button>
                                <button class="button button-danger button-sm" onclick="deleteLocation(${location.id})">🗑️</button>
                            </div>
                        </div>
                        <div class="criteria-grid">
                            ${criteria
                              .map(
                                (criterion) => `
                                <div class="criteria-item">
                                    <span>${criterion.name}:</span>
                                    <span>${location.criteria[criterion.id] || 0}</span>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                </div>
            `,
        )
        .join("")
    }
  } catch (error) {
    console.error("Error rendering locations:", error)
    showErrorMessage("Failed to load locations. Please try again.")
  }
}

async function renderCriteria() {
  try {
    await loadCriteria()

    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)
    const totalWeightDisplay = document.getElementById("total-weight-display")
    if (totalWeightDisplay) {
      totalWeightDisplay.innerHTML = `
                <span style="color: ${totalWeight === 1 ? "#166534" : "#dc2626"};">
                    Total Bobot: ${totalWeight.toFixed(3)} ${totalWeight !== 1 ? "(Harus = 1.000)" : ""}
                </span>
            `
    }

    const container = document.getElementById("criteria-list")
    if (container) {
      container.innerHTML = criteria
        .map(
          (criterion) => `
                <div class="card" style="border-left: 4px solid #22c55e;">
                    <div class="card-content">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <h3 style="font-size: 1.125rem; font-weight: 600;">${criterion.name}</h3>
                                <div style="display: flex; gap: 16px; font-size: 0.875rem; color: #6b7280; margin-top: 8px;">
                                    <span>ID: ${criterion.id}</span>
                                    <span>Bobot: ${criterion.weight}</span>
                                    <span class="badge ${criterion.type === "benefit" ? "badge-success" : "badge-danger"}">
                                        ${criterion.type === "benefit" ? "Benefit" : "Cost"}
                                    </span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="button button-secondary button-sm" onclick="editCriteria('${criterion.id}')">✏️</button>
                                <button class="button button-danger button-sm" onclick="deleteCriteria('${criterion.id}')">🗑️</button>
                            </div>
                        </div>
                    </div>
                </div>
            `,
        )
        .join("")
    }
  } catch (error) {
    console.error("Error rendering criteria:", error)
    showErrorMessage("Failed to load criteria. Please try again.")
  }
}

// Helper Functions
function getRankIcon(rank) {
  if (rank === 1) return "🥇"
  if (rank === 2) return "🥈"
  if (rank === 3) return "🥉"
  return rank
}

function getRankClass(rank) {
  if (rank === 1) return "rank-1"
  if (rank === 2) return "rank-2"
  if (rank === 3) return "rank-3"
  return ""
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "none"
  }
}

function showSuccessMessage(message) {
  let successDiv = document.getElementById("success-message")
  if (!successDiv) {
    successDiv = document.createElement("div")
    successDiv.id = "success-message"
    successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dcfce7;
            color: #166534;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #bbf7d0;
            z-index: 1001;
            max-width: 400px;
        `
    document.body.appendChild(successDiv)
  }

  successDiv.textContent = message
  successDiv.style.display = "block"

  setTimeout(() => {
    successDiv.style.display = "none"
  }, 3000)
}

function renderMap() {
  // Placeholder for map rendering logic
  console.log("Rendering map...")
}

function renderComparisonTable(sawResults, wpResults) {
  // Placeholder for comparison table rendering logic
  console.log("Rendering comparison table...")
}

function renderRecommendation(sawResults, wpResults) {
  // Placeholder for recommendation rendering logic
  console.log("Rendering recommendation...")
}

// Updated form handlers
document.getElementById("add-location-form")?.addEventListener("submit", async (e) => {
  e.preventDefault()

  try {
    const newLocation = {
      name: document.getElementById("location-name")?.value || "",
      address: document.getElementById("location-address")?.value || "",
      latitude: Number.parseFloat(document.getElementById("location-latitude")?.value) || 0,
      longitude: Number.parseFloat(document.getElementById("location-longitude")?.value) || 0,
      criteria: {},
    }

    criteria.forEach((criterion) => {
      newLocation.criteria[criterion.id] =
        Number.parseFloat(document.getElementById(`criteria-${criterion.id}`)?.value) || 0
    })

    await addLocationAPI(newLocation)
    closeModal("add-location-modal")
    renderLocations()
    showSuccessMessage("Location added successfully!")
  } catch (error) {
    console.error("Error adding location:", error)
    showErrorMessage("Failed to add location. Please try again.")
  }
})

// Initialize app
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Test API connection
    const health = await apiCall("/health")
    console.log("✅ API Connected:", health)

    // Load initial data
    await loadLocations()
    await loadCriteria()

    // Render initial tab
    renderResults()
  } catch (error) {
    console.error("❌ Failed to initialize app:", error)
    showErrorMessage("Failed to connect to API. Please refresh the page.")
  }
})
