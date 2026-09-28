window.Parcels = {
    state: {
        parcels: [],
        filtered: [],
        page: 1,
        perPage: 15,
        sortCol: 'id',
        sortDir: 'asc',
        searchTerm: '',
        filters: { state: 'All', status: 'All', type: 'All' }
    },

    render(container) {
        this.container = container;
        this.state.parcels = window.AppData?.parcels || [];
        this.applyFilters();
        this.renderLayout();
    },

    renderLayout() {
        this.container.innerHTML = `
            <div class="parcels-module" style="padding: 24px; color: var(--text-primary); font-family: inherit;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">Land Parcel Registry</h2>
                    <button class="btn btn-primary" onclick="window.Parcels.openModal()">+ Add New Parcel</button>
                </div>
                
                <!-- Toolbar -->
                <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px; margin-bottom: 24px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
                    <div style="flex-grow: 1; min-width: 260px; position: relative;">
                        <i data-lucide="search" style="position: absolute; left: 12px; top: 10px; width: 18px; color: var(--text-muted);"></i>
                        <input type="text" id="parcel-search" placeholder="Search by ID, Survey No, Village, District..." style="width: 100%; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 20px; padding: 8px 16px 8px 40px; color: var(--text-primary); outline: none;" oninput="window.Parcels.handleSearch(event)">
                    </div>
                    <select id="filter-state" onchange="window.Parcels.handleFilter(event, 'state')" style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 8px 16px; color: var(--text-primary); outline: none;">
                        <option value="All">All States</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                    </select>
                    <select id="filter-status" onchange="window.Parcels.handleFilter(event, 'status')" style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 8px 16px; color: var(--text-primary); outline: none;">
                        <option value="All">All Statuses</option>
                        <option value="On Track">On Track</option>
                        <option value="Delayed">Delayed</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Disputed">Disputed</option>
                    </select>
                    <select id="filter-type" onchange="window.Parcels.handleFilter(event, 'type')" style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 8px 16px; color: var(--text-primary); outline: none;">
                        <option value="All">All Types</option>
                        <option value="Agricultural">Agricultural</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Residential">Residential</option>
                        <option value="Industrial">Industrial</option>
                        <option value="Forest">Forest</option>
                        <option value="Barren">Barren</option>
                    </select>
                    <div style="color: var(--text-muted); font-size: 13px; font-weight: 500;">${this.state.filtered.length} results</div>
                </div>

                <!-- Table -->
                <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: var(--bg-tertiary); border-bottom: 1px solid var(--border-subtle);">
                            <tr>
                                ${this.renderTh('id', 'Parcel ID')}
                                ${this.renderTh('surveyNo', 'Survey No.')}
                                ${this.renderTh('village', 'Village')}
                                ${this.renderTh('district', 'District')}
                                ${this.renderTh('state', 'State')}
                                ${this.renderTh('area', 'Area (ha)')}
                                ${this.renderTh('type', 'Land Type')}
                                ${this.renderTh('status', 'Status')}
                                ${this.renderTh('marketValue', 'Market Value')}
                                <th style="padding: 12px 16px; color: var(--text-muted); font-weight: 600; font-size: 13px;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="parcel-tbody">
                            ${this.renderTableRows()}
                        </tbody>
                    </table>
                    
                    <!-- Pagination -->
                    <div style="padding: 16px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                        <button onclick="window.Parcels.changePage(-1)" ${this.state.page === 1 ? 'disabled' : ''} class="btn btn-secondary" style="padding: 6px 14px; font-size: 13px;">Previous</button>
                        <span style="color: var(--text-muted); font-size: 13px;">Page ${this.state.page} of ${Math.ceil(this.state.filtered.length / this.state.perPage) || 1}</span>
                        <button onclick="window.Parcels.changePage(1)" ${this.state.page >= Math.ceil(this.state.filtered.length / this.state.perPage) ? 'disabled' : ''} class="btn btn-secondary" style="padding: 6px 14px; font-size: 13px;">Next</button>
                    </div>
                </div>

                <!-- Modal Container -->
                <div id="parcel-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
                    ${this.renderModalContent()}
                </div>

                <!-- Slide Panel Container -->
                <div id="parcel-panel" style="position: fixed; top: 0; right: -480px; width: 480px; height: 100%; background: var(--bg-primary); border-left: 1px solid var(--border-subtle); z-index: 900; transition: right 0.3s ease; box-shadow: -5px 0 25px rgba(0,0,0,0.3); overflow-y: auto;">
                </div>
            </div>
        `;
        if(window.lucide) window.lucide.createIcons();
    },

    renderTh(key, label) {
        const isSorted = this.state.sortCol === key;
        const arrow = isSorted ? (this.state.sortDir === 'asc' ? '↑' : '↓') : '';
        return `<th onclick="window.Parcels.handleSort('${key}')" style="padding: 12px 16px; color: var(--text-muted); font-weight: 600; font-size: 13px; cursor: pointer; user-select: none;">${label} ${arrow}</th>`;
    },

    renderTableRows() {
        const start = (this.state.page - 1) * this.state.perPage;
        const rows = this.state.filtered.slice(start, start + this.state.perPage);
        
        if (rows.length === 0) {
            return `<tr><td colspan="10" style="text-align: center; padding: 24px; color: var(--text-muted);">No parcels found.</td></tr>`;
        }

        return rows.map(p => `
            <tr style="border-bottom: 1px solid var(--border-subtle); transition: background 0.15s;" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='transparent'">
                <td style="padding: 12px 16px;"><a href="#" onclick="window.Parcels.openPanel('${p.id}'); return false;" style="color: var(--text-primary); text-decoration: underline; font-weight: 600;">${p.id}</a></td>
                <td style="padding: 12px 16px; color: var(--text-secondary);">${p.surveyNo}</td>
                <td style="padding: 12px 16px; color: var(--text-secondary);">${p.village}</td>
                <td style="padding: 12px 16px; color: var(--text-secondary);">${p.district}</td>
                <td style="padding: 12px 16px; color: var(--text-secondary);">${p.state}</td>
                <td style="padding: 12px 16px; color: var(--text-secondary);">${p.area}</td>
                <td style="padding: 12px 16px; color: var(--text-secondary);">${p.type}</td>
                <td style="padding: 12px 16px;">${this.getStatusBadge(p.status)}</td>
                <td style="padding: 12px 16px; color: var(--text-primary); font-weight: 500;">₹${(p.marketValue || 0).toLocaleString('en-IN')}</td>
                <td style="padding: 12px 16px; display: flex; gap: 8px;">
                    <button onclick="window.Parcels.openPanel('${p.id}')" style="background:none; border:none; color: var(--text-primary); cursor:pointer;"><i data-lucide="eye" style="width:16px;"></i></button>
                    <button style="background:none; border:none; color: var(--text-muted); cursor:pointer;"><i data-lucide="edit" style="width:16px;"></i></button>
                </td>
            </tr>
        `).join('');
    },

    getStatusBadge(status) {
        let cls = 'badge-neutral';
        const st = (status || '').toLowerCase();
        if (st.includes('completed') || st.includes('track')) cls = 'badge-success';
        else if (st.includes('hold') || st.includes('pending')) cls = 'badge-warning';
        else if (st.includes('delay') || st.includes('dispute')) cls = 'badge-danger';
        return `<span class="badge ${cls}">${status}</span>`;
    },

    renderModalContent() {
        return `
            <div style="background: var(--bg-card); backdrop-filter: blur(28px); border: 1px solid var(--border-strong); border-radius: var(--radius-xl); width: 620px; max-width: 92%; padding: 28px; box-shadow: var(--shadow-float), var(--ring-inner);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 14px;">
                    <div>
                        <h3 style="font-size: 1.25rem; color: var(--text-primary); margin:0; font-weight: 800;">Submit Land Acquisition Proposal</h3>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">LARR Act 2013 Statutory Scrutiny & Collector Approval</div>
                    </div>
                    <button onclick="window.Parcels.closeModal()" style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); color: var(--text-muted); width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 18px;">&times;</button>
                </div>
                <form id="add-parcel-form" onsubmit="window.Parcels.handleAddSubmit(event)">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <div><label class="form-label">Survey / Khasra Number</label><input required type="text" class="form-input" placeholder="e.g. 142/2A"></div>
                        <div><label class="form-label">Village / Revenue Circle</label><input required type="text" class="form-input" placeholder="e.g. Haveli Village"></div>
                        <div><label class="form-label">District</label><input required type="text" class="form-input" placeholder="e.g. Pune"></div>
                        <div>
                            <label class="form-label">State Jurisdiction</label>
                            <select required class="form-select">
                                <option value="Maharashtra">Maharashtra</option>
                                <option value="Gujarat">Gujarat</option>
                                <option value="Rajasthan">Rajasthan</option>
                                <option value="Tamil Nadu">Tamil Nadu</option>
                                <option value="Uttar Pradesh">Uttar Pradesh</option>
                            </select>
                        </div>
                        <div><label class="form-label">Notified Area (ha)</label><input required type="number" step="0.01" class="form-input" placeholder="e.g. 4.85"></div>
                        <div><label class="form-label">Estimated Market Value (₹ Lakhs)</label><input required type="number" class="form-input" placeholder="e.g. 85"></div>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label class="form-label">Public Infrastructure Purpose (LARR Sec 2)</label>
                        <input required type="text" class="form-input" placeholder="e.g. Expressway Corridor / Railway Line Expansion / Solar Park">
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 12px;">
                        <button type="button" onclick="window.Parcels.closeModal()" class="btn btn-secondary">Cancel</button>
                        <button type="submit" class="btn btn-primary" style="box-shadow: var(--glow-button);"><i data-lucide="shield-check"></i> Submit Proposal for Scrutiny</button>
                    </div>
                </form>
            </div>
        `;
    },

    openModal() { document.getElementById('parcel-modal').style.display = 'flex'; },
    closeModal() { document.getElementById('parcel-modal').style.display = 'none'; },
    
    handleAddSubmit(e) {
        e.preventDefault();
        this.closeModal();
        if(window.App && window.App.showToast) window.App.showToast('Land Acquisition Proposal submitted successfully to District Collectorate!', 'success');
        this.renderLayout();
    },

    openPanel(id) {
        const p = this.state.parcels.find(x => x.id === id) || {};
        const panel = document.getElementById('parcel-panel');
        panel.innerHTML = `
            <div style="padding: 24px; color: var(--text-primary);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 18px;">
                    <div>
                        <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--secondary-accent); font-weight: 700;">${p.state || 'Maharashtra'} &bull; ${p.district || 'District'}</span>
                        <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin: 2px 0 8px 0;">${p.id || 'N/A'}</h2>
                        ${this.getStatusBadge(p.status || 'N/A')}
                    </div>
                    <button onclick="document.getElementById('parcel-panel').style.right='-480px'" style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); color: var(--text-muted); width:32px; height:32px; border-radius:50%; cursor:pointer; display: flex; align-items: center; justify-content: center; font-size: 18px;">&times;</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                    <div><div style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Survey No.</div><div style="color: var(--text-primary); font-weight:700;">${p.surveyNo || '-'}</div></div>
                    <div><div style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Notified Area</div><div style="color: var(--primary-accent); font-weight:700;">${p.area || '-'} ha</div></div>
                    <div><div style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Village</div><div style="color: var(--text-primary); font-weight:600;">${p.village || '-'}</div></div>
                    <div><div style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Market Value</div><div style="color: var(--accent-emerald); font-weight:700;">₹${p.marketValue || 0} Lakhs</div></div>
                    <div><div style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Acquiring Authority</div><div style="color: var(--text-secondary); font-size: 12px;">${p.acquiringAuthority || 'NHAI'}</div></div>
                    <div><div style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Land Category</div><div style="color: var(--text-secondary); font-size: 12px;">${p.landType || 'Agricultural'}</div></div>
                </div>

                <div style="margin-bottom: 24px;">
                    <h4 style="color: var(--text-primary); margin-bottom: 14px; font-weight: 800; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="file-text" style="width: 16px; height: 16px; color: var(--secondary-accent);"></i> LARR Act 2013 Statutory Stepper
                    </h4>
                    <div style="border-left: 2px solid var(--border-strong); padding-left: 18px; position: relative; display: flex; flex-direction: column; gap: 16px;">
                        <div style="position: relative;">
                            <div style="position: absolute; left: -24px; top: 2px; width: 10px; height: 10px; border-radius: 50%; background: var(--accent-emerald); box-shadow: 0 0 8px var(--accent-emerald);"></div>
                            <div style="color: var(--text-primary); font-size: 0.88rem; font-weight: 700;">Section 4 SIA Preliminary Study</div>
                            <div style="color: var(--text-muted); font-size: 0.75rem;">Social Impact Assessment completed & approved</div>
                        </div>
                        <div style="position: relative;">
                            <div style="position: absolute; left: -24px; top: 2px; width: 10px; height: 10px; border-radius: 50%; background: var(--accent-emerald); box-shadow: 0 0 8px var(--accent-emerald);"></div>
                            <div style="color: var(--text-primary); font-size: 0.88rem; font-weight: 700;">Section 11 Preliminary Notification</div>
                            <div style="color: var(--text-muted); font-size: 0.75rem;">Gazette Gazette Published: ${p.section11Date || '2024-01-15'}</div>
                        </div>
                        <div style="position: relative;">
                            <div style="position: absolute; left: -24px; top: 2px; width: 10px; height: 10px; border-radius: 50%; background: ${p.section19Date ? 'var(--accent-emerald)' : 'var(--accent-amber)'};"></div>
                            <div style="color: var(--text-primary); font-size: 0.88rem; font-weight: 700;">Section 19 Declaration of Acquisition</div>
                            <div style="color: var(--text-muted); font-size: 0.75rem;">${p.section19Date ? 'Published on ' + p.section19Date : 'Under Scrutiny by Collector'}</div>
                        </div>
                        <div style="position: relative;">
                            <div style="position: absolute; left: -24px; top: 2px; width: 10px; height: 10px; border-radius: 50%; background: ${p.section21Date ? 'var(--accent-emerald)' : 'var(--border-subtle)'};"></div>
                            <div style="color: var(--text-primary); font-size: 0.88rem; font-weight: 700;">Section 21 & 23 Compensation Award</div>
                            <div style="color: var(--text-muted); font-size: 0.75rem;">${p.section21Date ? 'Award Determined: Solatium 100%' : 'Awaiting Final Hearing'}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        panel.style.right = '0';
        if(window.lucide) window.lucide.createIcons();
    },

    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    handleSearch: null,

    initSearchHandler() {
        this.handleSearch = this.debounce((e) => {
            this.state.searchTerm = e.target.value.toLowerCase();
            this.state.page = 1;
            this.applyFilters();
            this.renderLayout();
        }, 300).bind(this);
    },

    handleFilter(e, type) {
        this.state.filters[type] = e.target.value;
        this.state.page = 1;
        this.applyFilters();
        this.renderLayout();
    },

    handleSort(col) {
        if (this.state.sortCol === col) {
            this.state.sortDir = this.state.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
            this.state.sortCol = col;
            this.state.sortDir = 'asc';
        }
        this.applyFilters();
        this.renderLayout();
    },

    changePage(delta) {
        this.state.page += delta;
        this.renderLayout();
    },

    applyFilters() {
        let res = [...this.state.parcels];
        
        if (this.state.searchTerm) {
            const term = this.state.searchTerm;
            res = res.filter(p => 
                (p.id||'').toLowerCase().includes(term) || 
                (p.surveyNo||'').toLowerCase().includes(term) || 
                (p.village||'').toLowerCase().includes(term) || 
                (p.district||'').toLowerCase().includes(term)
            );
        }

        if (this.state.filters.state !== 'All') res = res.filter(p => p.state === this.state.filters.state);
        if (this.state.filters.status !== 'All') res = res.filter(p => p.status === this.state.filters.status);
        if (this.state.filters.type !== 'All') res = res.filter(p => p.type === this.state.filters.type);

        res.sort((a, b) => {
            let valA = a[this.state.sortCol];
            let valB = b[this.state.sortCol];
            if(typeof valA === 'string') valA = valA.toLowerCase();
            if(typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return this.state.sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return this.state.sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        this.state.filtered = res;
    }
};

window.Parcels.initSearchHandler();
