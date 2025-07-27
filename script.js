// ===== KONFIGURASI API =====
// Ganti URL ini dengan ngrok URL Anda (TANPA trailing slash)
const API_BASE_URL = "https://f04a6ab0d50b.ngrok-free.app"
// Contoh: const API_BASE_URL = "https://abc123.ngrok-free.app";
// PENTING: Pastikan tidak ada "/" di akhir URL

// ===== GLOBAL VARIABLES =====
let locations = []
let criteria = []
let currentCoordinates = { lat: 0, lng: 0 }
let editingLocationId = null
let editingCriteriaId = null

// ===== API FUNCTIONS =====
async function apiCall(endpoint, method = "GET", data = null) {
  try {
    const config = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true", // Skip ngrok browser warning
      },
    }

    if (data) {
      config.body = JSON.stringify(data)
    }

    console.log(`Making API call: ${method} ${API_BASE_URL}${endpoint}`)
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    // Check if response is HTML (error page)
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("text/html")) {
      throw new Error(`Server returned HTML instead of JSON. Check if API is running and ngrok URL is correct.`)
    }

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error)

    // Show user-friendly error message
    if (error.message.includes("fetch")) {
      showNotification("❌ Tidak dapat terhubung ke server. Pastikan backend dan ngrok berjalan.", "error")
    } else if (error.message.includes("HTML")) {
      showNotification("❌ Server error. Periksa konfigurasi ngrok dan backend.", "error")
    }

    // Fallback ke localStorage jika API tidak tersedia
    if (error.message.includes("fetch") || error.message.includes("HTML")) {
      console.warn("API tidak tersedia, menggunakan localStorage sebagai fallback")
      return handleOfflineMode(endpoint, method, data)
    }

    throw error
  }
}

function handleOfflineMode(endpoint, method, data) {
  // Fallback ke localStorage jika API tidak tersedia
  if (endpoint === "/locations") {
    if (method === "GET") {
      return JSON.parse(localStorage.getItem("tofico_locations") || "[]")
    }
  } else if (endpoint === "/criteria") {
    if (method === "GET") {
      return JSON.parse(localStorage.getItem("tofico_criteria") || "[]")
    }
  }
  throw new Error("Offline mode tidak mendukung operasi ini")
}

async function loadLocations() {
  try {
    locations = await apiCall("/locations")
    console.log("Locations loaded from API:", locations)
  } catch (error) {
    console.error("Error loading locations:", error)
    showNotification("Error loading locations: " + error.message, "error")
    // Fallback ke data default
    locations = getDefaultLocations()
  }
}

async function loadCriteria() {
  try {
    criteria = await apiCall("/criteria")
    console.log("Criteria loaded from API:", criteria)
  } catch (error) {
    console.error("Error loading criteria:", error)
    showNotification("Error loading criteria: " + error.message, "error")
    // Fallback ke data default
    criteria = getDefaultCriteria()
  }
}

function getDefaultLocations() {
  return [
    {
      id: 1,
      name: "Jakarta Pusat",
      address: "Jl. MH Thamrin No. 1, Menteng, Jakarta Pusat, DKI Jakarta 10310",
      latitude: -6.1944,
      longitude: 106.8229,
      criteria: {
        populationDensity: 85,
        accessibility: 90,
        competition: 60,
        rentCost: 40,
        marketPotential: 88,
      },
    },
    {
      id: 2,
      name: "Bandung",
      address: "Jl. Asia Afrika No. 146, Sumur Bandung, Kota Bandung, Jawa Barat 40112",
      latitude: -6.9175,
      longitude: 107.6191,
      criteria: {
        populationDensity: 75,
        accessibility: 80,
        competition: 70,
        rentCost: 70,
        marketPotential: 82,
      },
    },
    {
      id: 3,
      name: "Surabaya",
      address: "Jl. Pemuda No. 31-37, Embong Kaliasin, Genteng, Surabaya, Jawa Timur 60271",
      latitude: -7.2575,
      longitude: 112.7521,
      criteria: {
        populationDensity: 80,
        accessibility: 85,
        competition: 65,
        rentCost: 60,
        marketPotential: 85,
      },
    },
  ]
}

