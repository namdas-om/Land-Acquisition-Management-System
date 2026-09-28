window.Stakeholders = {
    state: {
        activeTab: 'landowners'
    },

    render(container) {
        this.container = container;
        this.renderLayout();
    },

    renderLayout() {
        this.container.innerHTML = `
            <div class="stakeholders-module stagger-1" style="padding: 24px; color: var(--text-primary); font-family: inherit;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div>
                        <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; margin: 0 0 4px 0;">Stakeholder & Grievance Directory</h2>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">Landowners, Requisitioning Bodies, Collectorate Officers & LARR Hearing Redressal</div>
                    </div>
                    <button class="btn btn-primary" onclick="window.Stakeholders.openGrievanceModal()" style="box-shadow: var(--glow-button);"><i data-lucide="plus-circle"></i> File New Grievance / Hearing Notice</button>
                </div>

                <!-- Tab Bar -->
                <div style="display: flex; border-bottom: 1px solid var(--border-subtle); margin-bottom: 24px; gap: 8px;">
                    ${this.renderTab('landowners', 'Landowners & Beneficiaries', 'users')}
                    ${this.renderTab('officers', 'Government Nodal Officers', 'building')}
                    ${this.renderTab('legal', 'Legal Representatives', 'scale')}
                    ${this.renderTab('grievances', 'Grievance & LARR Hearings', 'shield-alert')}
                </div>

                <!-- Content Area -->
                <div id="stakeholder-content">
                    ${this.renderActiveTabContent()}
                </div>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
    },

    renderTab(id, label, icon) {
        const isActive = this.state.activeTab === id;
        const color = isActive ? '#ffffff' : 'var(--text-muted)';
        const border = isActive ? 'var(--secondary-accent)' : 'transparent';
        const bg = isActive ? 'rgba(168, 85, 247, 0.12)' : 'transparent';
        return `
            <button onclick="window.Stakeholders.switchTab('${id}')" style="background: ${bg}; border: none; border-bottom: 2px solid ${border}; color: ${color}; padding: 12px 20px; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;">
                <i data-lucide="${icon}" style="width: 16px; height: 16px;"></i> ${label}
            </button>
        `;
    },

    switchTab(id) {
        this.state.activeTab = id;
        this.renderLayout();
    },

    renderActiveTabContent() {
        if (this.state.activeTab === 'landowners') return this.renderLandowners();
        if (this.state.activeTab === 'officers') return this.renderOfficers();
        if (this.state.activeTab === 'legal') return this.renderLegal();
        if (this.state.activeTab === 'grievances') return this.renderGrievances();
        return '';
    },

    renderLandowners() {
        const list = window.AppData?.owners || [];
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px;">
                ${list.slice(0, 18).map(l => {
                    const pct = l.totalCompensation > 0 ? Math.min(100, Math.round((l.paidAmount / l.totalCompensation) * 100)) : 60;
                    return `
                        <div class="glass-panel" style="background: var(--bg-card); backdrop-filter: blur(20px); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 20px; display: flex; gap: 16px; align-items: center;">
                            <div class="user-avatar" style="width: 48px; height: 48px; font-size: 1.1rem; flex-shrink: 0;">
                                ${l.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div style="flex-grow: 1; min-width: 0;">
                                <h3 style="margin: 0 0 4px 0; font-size: 1rem; color: var(--text-primary); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${l.name}</h3>
                                <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 8px;">Father: ${l.fatherName || 'Suresh Patil'} &bull; ${l.phone}</div>
                                <div style="font-size: 0.72rem; color: var(--secondary-accent); margin-bottom: 10px;" class="font-mono">Aadhaar: ${l.aadhaar}</div>

                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                    <span style="font-size: 0.75rem; color: var(--text-secondary);">Direct Bank Transfer (DBT)</span>
                                    <span style="font-size: 0.78rem; color: var(--accent-emerald); font-weight: 800;">${pct}% Disbursed</span>
                                </div>
                                <div style="width: 100%; height: 6px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden; border: 1px solid var(--border-subtle);">
                                    <div style="width: ${pct}%; height: 100%; background: var(--gradient-brand);"></div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderOfficers() {
        const list = window.AppData?.officers || [];
        return `
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Official ID & Name</th>
                            <th>Designation</th>
                            <th>Department</th>
                            <th>Jurisdiction State</th>
                            <th>Active Cases</th>
                            <th>Contact Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(o => `
                            <tr>
                                <td>
                                    <div style="font-weight: 800; color: var(--text-primary);">${o.name}</div>
                                    <div style="font-size: 0.72rem; color: var(--text-muted);" class="font-mono">${o.id}</div>
                                </td>
                                <td><span class="badge badge-info">${o.designation}</span></td>
                                <td style="color: var(--text-secondary);">${o.department}</td>
                                <td style="color: var(--text-secondary);">${o.jurisdiction}</td>
                                <td><span style="color: var(--primary-accent); font-weight: 800; font-family: monospace;">${o.activeCases} Active</span></td>
                                <td style="color: var(--text-muted); font-size: 0.82rem;">${o.email}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderLegal() {
        const list = window.AppData?.legalTeams || [];
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                ${list.map(l => `
                    <div class="glass-panel" style="background: var(--bg-card); backdrop-filter: blur(20px); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 22px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                            <h3 style="margin: 0; color: var(--text-primary); font-size: 1.1rem; font-weight: 800;">${l.firmName}</h3>
                            <span class="badge badge-warning">${l.casesAssigned} Cases</span>
                        </div>
                        <div style="font-size: 0.82rem; color: var(--secondary-accent); font-weight: 700; margin-bottom: 14px;">Lead Advocate: ${l.advocate}</div>
                        <div style="border-top: 1px solid var(--border-subtle); padding-top: 12px; display: flex; justify-content: space-between; font-size: 0.8rem;">
                            <div>
                                <div style="color: var(--text-muted);">Specialization</div>
                                <div style="color: var(--text-primary); font-weight: 600;">${l.specialization}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: var(--text-muted);">Contact</div>
                                <div style="color: var(--text-secondary);">${l.email}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderGrievances() {
        const mockGrievances = [
            { id: 'GRV-MH-001', parcelId: 'LA-MH-PUN-001', complainant: 'Ramesh S. Patil', type: 'Solatium Calculation Objection (Sec 15)', status: 'Hearing Scheduled', hearingDate: '2024-10-14', officer: 'Collector Pune', priority: 'High' },
            { id: 'GRV-GJ-004', parcelId: 'LA-GJ-AMD-004', complainant: 'Sunita Devi Patel', type: 'R&R Resettlement House Allotment Discrepancy', status: 'Under Scrutiny', hearingDate: '2024-10-20', officer: 'SDM Ahmedabad', priority: 'Medium' },
            { id: 'GRV-PB-012', parcelId: 'LA-PB-ASR-012', complainant: 'Gurpreet Singh', type: 'Boundary Measurement Alignment Review', status: 'Resolved / Awarded', hearingDate: '2024-09-15', officer: 'LARR Tribunal Judge', priority: 'Low' }
        ];

        return `
            <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-xl); padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin: 0;">LARR Act Section 15 Public Grievances & Hearing Track</h3>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Presiding Authority: District Collectorate & LARR Tribunal</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 14px;">
                    ${mockGrievances.map(g => `
                        <div style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                                    <span style="font-family: monospace; font-weight: 800; color: var(--secondary-accent); font-size: 0.9rem;">${g.id}</span>
                                    <span class="badge ${g.status === 'Resolved / Awarded' ? 'badge-success' : 'badge-warning'}">${g.status}</span>
                                    <span class="badge badge-info">Parcel: ${g.parcelId}</span>
                                </div>
                                <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">${g.type}</div>
                                <div style="font-size: 0.78rem; color: var(--text-muted);">Complainant: ${g.complainant} &bull; Officer: ${g.officer}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Hearing Date</div>
                                <div style="font-size: 0.9rem; font-weight: 800; color: var(--accent-cyan); font-family: monospace;">${g.hearingDate}</div>
                                <button class="btn btn-secondary btn-sm" onclick="App.showToast('Grievance file ${g.id} details loaded', 'info')" style="margin-top: 6px;">View Case File</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    openGrievanceModal() {
        if (window.App && window.App.showToast) {
            App.showToast('Grievance Submission Form loaded. Official section 15 portal active.', 'info');
        }
    }
};

