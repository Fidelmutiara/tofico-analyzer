let locations = [
    {id:1,name:"Jakarta Pusat",address:"Jl. MH Thamrin No. 1, Menteng, Jakarta Pusat, DKI Jakarta 10310",latitude:-6.1944,longitude:106.8229,criteria:{populationDensity:85,accessibility:90,competition:60,rentCost:40,marketPotential:88}},
    {id:2,name:"Bandung",address:"Jl. Asia Afrika No. 146, Sumur Bandung, Kota Bandung, Jawa Barat 40112",latitude:-6.9175,longitude:107.6191,criteria:{populationDensity:75,accessibility:80,competition:70,rentCost:70,marketPotential:82}},
    {id:3,name:"Surabaya",address:"Jl. Pemuda No. 31-37, Embong Kaliasin, Genteng, Surabaya, Jawa Timur 60271",latitude:-7.2575,longitude:112.7521,criteria:{populationDensity:80,accessibility:85,competition:65,rentCost:60,marketPotential:85}}
];

let criteria = [
    {id:"populationDensity",name:"Kepadatan Penduduk",weight:0.25,type:"benefit"},
    {id:"accessibility",name:"Aksesibilitas",weight:0.2,type:"benefit"},
    {id:"competition",name:"Tingkat Persaingan",weight:0.15,type:"cost"},
    {id:"rentCost",name:"Biaya Sewa",weight:0.2,type:"cost"},
    {id:"marketPotential",name:"Potensi Pasar",weight:0.2,type:"benefit"}
];

let currentCoordinates = {lat:0,lng:0};
let editingLocationId = null;
let editingCriteriaId = null;