function getDefaultCriteria() {
  return [
    { id: "populationDensity", name: "Kepadatan Penduduk", weight: 0.25, type: "benefit" },
    { id: "accessibility", name: "Aksesibilitas", weight: 0.2, type: "benefit" },
    { id: "competition", name: "Tingkat Persaingan", weight: 0.15, type: "cost" },
    { id: "rentCost", name: "Biaya Sewa", weight: 0.2, type: "cost" },
    { id: "marketPotential", name: "Potensi Pasar", weight: 0.2, type: "benefit" },
  ]
}

function showNotification(message, type = "info") {
  // Simple notification system
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 300px;
        word-wrap: break-word;
    `

  switch (type) {
    case "success":
      notification.style.backgroundColor = "#22c55e"
      break
    case "error":
      notification.style.backgroundColor = "#ef4444"
      break
    case "warning":
      notification.style.backgroundColor = "#f59e0b"
      break
    default:
      notification.style.backgroundColor = "#3b82f6"
  }

  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 5000)
}

// ===== TAB FUNCTIONS =====
function showTab(tabName, event = null) {
  document.querySelectorAll(".tab-content").forEach((tab) => tab.classList.remove("active"))
  document.querySelectorAll(".tab-button").forEach((button) => button.classList.remove("active"))

  const tab = document.getElementById(tabName)
  if (tab) {
    tab.classList.add("active")
    if (event && event.target) {
      event.target.classList.add("active")
    } else {
      const button = document.querySelector(`.tab-button[onclick="showTab('${tabName}')"]`)
      if (button) button.classList.add("active")
    }
  }

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

// ===== ALGORITHM FUNCTIONS =====
function calculateSAW() {
  if (locations.length === 0 || criteria.length === 0) return []

  const normalizedMatrix = {}
  criteria.forEach((criterion) => {
    const values = locations.map((loc) => loc.criteria[criterion.id] || 0)
    const maxValue = Math.max(...values)
    const minValue = Math.min(...values)

    locations.forEach((location) => {
      if (!normalizedMatrix[location.id]) normalizedMatrix[location.id] = {}
      const value = location.criteria[criterion.id] || 0
      normalizedMatrix[location.id][criterion.id] =
        criterion.type === "benefit"
          ? maxValue > 0
            ? value / maxValue
            : 0
          : minValue > 0 && value > 0
            ? minValue / value
            : 0
    })
  })

  const results = locations.map((location) => {
    const score = criteria.reduce(
      (sum, criterion) => sum + criterion.weight * (normalizedMatrix[location.id][criterion.id] || 0),
      0,
    )
    return { location: location.name, score, details: normalizedMatrix[location.id] }
  })

  return results.sort((a, b) => b.score - a.score)
}

function calculateWP() {
  if (locations.length === 0 || criteria.length === 0) return []

  const sValues = locations.map((location) => {
    let s = 1
    criteria.forEach((criterion) => {
      const value = location.criteria[criterion.id] || 0
      if (value === 0) return
      const weight = criterion.type === "cost" ? -criterion.weight : criterion.weight
      s *= Math.pow(value, weight)
    })
    return { location: location.name, s }
  })

  const totalS = sValues.reduce((sum, item) => sum + item.s, 0)
  const results = sValues.map((item) => ({
    location: item.location,
    score: totalS > 0 ? item.s / totalS : 0,
    s: item.s,
  }))

  return results.sort((a, b) => b.score - a.score)
}

// ===== RENDER FUNCTIONS =====
function renderResults() {
  const sawResults = calculateSAW()
  const wpResults = calculateWP()

  const sawContainer = document.getElementById("saw-results")
  if (sawContainer) {
    sawContainer.innerHTML = sawResults
      .map(
        (result, index) => `
            <div class="result-card ${getRankClass(index + 1)}">
                <div class="result-header">
                    <div class="result-name">
                        <div class="rank-icon">${getRankIcon(index + 1)}</div>
                        <span style="font-weight:600">${result.location}</span>
                    </div>
                    <span class="badge badge-primary">${result.score.toFixed(4)}</span>
                </div>
                <div class="progress">
                    <div class="progress-bar" style="width:${result.score * 100}%"></div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  const wpContainer = document.getElementById("wp-results")
  if (wpContainer) {
    wpContainer.innerHTML = wpResults
      .map(
        (result, index) => `
            <div class="result-card ${getRankClass(index + 1)}">
                <div class="result-header">
                    <div class="result-name">
                        <div class="rank-icon">${getRankIcon(index + 1)}</div>
                        <span style="font-weight:600">${result.location}</span>
                    </div>
                    <span class="badge badge-primary">${result.score.toFixed(4)}</span>
                </div>
                <div class="progress">
                    <div class="progress-bar" style="width:${result.score * 100}%"></div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  renderComparisonTable(sawResults, wpResults)
  renderRecommendation(sawResults, wpResults)
}

function renderComparisonTable(sawResults, wpResults) {
  const comparisonContainer = document.getElementById("comparison-table")
  if (comparisonContainer) {
    comparisonContainer.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Lokasi</th>
                        <th style="text-align:center">Ranking SAW</th>
                        <th style="text-align:center">Skor SAW</th>
                        <th style="text-align:center">Ranking WP</th>
                        <th style="text-align:center">Skor WP</th>
                        <th style="text-align:center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${locations
                      .map((location) => {
                        const sawRank = sawResults.findIndex((r) => r.location === location.name) + 1
                        const wpRank = wpResults.findIndex((r) => r.location === location.name) + 1
                        const sawScore = sawResults.find((r) => r.location === location.name)?.score || 0
                        const wpScore = wpResults.find((r) => r.location === location.name)?.score || 0
                        const isConsistent = Math.abs(sawRank - wpRank) <= 1
                        return `
                            <tr>
                                <td style="font-weight:500">${location.name}</td>
                                <td style="text-align:center"><span class="badge ${getRankBadgeClass(sawRank)}">#${sawRank}</span></td>
                                <td style="text-align:center">${sawScore.toFixed(4)}</td>
                                <td style="text-align:center"><span class="badge ${getRankBadgeClass(wpRank)}">#${wpRank}</span></td>
                                <td style="text-align:center">${wpScore.toFixed(4)}</td>
                                <td style="text-align:center"><span class="badge ${isConsistent ? "badge-success" : "badge-danger"}">${isConsistent ? "Konsisten" : "Berbeda"}</span></td>
                            </tr>
                        `
                      })
                      .join("")}
                </tbody>
            </table>
        `
  }
}

function renderRecommendation(sawResults, wpResults) {
  const recommendationContainer = document.getElementById("recommendation")
  if (recommendationContainer && sawResults.length > 0 && wpResults.length > 0) {
    recommendationContainer.innerHTML = `
            <div style="background:#dcfce7;padding:16px;border-radius:8px;margin-bottom:16px">
                <h3 style="font-weight:600;color:#166534;margin-bottom:8px">🏆 Lokasi Terbaik: ${sawResults[0].location}</h3>
                <p style="color:#166534;font-size:0.875rem">
                    Lokasi ini mendapat ranking tertinggi pada algoritma SAW
                    ${
                      sawResults[0].location === wpResults[0].location
                        ? " dan WP, menunjukkan konsistensi hasil yang tinggi."
                        : `, dan ranking ${wpResults.findIndex((r) => r.location === sawResults[0].location) + 1} pada algoritma WP.`
                    }
                </p>
            </div>
            <div class="grid grid-cols-2">
                <div style="background:#dbeafe;padding:16px;border-radius:8px">
                    <h4 style="font-weight:500;color:#1e40af;margin-bottom:8px">Kelebihan Lokasi Terpilih:</h4>
                    <ul style="color:#1e40af;font-size:0.875rem;margin-left:20px">
                        <li>Skor tertinggi pada algoritma SAW</li>
                        <li>Memenuhi kriteria utama yang diprioritaskan</li>
                        <li>Konsistensi hasil antar algoritma</li>
                    </ul>
                </div>
                <div style="background:#fef3c7;padding:16px;border-radius:8px">
                    <h4 style="font-weight:500;color:#92400e;margin-bottom:8px">Pertimbangan:</h4>
                    <ul style="color:#92400e;font-size:0.875rem;margin-left:20px">
                        <li>Validasi dengan survei lapangan</li>
                        <li>Analisis faktor eksternal lainnya</li>
                        <li>Pertimbangan budget dan timeline</li>
                    </ul>
                </div>
            </div>
        `
  }
}

function renderLocations() {
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
                        <div style="display:flex;gap:8px">
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
}

function renderMap() {
  const container = document.getElementById("map-locations")
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
                                <span>📍 ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}</span>
                            </div>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:8px">
                            <button class="button button-secondary button-sm" onclick="openInGoogleMaps(${location.latitude},${location.longitude},'${location.name}')">🗺️ Google Maps</button>
                            <button class="button button-secondary button-sm" onclick="openInStreetView(${location.latitude},${location.longitude})">👁️ Street View</button>
                        </div>
                    </div>
                    <div style="margin-top:16px;padding:12px;background:#f9fafb;border-radius:8px">
                        <h4 style="font-size:0.875rem;font-weight:500;color:#374151;margin-bottom:8px">Informasi Lokasi:</h4>
                        <div class="grid grid-cols-2">
                            <div>
                                <span style="color:#6b7280;font-size:0.875rem">Koordinat:</span><br>
                                <code style="font-size:0.75rem;background:white;padding:4px 8px;border-radius:4px">${location.latitude}, ${location.longitude}</code>
                            </div>
                            <div>
                                <span style="color:#6b7280;font-size:0.875rem">Format DMS:</span><br>
                                <code style="font-size:0.75rem;background:white;padding:4px 8px;border-radius:4px">${Math.abs(location.latitude).toFixed(4)}°${location.latitude >= 0 ? "N" : "S"}, ${Math.abs(location.longitude).toFixed(4)}°${location.longitude >= 0 ? "E" : "W"}</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")

    container.innerHTML += `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">📊 Statistik Lokasi</div>
                </div>
                <div class="card-content">
                    <div class="grid" style="grid-template-columns:repeat(4,1fr)">
                        <div style="text-align:center;padding:12px;background:#dbeafe;border-radius:8px">
                            <div style="font-size:2rem;font-weight:bold;color:#1e40af">${locations.length}</div>
                            <div style="color:#1e40af">Total Lokasi</div>
                        </div>
                        <div style="text-align:center;padding:12px;background:#dcfce7;border-radius:8px">
                            <div style="font-size:2rem;font-weight:bold;color:#166534">${locations.filter((l) => l.latitude !== 0 && l.longitude !== 0).length}</div>
                            <div style="color:#166534">Dengan Koordinat</div>
                        </div>
                        <div style="text-align:center;padding:12px;background:#f3e8ff;border-radius:8px">
                            <div style="font-size:2rem;font-weight:bold;color:#7c3aed">${locations.filter((l) => l.address && l.address.trim() !== "").length}</div>
                            <div style="color:#7c3aed">Dengan Alamat</div>
                        </div>
                        <div style="text-align:center;padding:12px;background:#fed7aa;border-radius:8px">
                            <div style="font-size:2rem;font-weight:bold;color:#ea580c">${locations.length > 0 ? Math.round(locations.reduce((sum, l) => sum + Object.keys(l.criteria).length, 0) / locations.length) : 0}</div>
                            <div style="color:#ea580c">Rata-rata Kriteria</div>
                        </div>
                    </div>
                </div>
            </div>
        `
  }
}

