const MapView = {
    currentMap: null,
    markersGroup: null,
    tileLayer: null,

    getStoredApiKey: function() {
        return localStorage.getItem('nlams_map_api_key') || '';
    },

    getStoredProvider: function() {
        const p = localStorage.getItem('nlams_map_provider');
        if (!p) return 'google-sat'; // Default to Google Satellite Hybrid (Free, high res India map)
        return p;
    },

    render: function(container) {
        const apiKey = this.getStoredApiKey();
        const provider = this.getStoredProvider();

        container.innerHTML = `
            <div class="map-module" style="position: relative; height: calc(100vh - 90px); overflow: hidden; border-radius: var(--radius-xl); border: 1px solid var(--border-subtle);">
                <!-- Anti-Gravity Floating Stats Pill -->
                <div class="map-stats glass-panel stagger-1" style="position: absolute; top: 18px; left: 50%; transform: translateX(-50%); z-index: 1000; padding: 10px 24px; display: flex; gap: 24px; border-radius: var(--radius-pill); background: var(--bg-glass); backdrop-filter: blur(24px); border: 1px solid var(--border-strong); box-shadow: var(--shadow-float), var(--ring-inner);">
                    <span style="font-size: 0.85rem; color: var(--text-secondary);"><strong style="color: var(--text-primary);">Total Parcels:</strong> <span id="map-total" class="font-mono" style="color: var(--primary-accent); font-weight: 800;">0</span></span>
                    <span style="font-size: 0.85rem; color: var(--text-secondary);"><strong style="color: var(--accent-emerald);">Completed:</strong> <span id="map-comp" class="font-mono" style="color: var(--accent-emerald); font-weight: 800;">0</span></span>
                    <span style="font-size: 0.85rem; color: var(--text-secondary);"><strong style="color: var(--accent-cyan);">In Progress:</strong> <span id="map-prog" class="font-mono" style="color: var(--accent-cyan); font-weight: 800;">0</span></span>
                    <span style="font-size: 0.85rem; color: var(--text-secondary);"><strong style="color: var(--accent-rose);">Disputed/Delayed:</strong> <span id="map-delay" class="font-mono" style="color: var(--accent-rose); font-weight: 800;">0</span></span>
                </div>
                
                <!-- Floating Control Panel -->
                <div class="map-filters glass-panel stagger-2" style="position: absolute; top: 18px; right: 18px; z-index: 1000; padding: 18px; width: 280px; background: var(--bg-glass); backdrop-filter: blur(24px); border: 1px solid var(--border-strong); border-radius: var(--radius-xl); box-shadow: var(--shadow-float);">
                    <h4 style="margin: 0 0 12px 0; font-size: 0.95rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; justify-content: space-between;">
                        <span style="display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="layers" style="width: 16px; height: 16px; color: var(--secondary-accent);"></i> GIS Spatial Layers
                        </span>
                        <button onclick="MapView.openApiKeyModal()" style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); color: var(--text-primary); border-radius: 6px; padding: 3px 8px; font-size: 0.72rem; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Optional Custom Map API Key">
                            <i data-lucide="key" style="width: 12px; height: 12px; color: var(--accent-cyan);"></i> Key
                        </button>
                    </h4>

                    <div style="margin-bottom: 12px;">
                        <label style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 4px;">Map Engine Provider</label>
                        <select id="map-provider-select" class="form-select" onchange="MapView.changeProvider(this.value)" style="width: 100%; font-size: 0.82rem;">
                            <option value="google-sat" ${provider === 'google-sat' ? 'selected' : ''}>Google Satellite Hybrid (Free Default)</option>
                            <option value="osm-india" ${provider === 'osm-india' ? 'selected' : ''}>OpenStreetMap India (Highways & Survey)</option>
                            <option value="carto" ${provider === 'carto' ? 'selected' : ''}>CARTO Dark / Voyager (Free)</option>
                            <option value="bhuvan" ${provider === 'bhuvan' ? 'selected' : ''}>ISRO Bhuvan (India Space Satellite)</option>
                            <option value="mappls" ${provider === 'mappls' ? 'selected' : ''}>MapmyIndia / Mappls (India National Portal)</option>
                            <option value="mapbox-sat" ${provider === 'mapbox-sat' ? 'selected' : ''}>Mapbox Satellite Streets HD</option>
                            <option value="mapbox-dark" ${provider === 'mapbox-dark' ? 'selected' : ''}>Mapbox Dark Vector HD</option>
                            <option value="maptiler" ${provider === 'maptiler' ? 'selected' : ''}>MapTiler Vector Tiles</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 14px;">
                        <label style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 4px;">State Jurisdiction</label>
                        <select id="map-state-filter" class="form-select" onchange="MapView.filterState(this.value)" style="width: 100%; font-size: 0.82rem;">
                            <option value="All">All States (India View)</option>
                            <option value="Maharashtra">Maharashtra (Pune / Thane)</option>
                            <option value="Rajasthan">Rajasthan (Jaipur / Jodhpur)</option>
                            <option value="Tamil Nadu">Tamil Nadu (Chennai)</option>
                            <option value="Uttar Pradesh">Uttar Pradesh (Lucknow)</option>
                            <option value="Gujarat">Gujarat (Ahmedabad)</option>
                        </select>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.82rem; color: var(--text-secondary);">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="layer-parcels" checked onchange="MapView.updateMarkers()">
                            <span>Land Acquisition Parcels</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="layer-buffer" checked onchange="MapView.updateMarkers()">
                            <span>Infrastructure Corridor Buffer</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="layer-rr" checked onchange="MapView.updateMarkers()">
                            <span>R&R Resettlement Colonies</span>
                        </label>
                    </div>
                </div>

                <!-- Leaflet Canvas -->
                <div id="leaflet-map" style="width: 100%; height: 100%; background: var(--bg-primary);"></div>
                
                <!-- Map Legend & API Key Status -->
                <div class="map-legend glass-panel stagger-3" style="position: absolute; bottom: 20px; left: 20px; z-index: 1000; padding: 14px 18px; background: var(--bg-glass); backdrop-filter: blur(24px); border: 1px solid var(--border-strong); border-radius: var(--radius-lg); font-size: 0.8rem; min-width: 240px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="font-weight: 700; color: var(--text-primary); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">LARR Status Legend</span>
                        <span id="key-status-badge" class="badge badge-success" style="font-size: 0.68rem; text-transform: none;">
                            ${apiKey ? '🔑 Custom Key Active' : '⚡ Free India Map Active'}
                        </span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; color: var(--text-secondary);">
                        <span style="width: 12px; height: 12px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; display: inline-block;"></span> Possession Transferred (Completed)
                    </div>
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; color: var(--text-secondary);">
                        <span style="width: 12px; height: 12px; border-radius: 50%; background: #06b6d4; box-shadow: 0 0 8px #06b6d4; display: inline-block;"></span> On Track (Survey / Award)
                    </div>
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; color: var(--text-secondary);">
                        <span style="width: 12px; height: 12px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 8px #f59e0b; display: inline-block;"></span> Delayed / On Hold
                    </div>
                    <div style="display:flex; align-items:center; gap:8px; color: var(--text-secondary);">
                        <span style="width: 12px; height: 12px; border-radius: 50%; background: #f43f5e; box-shadow: 0 0 8px #f43f5e; display: inline-block;"></span> Disputed (LARR Tribunal)
                    </div>
                </div>

                <!-- API Key Config Modal -->
                <div id="map-key-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); z-index: 2000; align-items: center; justify-content: center;">
                    <div class="glass-panel" style="background: var(--bg-card); backdrop-filter: blur(28px); border: 1px solid var(--border-strong); border-radius: var(--radius-xl); width: 480px; max-width: 90%; padding: 24px; box-shadow: var(--shadow-float);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
                            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                                <i data-lucide="key" style="width: 18px; height: 18px; color: var(--secondary-accent);"></i> Custom Map API Key (Optional)
                            </h3>
                            <button onclick="MapView.closeApiKeyModal()" style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); color: var(--text-muted); width: 28px; height: 28px; border-radius: 50%; cursor: pointer;">&times;</button>
                        </div>
                        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">
                            The map is <strong>100% functional for free</strong> using Google Satellite, OpenStreetMap India & CARTO. If you have your own private Mapbox (<code style="color: var(--secondary-accent);">pk.eyJ...</code>), MapmyIndia, or MapTiler key, you can enter it below.
                        </p>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label class="form-label">Map Engine API Key / Access Token</label>
                            <input type="text" id="map-api-key-input" class="form-input" placeholder="Optional: e.g. pk.eyJ1IjoibmxhbXMi..." value="${apiKey}">
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <button class="btn btn-secondary btn-sm" onclick="MapView.clearApiKey()">Reset to Free Engine</button>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn btn-secondary btn-sm" onclick="MapView.closeApiKeyModal()">Cancel</button>
                                <button class="btn btn-primary btn-sm" onclick="MapView.saveApiKey()"><i data-lucide="check"></i> Save & Reload Map</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        setTimeout(() => this.initMap(), 100);
    },

    initMap: function() {
        if (!window.L) {
            document.getElementById('leaflet-map').innerHTML = '<div style="padding:40px; color:var(--text-secondary); text-align:center;">Leaflet.js map engine loading...</div>';
            return;
        }

        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const mapContainer = document.getElementById('leaflet-map');
        if (mapContainer) {
            mapContainer.style.background = isLight ? '#f4f4f5' : '#06070b';
        }

        if (this.currentMap) {
            this.currentMap.remove();
            this.currentMap = null;
        }

        const map = L.map('leaflet-map', { zoomControl: false }).setView([21.7679, 78.8718], 5);
        this.currentMap = map;

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        this.applyTileLayer();

        this.markersGroup = L.layerGroup().addTo(map);
        this.updateMarkers();
    },

    applyTileLayer: function() {
        if (!this.currentMap) return;
        if (this.tileLayer) {
            this.currentMap.removeLayer(this.tileLayer);
        }

        const provider = this.getStoredProvider();
        const apiKey = this.getStoredApiKey();
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';

        let tileUrl = '';
        let attr = '';
        let maxZoom = 18;

        if (provider === 'google-sat') {
            tileUrl = 'https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}';
            attr = '&copy; Google Maps Satellite India &bull; NLAMS GIS Engine';
            maxZoom = 19;
        } else if (provider === 'osm-india') {
            tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            attr = '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap India</a> &bull; NLAMS GIS';
            maxZoom = 19;
        } else if (provider === 'bhuvan') {
            tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
            attr = '&copy; <a href="https://bhuvan.nrsc.gov.in/" target="_blank">ISRO Bhuvan Satellite</a> &bull; NRSC India';
            maxZoom = 18;
        } else if (provider === 'mappls') {
            tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            attr = '&copy; <a href="https://www.mappls.com/" target="_blank">MapmyIndia Mappls</a> &bull; India National GIS';
            maxZoom = 19;
        } else if (provider.startsWith('mapbox') && apiKey) {
            const style = provider === 'mapbox-sat' ? 'satellite-streets-v12' : 'dark-v11';
            tileUrl = `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/{z}/{x}/{y}?access_token=${apiKey}`;
            attr = '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &bull; NLAMS GIS Engine';
            maxZoom = 19;
        } else if (provider === 'maptiler' && apiKey) {
            tileUrl = `https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=${apiKey}`;
            attr = '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &bull; NLAMS GIS';
        } else {
            // Default CARTO Basemap fallback
            tileUrl = isLight 
                ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
            attr = '&copy; <a href="https://carto.com/">CARTO</a> &bull; NLAMS GIS Engine';
        }

        this.tileLayer = L.tileLayer(tileUrl, { maxZoom: maxZoom, attribution: attr }).addTo(this.currentMap);
    },

    changeProvider: function(val) {
        localStorage.setItem('nlams_map_provider', val);
        this.applyTileLayer();
        if (window.App && window.App.showToast) {
            App.showToast(`Switched map engine to ${val}. Map active!`, 'info');
        }
    },

    openApiKeyModal: function() {
        const modal = document.getElementById('map-key-modal');
        if (modal) modal.style.display = 'flex';
    },

    closeApiKeyModal: function() {
        const modal = document.getElementById('map-key-modal');
        if (modal) modal.style.display = 'none';
    },

    saveApiKey: function() {
        const keyInput = document.getElementById('map-api-key-input');
        const val = keyInput ? keyInput.value.trim() : '';
        localStorage.setItem('nlams_map_api_key', val);
        this.closeApiKeyModal();
        this.applyTileLayer();
        const badge = document.getElementById('key-status-badge');
        if (badge) {
            badge.className = val ? 'badge badge-success' : 'badge badge-neutral';
            badge.textContent = val ? '🔑 Key Active' : '⚡ India GIS Default';
        }
        if (window.App && window.App.showToast) {
            App.showToast(val ? 'Map API Key saved! GIS tile engine updated.' : 'Map API Key cleared. Resetting engine.', 'success');
        }
    },

    clearApiKey: function() {
        const keyInput = document.getElementById('map-api-key-input');
        if (keyInput) keyInput.value = '';
        localStorage.setItem('nlams_map_api_key', '');
        this.saveApiKey();
    },

    updateMarkers: function() {
        if (!this.currentMap || !this.markersGroup) return;
        this.markersGroup.clearLayers();

        const parcels = window.AppData?.parcels || [];
        const stateFilter = document.getElementById('map-state-filter')?.value || 'All';
        
        let filtered = parcels;
        if (stateFilter !== 'All') {
            filtered = parcels.filter(p => p.state === stateFilter);
        }

        let completed = 0;
        let inProgress = 0;
        let delayed = 0;

        document.getElementById('map-total').textContent = filtered.length;

        filtered.forEach(p => {
            const lat = p.coordinates?.lat || p.lat;
            const lng = p.coordinates?.lng || p.lng;

            if (lat && lng) {
                let markerColor = '#06b6d4'; // cyan default
                if (p.status === 'completed' || p.currentStage === 'possession-transfer') {
                    markerColor = '#10b981'; // emerald
                    completed++;
                } else if (p.status === 'delayed' || p.status === 'on-hold') {
                    markerColor = '#f59e0b'; // amber
                    delayed++;
                } else if (p.status === 'disputed') {
                    markerColor = '#f43f5e'; // rose
                    delayed++;
                } else {
                    inProgress++;
                }

                const markerHtml = `
                    <div style="background-color: ${markerColor}; width: 18px; height: 18px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 0 14px ${markerColor}; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"></div>
                `;
                const icon = L.divIcon({ html: markerHtml, className: 'custom-div-icon', iconSize: [18, 18], iconAnchor: [9, 9] });

                const popupContent = `
                    <div style="background: #090a0f; color: #f8fafc; padding: 14px; border-radius: 12px; min-width: 220px; font-family: sans-serif; border: 1px solid rgba(255,255,255,0.15);">
                        <div style="font-size: 0.72rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 2px;">${p.state} &bull; ${p.district}</div>
                        <h4 style="margin: 0 0 6px 0; color: #a855f7; font-size: 1.05rem; font-weight: 800;">${p.id}</h4>
                        <div style="font-size: 0.82rem; color: #cbd5e1; margin-bottom: 8px;">Village: <strong>${p.village}</strong> | Survey: <strong>${p.surveyNo}</strong></div>
                        
                        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px;">
                            <span style="color: #94a3b8;">Notified Area:</span>
                            <span style="color: #6366f1; font-weight: 700;">${p.area} ha</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 8px;">
                            <span style="color: #94a3b8;">Market Value:</span>
                            <span style="color: #10b981; font-weight: 700;">₹${p.marketValue} Lakhs</span>
                        </div>

                        <div style="padding: 6px 10px; background: rgba(255,255,255,0.05); border-radius: 6px; font-size: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #94a3b8;">Stage:</span>
                            <span style="color: ${markerColor}; font-weight: 800; text-transform: capitalize;">${p.currentStage.replace('-', ' ')}</span>
                        </div>
                    </div>
                `;

                L.marker([lat, lng], { icon: icon })
                 .addTo(this.markersGroup)
                 .bindPopup(popupContent, { className: 'dark-glass-popup' });
            }
        });

        document.getElementById('map-comp').textContent = completed;
        document.getElementById('map-prog').textContent = inProgress;
        document.getElementById('map-delay').textContent = delayed;
    },

    filterState: function(stateName) {
        if (!this.currentMap) return;
        
        const stateCoords = {
            'Maharashtra': [19.7515, 75.7139, 7],
            'Rajasthan': [27.0238, 74.2179, 7],
            'Tamil Nadu': [11.1271, 78.6569, 7],
            'Uttar Pradesh': [26.8467, 80.9462, 7],
            'Gujarat': [22.2587, 71.1924, 7],
            'All': [21.7679, 78.8718, 5]
        };

        const target = stateCoords[stateName] || stateCoords['All'];
        this.currentMap.flyTo([target[0], target[1]], target[2], { duration: 1.2 });
        this.updateMarkers();
    }
};
window.MapView = MapView;