function showTab(tabName,event=null){
    document.querySelectorAll('.tab-content').forEach(tab=>tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(button=>button.classList.remove('active'));
    const tab = document.getElementById(tabName);
    if(tab){
        tab.classList.add('active');
        if(event&&event.target){
            event.target.classList.add('active');
        }else{
            const button = document.querySelector(`.tab-button[onclick="showTab('${tabName}')"]`);
            if(button) button.classList.add('active');
        }
    }
    switch(tabName){
        case 'results': renderResults(); break;
        case 'locations': renderLocations(); break;
        case 'map': renderMap(); break;
        case 'criteria': renderCriteria(); break;
    }
}

function calculateSAW(){
    if(locations.length===0||criteria.length===0) return [];
    const normalizedMatrix = {};
    criteria.forEach(criterion=>{
        const values = locations.map(loc=>loc.criteria[criterion.id]||0);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        locations.forEach(location=>{
            if(!normalizedMatrix[location.id]) normalizedMatrix[location.id] = {};
            const value = location.criteria[criterion.id]||0;
            normalizedMatrix[location.id][criterion.id] = criterion.type==="benefit"?maxValue>0?value/maxValue:0:minValue>0&&value>0?minValue/value:0;
        });
    });
    const results = locations.map(location=>{
        const score = criteria.reduce((sum,criterion)=>sum+criterion.weight*(normalizedMatrix[location.id][criterion.id]||0),0);
        return {location:location.name,score,details:normalizedMatrix[location.id]};
    });
    return results.sort((a,b)=>b.score-a.score);
}

function calculateWP(){
    if(locations.length===0||criteria.length===0) return [];
    const sValues = locations.map(location=>{
        let s = 1;
        criteria.forEach(criterion=>{
            const value = location.criteria[criterion.id]||0;
            if(value===0) return;
            const weight = criterion.type==="cost"?-criterion.weight:criterion.weight;
            s *= Math.pow(value,weight);
        });
        return {location:location.name,s};
    });
    const totalS = sValues.reduce((sum,item)=>sum+item.s,0);
    const results = sValues.map(item=>({location:item.location,score:totalS>0?item.s/totalS:0,s:item.s}));
    return results.sort((a,b)=>b.score-a.score);
}

function renderResults(){
    const sawResults = calculateSAW();
    const wpResults = calculateWP();
    const sawContainer = document.getElementById('saw-results');
    if(sawContainer){
        sawContainer.innerHTML = sawResults.map((result,index)=>`
            <div class="result-card ${getRankClass(index+1)}">
                <div class="result-header">
                    <div class="result-name"><div class="rank-icon">${getRankIcon(index+1)}</div><span style="font-weight:600">${result.location}</span></div>
                    <span class="badge badge-primary">${result.score.toFixed(4)}</span>
                </div>
                <div class="progress"><div class="progress-bar" style="width:${result.score*100}%"></div></div>
            </div>
        `).join('');
    }
    const wpContainer = document.getElementById('wp-results');
    if(wpContainer){
        wpContainer.innerHTML = wpResults.map((result,index)=>`
            <div class="result-card ${getRankClass(index+1)}">
                <div class="result-header">
                    <div class="result-name"><div class="rank-icon">${getRankIcon(index+1)}</div><span style="font-weight:600">${result.location}</span></div>
                    <span class="badge badge-primary">${result.score.toFixed(4)}</span>
                </div>
                <div class="progress"><div class="progress-bar" style="width:${result.score*100}%"></div></div>
            </div>
        `).join('');
    }
    renderComparisonTable(sawResults,wpResults);
    renderRecommendation(sawResults,wpResults);
}

function renderComparisonTable(sawResults,wpResults){
    const comparisonContainer = document.getElementById('comparison-table');
    if(comparisonContainer){
        comparisonContainer.innerHTML = `
            <table class="table">
                <thead><tr><th>Lokasi</th><th style="text-align:center">Ranking SAW</th><th style="text-align:center">Skor SAW</th><th style="text-align:center">Ranking WP</th><th style="text-align:center">Skor WP</th><th style="text-align:center">Status</th></tr></thead>
                <tbody>
                    ${locations.map(location=>{
                        const sawRank = sawResults.findIndex(r=>r.location===location.name)+1;
                        const wpRank = wpResults.findIndex(r=>r.location===location.name)+1;
                        const sawScore = sawResults.find(r=>r.location===location.name)?.score||0;
                        const wpScore = wpResults.find(r=>r.location===location.name)?.score||0;
                        const isConsistent = Math.abs(sawRank-wpRank)<=1;
                        return `
                            <tr>
                                <td style="font-weight:500">${location.name}</td>
                                <td style="text-align:center"><span class="badge ${getRankBadgeClass(sawRank)}">#${sawRank}</span></td>
                                <td style="text-align:center">${sawScore.toFixed(4)}</td>
                                <td style="text-align:center"><span class="badge ${getRankBadgeClass(wpRank)}">#${wpRank}</span></td>
                                <td style="text-align:center">${wpScore.toFixed(4)}</td>
                                <td style="text-align:center"><span class="badge ${isConsistent?'badge-success':'badge-danger'}">${isConsistent?'Konsisten':'Berbeda'}</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }
}

function renderRecommendation(sawResults,wpResults){
    const recommendationContainer = document.getElementById('recommendation');
    if(recommendationContainer&&sawResults.length>0&&wpResults.length>0){
        recommendationContainer.innerHTML = `
            <div style="background:#dcfce7;padding:16px;border-radius:8px;margin-bottom:16px">
                <h3 style="font-weight:600;color:#166534;margin-bottom:8px">🏆 Lokasi Terbaik: ${sawResults[0].location}</h3>
                <p style="color:#166534;font-size:0.875rem">
                    Lokasi ini mendapat ranking tertinggi pada algoritma SAW
                    ${sawResults[0].location===wpResults[0].location?' dan WP, menunjukkan konsistensi hasil yang tinggi.':`, dan ranking ${wpResults.findIndex(r=>r.location===sawResults[0].location)+1} pada algoritma WP.`}
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
        `;
    }
}

function renderLocations(){
    const container = document.getElementById('locations-list');
    if(container){
        container.innerHTML = locations.map(location=>`
            <div class="card location-card">
                <div class="card-content">
                    <div class="location-header">
                        <div class="location-info">
                            <h3>${location.name}</h3>
                            <p>📍 ${location.address}</p>
                            <div class="coordinates"><span>Lat: ${location.latitude}</span><span>Lng: ${location.longitude}</span></div>
                        </div>
                        <div style="display:flex;gap:8px">
                            <button class="button button-secondary button-sm" onclick="editLocation(${location.id})">✏️</button>
                            <button class="button button-danger button-sm" onclick="deleteLocation(${location.id})">🗑️</button>
                        </div>
                    </div>
                    <div class="criteria-grid">
                        ${criteria.map(criterion=>`
                            <div class="criteria-item"><span>${criterion.name}:</span><span>${location.criteria[criterion.id]||0}</span></div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function renderMap(){
    const container = document.getElementById('map-locations');
    if(container){
        container.innerHTML = locations.map(location=>`
            <div class="card location-card">
                <div class="card-content">
                    <div class="location-header">
                        <div class="location-info">
                            <h3>${location.name}</h3>
                            <p>📍 ${location.address}</p>
                            <div class="coordinates"><span>📍 ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}</span></div>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:8px">
                            <button class="button button-secondary button-sm" onclick="openInGoogleMaps(${location.latitude},${location.longitude},'${location.name}')">🗺️ Google Maps</button>
                            <button class="button button-secondary button-sm" onclick="openInStreetView(${location.latitude},${location.longitude})">👁️ Street View</button>
                        </div>
                    </div>
                    <div style="margin-top:16px;padding:12px;background:#f9fafb;border-radius:8px">
                        <h4 style="font-size:0.875rem;font-weight:500;color:#374151;margin-bottom:8px">Informasi Lokasi:</h4>
                        <div class="grid grid-cols-2">
                            <div><span style="color:#6b7280;font-size:0.875rem">Koordinat:</span><br><code style="font-size:0.75rem;background:white;padding:4px 8px;border-radius:4px">${location.latitude}, ${location.longitude}</code></div>
                            <div><span style="color:#6b7280;font-size:0.875rem">Format DMS:</span><br><code style="font-size:0.75rem;background:white;padding:4px 8px;border-radius:4px">${Math.abs(location.latitude).toFixed(4)}°${location.latitude>=0?'N':'S'}, ${Math.abs(location.longitude).toFixed(4)}°${location.longitude>=0?'E':'W'}</code></div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        container.innerHTML += `
            <div class="card">
                <div class="card-header"><div class="card-title">📊 Statistik Lokasi</div></div>
                <div class="card-content">
                    <div class="grid" style="grid-template-columns:repeat(4,1fr)">
                        <div style="text-align:center;padding:12px;background:#dbeafe;border-radius:8px"><div style="font-size:2rem;font-weight:bold;color:#1e40af">${locations.length}</div><div style="color:#1e40af">Total Lokasi</div></div>
                        <div style="text-align:center;padding:12px;background:#dcfce7;border-radius:8px"><div style="font-size:2rem;font-weight:bold;color:#166534">${locations.filter(l=>l.latitude!==0&&l.longitude!==0).length}</div><div style="color:#166534">Dengan Koordinat</div></div>
                        <div style="text-align:center;padding:12px;background:#f3e8ff;border-radius:8px"><div style="font-size:2rem;font-weight:bold;color:#7c3aed">${locations.filter(l=>l.address&&l.address.trim()!=='').length}</div><div style="color:#7c3aed">Dengan Alamat</div></div>
                        <div style="text-align:center;padding:12px;background:#fed7aa;border-radius:8px"><div style="font-size:2rem;font-weight:bold;color:#ea580c">${locations.length>0?Math.round(locations.reduce((sum,l)=>sum+Object.keys(l.criteria).length,0)/locations.length):0}</div><div style="color:#ea580c">Rata-rata Kriteria</div></div>
                    </div>
                </div>
            </div>
        `;
    }
}

function renderCriteria(){
    const totalWeight = criteria.reduce((sum,c)=>sum+c.weight,0);
    const totalWeightDisplay = document.getElementById('total-weight-display');
    if(totalWeightDisplay){
        totalWeightDisplay.innerHTML = `<span style="color:${totalWeight===1?'#166534':'#dc2626'}">Total Bobot: ${totalWeight.toFixed(3)} ${totalWeight!==1?'(Harus = 1.000)':''}</span>`;
    }
    const container = document.getElementById('criteria-list');
    if(container){
        container.innerHTML = criteria.map(criterion=>`
            <div class="card" style="border-left:4px solid #22c55e">
                <div class="card-content">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                        <div style="flex:1">
                            <h3 style="font-size:1.125rem;font-weight:600">${criterion.name}</h3>
                            <div style="display:flex;gap:16px;font-size:0.875rem;color:#6b7280;margin-top:8px">
                                <span>ID: ${criterion.id}</span>
                                <span>Bobot: ${criterion.weight}</span>
                                <span class="badge ${criterion.type==='benefit'?'badge-success':'badge-danger'}">${criterion.type==='benefit'?'Benefit':'Cost'}</span>
                            </div>
                        </div>
                        <div style="display:flex;gap:8px">
                            <button class="button button-secondary button-sm" onclick="editCriteria('${criterion.id}')">✏️</button>
                            <button class="button button-danger button-sm" onclick="deleteCriteria('${criterion.id}')">🗑️</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function getRankIcon(rank){
    switch(rank){
        case 1: return '🏆';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return rank;
    }
}

function getRankClass(rank){
    switch(rank){
        case 1: return 'rank-1';
        case 2: return 'rank-2';
        case 3: return 'rank-3';
        default: return 'rank-other';
    }
}

function getRankBadgeClass(rank){
    switch(rank){
        case 1: return 'badge-warning';
        case 2: return 'badge-secondary';
        case 3: return 'badge-warning';
        default: return 'badge-primary';
    }
}

function openAddLocationModal(){
    const criteriaInputs = document.getElementById('criteria-inputs');
    if(criteriaInputs){
        criteriaInputs.innerHTML = criteria.map(criterion=>`
            <div class="form-group"><label class="label">${criterion.name} (0-100)</label><input type="number" id="criteria-${criterion.id}" class="input" min="0" max="100" placeholder="0-100" required></div>
        `).join('');
    }
    const modal = document.getElementById('add-location-modal');
    if(modal) modal.classList.add('active');
}

function openAddCriteriaModal(){
    const modal = document.getElementById('add-criteria-modal');
    if(modal) modal.classList.add('active');
}

function closeModal(modalId){
    const modal = document.getElementById(modalId);
    if(modal){
        modal.classList.remove('active');
        const form = modal.querySelector('form');
        if(form) form.reset();
    }
    editingLocationId = null;
    editingCriteriaId = null;
}

function editLocation(id){
    const location = locations.find(loc=>loc.id===id);
    if(!location) return;
    editingLocationId = id;
    const nameInput = document.getElementById('edit-location-name');
    const addressInput = document.getElementById('edit-location-address');
    const latitudeInput = document.getElementById('edit-location-latitude');
    const longitudeInput = document.getElementById('edit-location-longitude');
    const criteriaInputs = document.getElementById('edit-criteria-inputs');
    if(nameInput) nameInput.value = location.name;
    if(addressInput) addressInput.value = location.address;
    if(latitudeInput) latitudeInput.value = location.latitude;
    if(longitudeInput) longitudeInput.value = location.longitude;
    if(criteriaInputs){
        criteriaInputs.innerHTML = criteria.map(criterion=>`
            <div class="form-group"><label class="label">${criterion.name} (0-100)</label><input type="number" id="edit-criteria-${criterion.id}" class="input" min="0" max="100" value="${location.criteria[criterion.id]||0}" required></div>
        `).join('');
    }
    const modal = document.getElementById('edit-location-modal');
    if(modal) modal.classList.add('active');
}

function deleteLocation(id){
    if(confirm('Apakah Anda yakin ingin menghapus lokasi ini?')){
        locations = locations.filter(loc=>loc.id!==id);
        renderLocations();
        saveData();
    }
}

function editCriteria(id){
    const criterion = criteria.find(c=>c.id===id);
    if(!criterion) return;
    editingCriteriaId = id;
    const idInput = document.getElementById('edit-criteria-id');
    const nameInput = document.getElementById('edit-criteria-name');
    const weightInput = document.getElementById('edit-criteria-weight');
    const typeInput = document.getElementById('edit-criteria-type');
    if(idInput) idInput.value = criterion.id;
    if(nameInput) nameInput.value = criterion.name;
    if(weightInput) weightInput.value = criterion.weight;
    if(typeInput) typeInput.value = criterion.type;
    const modal = document.getElementById('edit-criteria-modal');
    if(modal) modal.classList.add('active');
}

function deleteCriteria(id){
    if(confirm('Apakah Anda yakin ingin menghapus kriteria ini?')){
        criteria = criteria.filter(c=>c.id!==id);
        locations.forEach(location=>delete location.criteria[id]);
        renderCriteria();
        saveData();
    }
}

function normalizeWeights(){
    const total = criteria.reduce((sum,c)=>sum+c.weight,0);
    if(total>0){
        criteria.forEach(c=>c.weight=parseFloat((c.weight/total).toFixed(3)));
        renderCriteria();
        saveData();
    }
}

function searchCoordinates(){
    const addressInput = document.getElementById('search-address');
    if(!addressInput) return;
    const address = addressInput.value.trim();
    if(!address){
        alert('Masukkan alamat yang akan dicari');
        return;
    }
    const sampleCoordinates = [
        {address:"jakarta",lat:-6.2088,lng:106.8456},
        {address:"bandung",lat:-6.9175,lng:107.6191},
        {address:"surabaya",lat:-7.2575,lng:112.7521},
        {address:"medan",lat:3.5952,lng:98.6722},
        {address:"yogyakarta",lat:-7.7956,lng:110.3695},
        {address:"semarang",lat:-6.9667,lng:110.4167},
        {address:"palembang",lat:-2.9761,lng:104.7754},
        {address:"makassar",lat:-5.1477,lng:119.4327}
    ];
    const found = sampleCoordinates.find(coord=>address.toLowerCase().includes(coord.address));
    if(found){
        currentCoordinates = {lat:found.lat,lng:found.lng};
    }else{
        currentCoordinates = {lat:-6.2+Math.random()*2,lng:106.8+Math.random()*2};
    }
    const latitudeDisplay = document.getElementById('result-latitude');
    const longitudeDisplay = document.getElementById('result-longitude');
    const resultContainer = document.getElementById('coordinate-result');
    if(latitudeDisplay) latitudeDisplay.textContent = currentCoordinates.lat.toFixed(6);
    if(longitudeDisplay) longitudeDisplay.textContent = currentCoordinates.lng.toFixed(6);
    if(resultContainer) resultContainer.style.display = 'block';
}

function copyCoordinates(){
    const coordText = `${currentCoordinates.lat}, ${currentCoordinates.lng}`;
    navigator.clipboard.writeText(coordText).then(()=>{
        alert('Koordinat berhasil disalin ke clipboard');
    }).catch(err=>{
        alert('Gagal menyalin koordinat: '+err.message);
    });
}

function openInMaps(){
    const url = `https://www.google.com/maps/search/?api=1&query=${currentCoordinates.lat},${currentCoordinates.lng}`;
    window.open(url,'_blank');
}

function openInGoogleMaps(lat,lng,name){
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`;
    window.open(url,'_blank');
}

function openInStreetView(lat,lng){
    const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
    window.open(url,'_blank');
}

document.getElementById('add-location-form')?.addEventListener('submit',function(e){
    e.preventDefault();
    const newLocation = {
        id:Date.now(),
        name:document.getElementById('location-name')?.value||'',
        address:document.getElementById('location-address')?.value||'',
        latitude:parseFloat(document.getElementById('location-latitude')?.value)||0,
        longitude:parseFloat(document.getElementById('location-longitude')?.value)||0,
        criteria:{}
    };
    criteria.forEach(criterion=>{
        newLocation.criteria[criterion.id] = parseFloat(document.getElementById(`criteria-${criterion.id}`)?.value)||0;
    });
    locations.push(newLocation);
    closeModal('add-location-modal');
    renderLocations();
    saveData();
});

document.getElementById('edit-location-form')?.addEventListener('submit',function(e){
    e.preventDefault();
    if(editingLocationId){
        const locationIndex = locations.findIndex(loc=>loc.id===editingLocationId);
        if(locationIndex!==-1){
            locations[locationIndex].name = document.getElementById('edit-location-name')?.value||'';
            locations[locationIndex].address = document.getElementById('edit-location-address')?.value||'';
            locations[locationIndex].latitude = parseFloat(document.getElementById('edit-location-latitude')?.value)||0;
            locations[locationIndex].longitude = parseFloat(document.getElementById('edit-location-longitude')?.value)||0;
            criteria.forEach(criterion=>{
                locations[locationIndex].criteria[criterion.id] = parseFloat(document.getElementById(`edit-criteria-${criterion.id}`)?.value)||0;
            });
        }
    }
    closeModal('edit-location-modal');
    renderLocations();
    saveData();
});

document.getElementById('add-criteria-form')?.addEventListener('submit',function(e){
    e.preventDefault();
    const newCriteria = {
        id:document.getElementById('criteria-id')?.value||'',
        name:document.getElementById('criteria-name')?.value||'',
        weight:parseFloat(document.getElementById('criteria-weight')?.value)||0,
        type:document.getElementById('criteria-type')?.value||'benefit'
    };
    criteria.push(newCriteria);
    locations.forEach(location=>location.criteria[newCriteria.id]=0);
    closeModal('add-criteria-modal');
    renderCriteria();
    saveData();
});

document.getElementById('edit-criteria-form')?.addEventListener('submit',function(e){
    e.preventDefault();
    if(editingCriteriaId){
        const criteriaIndex = criteria.findIndex(c=>c.id===editingCriteriaId);
        if(criteriaIndex!==-1){
            const oldId = criteria[criteriaIndex].id;
            const newId = document.getElementById('edit-criteria-id')?.value||'';
            criteria[criteriaIndex].id = newId;
            criteria[criteriaIndex].name = document.getElementById('edit-criteria-name')?.value||'';
            criteria[criteriaIndex].weight = parseFloat(document.getElementById('edit-criteria-weight')?.value)||0;
            criteria[criteriaIndex].type = document.getElementById('edit-criteria-type')?.value||'benefit';
            if(oldId!==newId){
                locations.forEach(location=>{
                    if(location.criteria[oldId]!==undefined){
                        location.criteria[newId] = location.criteria[oldId];
                        delete location.criteria[oldId];
                    }
                });
            }
        }
    }
    closeModal('edit-criteria-modal');
    renderCriteria();
    saveData();
});

function saveData(){
    try{
        localStorage.setItem('tofico_locations',JSON.stringify(locations));
        localStorage.setItem('tofico_criteria',JSON.stringify(criteria));
    }catch(error){
        console.error('Error saving data to localStorage:',error);
    }
}

function loadData(){
    try{
        const savedLocations = localStorage.getItem('tofico_locations');
        const savedCriteria = localStorage.getItem('tofico_criteria');
        if(savedLocations) locations = JSON.parse(savedLocations);
        if(savedCriteria) criteria = JSON.parse(savedCriteria);
    }catch(error){
        console.error('Error loading data from localStorage:',error);
    }
}

document.querySelectorAll('.modal').forEach(modal=>{
    modal.addEventListener('click',function(e){
        if(e.target===this) closeModal(this.id);
    });
});

document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){
        document.querySelectorAll('.modal.active').forEach(modal=>closeModal(modal.id));
    }
});

document.addEventListener('DOMContentLoaded',function(){
    loadData();
    renderResults();
    document.querySelectorAll('.tab-button').forEach((button,index)=>{
        button.addEventListener('keydown',function(e){
            if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
                e.preventDefault();
                const buttons = Array.from(document.querySelectorAll('.tab-button'));
                let newIndex = index;
                if(e.key==='ArrowLeft'){
                    newIndex = index>0?index-1:buttons.length-1;
                }else{
                    newIndex = index<buttons.length-1?index+1:0;
                }
                buttons[newIndex].focus();
                buttons[newIndex].click();
            }
        });
    });
});

function exportData(){
    const data = {locations,criteria,exportDate:new Date().toISOString()};
    const dataStr = JSON.stringify(data,null,2);
    const dataBlob = new Blob([dataStr],{type:'application/json'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'tofico_dss_data.json';
    link.click();
}

function importData(event){
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e){
        try{
            const data = JSON.parse(e.target.result);
            if(data.locations&&data.criteria){
                locations = data.locations;
                criteria = data.criteria;
                saveData();
                renderResults();
                renderLocations();
                renderCriteria();
                alert('Data berhasil diimpor!');
            }else{
                alert('Format file tidak valid!');
            }
        }catch(error){
            alert('Error membaca file: '+error.message);
        }
    };
    reader.readAsText(file);
}

function printResults(){
    const printWindow = window.open('','_blank');
    if(!printWindow) return;
    const sawResults = calculateSAW();
    const wpResults = calculateWP();
    printWindow.document.write(`
        <html>
        <head>
            <title>Hasil Analisis Tofico Syrup DSS</title>
            <style>
                body{font-family:Arial,sans-serif;margin:20px}
                table{width:100%;border-collapse:collapse;margin:20px 0}
                th,td{border:1px solid #ddd;padding:8px;text-align:left}
                th{background-color:#f2f2f2}
                .header{text-align:center;margin-bottom:30px}
                .section{margin:30px 0}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Sistem Pendukung Keputusan</h1>
                <h2>Penentuan Lokasi Tofico Syrup</h2>
                <p>Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
            </div>
            <div class="section">
                <h3>Hasil Algoritma SAW</h3>
                <table><tr><th>Ranking</th><th>Lokasi</th><th>Skor</th></tr>
                    ${sawResults.map((result,index)=>`<tr><td>${index+1}</td><td>${result.location}</td><td>${result.score.toFixed(4)}</td></tr>`).join('')}
                </table>
            </div>
            <div class="section">
                <h3>Hasil Algoritma WP</h3>
                <table><tr><th>Ranking</th><th>Lokasi</th><th>Skor</th></tr>
                    ${wpResults.map((result,index)=>`<tr><td>${index+1}</td><td>${result.location}</td><td>${result.score.toFixed(4)}</td></tr>`).join('')}
                </table>
            </div>
            <div class="section">
                <h3>Rekomendasi</h3>
                <p><strong>Lokasi Terbaik:</strong> ${sawResults[0]?.location||'Tidak ada data'}</p>
                <p>Lokasi ini mendapat ranking tertinggi pada algoritma SAW${sawResults[0]?.location===wpResults[0]?.location?' dan WP, menunjukkan konsistensi hasil yang tinggi.':`, dan ranking ${wpResults.findIndex(r=>r.location===sawResults[0]?.location)+1} pada algoritma WP.`}</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}