function renderCriteria() {
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)
  const totalWeightDisplay = document.getElementById("total-weight-display")
  if (totalWeightDisplay) {
    totalWeightDisplay.innerHTML = `<span style="color:${totalWeight === 1 ? "#166534" : "#dc2626"}">Total Bobot: ${totalWeight.toFixed(3)} ${totalWeight !== 1 ? "(Harus = 1.000)" : ""}</span>`
  }

  const container = document.getElementById("criteria-list")
  if (container) {
    container.innerHTML = criteria
      .map(
        (criterion) => `
            <div class="card" style="border-left:4px solid #22c55e">
                <div class="card-content">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                        <div style="flex:1">
                            <h3 style="font-size:1.125rem;font-weight:600">${criterion.name}</h3>
                            <div style="display:flex;gap:16px;font-size:0.875rem;color:#6b7280;margin-top:8px">
                                <span>ID: ${criterion.id}</span>
                                <span>Bobot: ${criterion.weight}</span>
                                <span class="badge ${criterion.type === "benefit" ? "badge-success" : "badge-danger"}">${criterion.type === "benefit" ? "Benefit" : "Cost"}</span>
                            </div>
                        </div>
                        <div style="display:flex;gap:8px">
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
}

// ===== UTILITY FUNCTIONS =====
function getRankIcon(rank) {
  switch (rank) {
    case 1:
      return "🏆"
    case 2:
      return "🥈"
    case 3:
      return "🥉"
    default:
      return rank
  }
}

function getRankClass(rank) {
  switch (rank) {
    case 1:
      return "rank-1"
    case 2:
      return "rank-2"
    case 3:
      return "rank-3"
    default:
      return "rank-other"
  }
}

function getRankBadgeClass(rank) {
  switch (rank) {
    case 1:
      return "badge-warning"
    case 2:
      return "badge-secondary"
    case 3:
      return "badge-warning"
    default:
      return "badge-primary"
  }
}

// ===== MODAL FUNCTIONS =====
function openAddLocationModal() {
  const criteriaInputs = document.getElementById("criteria-inputs")
  if (criteriaInputs) {
    criteriaInputs.innerHTML = criteria
      .map(
        (criterion) => `
            <div class="form-group">
                <label class="label">${criterion.name} (0-100)</label>
                <input type="number" id="criteria-${criterion.id}" class="input" min="0" max="100" placeholder="0-100" required>
            </div>
        `,
      )
      .join("")
  }
  const modal = document.getElementById("add-location-modal")
  if (modal) modal.classList.add("active")
}

function openAddCriteriaModal() {
  const modal = document.getElementById("add-criteria-modal")
  if (modal) modal.classList.add("active")
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.remove("active")
    const form = modal.querySelector("form")
    if (form) form.reset()
  }
  editingLocationId = null
  editingCriteriaId = null
}

async function editLocation(id) {
  const location = locations.find((loc) => loc.id === id)
  if (!location) return

  editingLocationId = id

  const nameInput = document.getElementById("edit-location-name")
  const addressInput = document.getElementById("edit-location-address")
  const latitudeInput = document.getElementById("edit-location-latitude")
  const longitudeInput = document.getElementById("edit-location-longitude")
  const criteriaInputs = document.getElementById("edit-criteria-inputs")

  if (nameInput) nameInput.value = location.name
  if (addressInput) addressInput.value = location.address
  if (latitudeInput) latitudeInput.value = location.latitude
  if (longitudeInput) longitudeInput.value = location.longitude

  if (criteriaInputs) {
    criteriaInputs.innerHTML = criteria
      .map(
        (criterion) => `
            <div class="form-group">
                <label class="label">${criterion.name} (0-100)</label>
                <input type="number" id="edit-criteria-${criterion.id}" class="input" min="0" max="100" value="${location.criteria[criterion.id] || 0}" required>
            </div>
        `,
      )
      .join("")
  }

  const modal = document.getElementById("edit-location-modal")
  if (modal) modal.classList.add("active")
}

async function deleteLocation(id) {
  if (confirm("Apakah Anda yakin ingin menghapus lokasi ini?")) {
    try {
      await apiCall(`/locations/${id}`, "DELETE")
      await loadLocations()
      renderLocations()
      showNotification("Lokasi berhasil dihapus", "success")
    } catch (error) {
      showNotification("Error menghapus lokasi: " + error.message, "error")
    }
  }
}

function editCriteria(id) {
  const criterion = criteria.find((c) => c.id === id)
  if (!criterion) return

  editingCriteriaId = id

  const idInput = document.getElementById("edit-criteria-id")
  const nameInput = document.getElementById("edit-criteria-name")
  const weightInput = document.getElementById("edit-criteria-weight")
  const typeInput = document.getElementById("edit-criteria-type")

  if (idInput) idInput.value = criterion.id
  if (nameInput) nameInput.value = criterion.name
  if (weightInput) weightInput.value = criterion.weight
  if (typeInput) typeInput.value = criterion.type

  const modal = document.getElementById("edit-criteria-modal")
  if (modal) modal.classList.add("active")
}

async function deleteCriteria(id) {
  if (confirm("Apakah Anda yakin ingin menghapus kriteria ini?")) {
    try {
      await apiCall(`/criteria/${id}`, "DELETE")
      await loadCriteria()
      renderCriteria()
      showNotification("Kriteria berhasil dihapus", "success")
    } catch (error) {
      showNotification("Error menghapus kriteria: " + error.message, "error")
    }
  }
}

function normalizeWeights() {
  const total = criteria.reduce((sum, c) => sum + c.weight, 0)
  if (total > 0) {
    criteria.forEach((c) => (c.weight = Number.parseFloat((c.weight / total).toFixed(3))))
    renderCriteria()
    showNotification("Bobot berhasil dinormalisasi", "success")
  }
}

// ===== COORDINATE SEARCH FUNCTIONS =====
function searchCoordinates() {
  const addressInput = document.getElementById("search-address")
  if (!addressInput) return

  const address = addressInput.value.trim()
  if (!address) {
    alert("Masukkan alamat yang akan dicari")
    return
  }

  const sampleCoordinates = [
    { address: "jakarta", lat: -6.2088, lng: 106.8456 },
    { address: "bandung", lat: -6.9175, lng: 107.6191 },
    { address: "surabaya", lat: -7.2575, lng: 112.7521 },
    { address: "medan", lat: 3.5952, lng: 98.6722 },
    { address: "yogyakarta", lat: -7.7956, lng: 110.3695 },
    { address: "semarang", lat: -6.9667, lng: 110.4167 },
    { address: "palembang", lat: -2.9761, lng: 104.7754 },
    { address: "makassar", lat: -5.1477, lng: 119.4327 },
  ]

  const found = sampleCoordinates.find((coord) => address.toLowerCase().includes(coord.address))

  if (found) {
    currentCoordinates = { lat: found.lat, lng: found.lng }
  } else {
    currentCoordinates = {
      lat: -6.2 + Math.random() * 2,
      lng: 106.8 + Math.random() * 2,
    }
  }

  const latitudeDisplay = document.getElementById("result-latitude")
  const longitudeDisplay = document.getElementById("result-longitude")
  const resultContainer = document.getElementById("coordinate-result")

  if (latitudeDisplay) latitudeDisplay.textContent = currentCoordinates.lat.toFixed(6)
  if (longitudeDisplay) longitudeDisplay.textContent = currentCoordinates.lng.toFixed(6)
  if (resultContainer) resultContainer.style.display = "block"
}

function copyCoordinates() {
  const coordText = `${currentCoordinates.lat}, ${currentCoordinates.lng}`
  navigator.clipboard
    .writeText(coordText)
    .then(() => {
      showNotification("Koordinat berhasil disalin ke clipboard", "success")
    })
    .catch((err) => {
      showNotification("Gagal menyalin koordinat: " + err.message, "error")
    })
}

function openInMaps() {
  const url = `https://www.google.com/maps/search/?api=1&query=${currentCoordinates.lat},${currentCoordinates.lng}`
  window.open(url, "_blank")
}

function openInGoogleMaps(lat, lng, name) {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`
  window.open(url, "_blank")
}

function openInStreetView(lat, lng) {
  const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`
  window.open(url, "_blank")
}

// ===== FORM EVENT LISTENERS =====
document.getElementById("add-location-form")?.addEventListener("submit", async (e) => {
  e.preventDefault()

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

  try {
    await apiCall("/locations", "POST", newLocation)
    await loadLocations()
    closeModal("add-location-modal")
    renderLocations()
    showNotification("Lokasi berhasil ditambahkan", "success")
  } catch (error) {
    showNotification("Error menambah lokasi: " + error.message, "error")
  }
})

document.getElementById("edit-location-form")?.addEventListener("submit", async (e) => {
  e.preventDefault()

  if (editingLocationId) {
    const updatedLocation = {
      name: document.getElementById("edit-location-name")?.value || "",
      address: document.getElementById("edit-location-address")?.value || "",
      latitude: Number.parseFloat(document.getElementById("edit-location-latitude")?.value) || 0,
      longitude: Number.parseFloat(document.getElementById("edit-location-longitude")?.value) || 0,
      criteria: {},
    }

    criteria.forEach((criterion) => {
      updatedLocation.criteria[criterion.id] =
        Number.parseFloat(document.getElementById(`edit-criteria-${criterion.id}`)?.value) || 0
    })

    try {
      await apiCall(`/locations/${editingLocationId}`, "PUT", updatedLocation)
      await loadLocations()
      closeModal("edit-location-modal")
      renderLocations()
      showNotification("Lokasi berhasil diupdate", "success")
    } catch (error) {
      showNotification("Error mengupdate lokasi: " + error.message, "error")
    }
  }
})

document.getElementById("add-criteria-form")?.addEventListener("submit", async (e) => {
  e.preventDefault()

  const newCriteria = {
    id: document.getElementById("criteria-id")?.value || "",
    name: document.getElementById("criteria-name")?.value || "",
    weight: Number.parseFloat(document.getElementById("criteria-weight")?.value) || 0,
    type: document.getElementById("criteria-type")?.value || "benefit",
  }

  try {
    await apiCall("/criteria", "POST", newCriteria)
    await loadCriteria()
    closeModal("add-criteria-modal")
    renderCriteria()
    showNotification("Kriteria berhasil ditambahkan", "success")
  } catch (error) {
    showNotification("Error menambah kriteria: " + error.message, "error")
  }
})

// ===== EVENT LISTENERS =====
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", function (e) {
    if (e.target === this) closeModal(this.id)
  })
})

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal.active").forEach((modal) => closeModal(modal.id))
  }
})

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Loading application...")

  // Load data from API
  await loadLocations()
  await loadCriteria()

  // Render initial view
  renderResults()

  // Setup tab navigation
  document.querySelectorAll(".tab-button").forEach((button, index) => {
    button.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault()
        const buttons = Array.from(document.querySelectorAll(".tab-button"))
        let newIndex = index
        if (e.key === "ArrowLeft") {
          newIndex = index > 0 ? index - 1 : buttons.length - 1
        } else {
          newIndex = index < buttons.length - 1 ? index + 1 : 0
        }
        buttons[newIndex].focus()
        buttons[newIndex].click()
      }
    })
  })

  console.log("Application loaded successfully")
})
