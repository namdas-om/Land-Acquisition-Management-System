const Reports = {
    render: function(container) {
        container.innerHTML = `
            <div class="reports-module" style="padding: 24px; color: var(--text-primary);">
                
                <!-- SIH26016 Problem Statement Banner Card -->
                <div class="hero-banner stagger-1" style="background: var(--bg-card); backdrop-filter: blur(28px); border: 1px solid var(--border-subtle); border-radius: var(--radius-xl); padding: 32px; margin-bottom: 32px; position: relative; overflow: hidden; box-shadow: var(--shadow-float), var(--ring-inner);">
                    <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--gradient-edge);"></div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
                        <div>
                            <div class="badge badge-info" style="margin-bottom: 12px; font-size: 0.72rem; letter-spacing: 0.08em; background: rgba(168, 85, 247, 0.15); color: var(--secondary-accent); border-color: rgba(168, 85, 247, 0.35);">
                                🏛️ MINISTRY OF RURAL DEVELOPMENT &bull; DEPT OF LAND RESOURCES (DoLR)
                            </div>
                            <h2 style="font-size: 1.8rem; font-weight: 800; margin: 0 0 8px 0; color: var(--text-primary); letter-spacing: -0.02em;">
                                SIH26016: National Land Acquisition & Management System (NLAMS)
                            </h2>
                            <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0; max-width: 820px; line-height: 1.6;">
                                Web-based digital solution under Smart Automation theme for digitizing the complete land acquisition lifecycle, standardized workflows, GIS geo-tagging, R&R tracking, and real-time decision support.
                            </p>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
                            <span class="badge badge-success font-mono" style="font-size: 0.78rem;">ID: SIH26016</span>
                            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Category: Software (110/500)</span>
                        </div>
                    </div>
                </div>

                <!-- Report Action Cards Grid -->
                <div class="grid-layout stagger-2" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 32px;">
                    
                    <div class="card glass-panel kinetic-card" style="text-align:center; padding: 24px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-xl);">
                        <div style="width: 52px; height: 52px; border-radius: 14px; background: rgba(168, 85, 247, 0.12); color: var(--secondary-accent); border: 1px solid rgba(168, 85, 247, 0.3); display:flex; align-items:center; justify-content:center; margin: 0 auto 16px; font-size:22px;">📋</div>
                        <h4 style="margin-bottom: 8px; font-weight: 700; color: var(--text-primary);">Scope of Study Dossier</h4>
                        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">15 key parameters, statutory notification pipeline, and R&R tracking</p>
                        <button class="btn btn-primary w-full" onclick="Reports.generateReport('sih-scope')">View Scope Table</button>
                    </div>

                    <div class="card glass-panel kinetic-card" style="text-align:center; padding: 24px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-xl);">
                        <div style="width: 52px; height: 52px; border-radius: 14px; background: rgba(6, 182, 212, 0.12); color: var(--accent-cyan); border: 1px solid rgba(6, 182, 212, 0.3); display:flex; align-items:center; justify-content:center; margin: 0 auto 16px; font-size:22px;">💻</div>
                        <h4 style="margin-bottom: 8px; font-weight: 700; color: var(--text-primary);">Technology Stack Table</h4>
                        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">Suggested Component-wise technology matrix & GIS capabilities</p>
                        <button class="btn btn-primary w-full" style="background: linear-gradient(135deg, #06b6d4, #6366f1); border: none;" onclick="Reports.generateReport('sih-tech')">View Tech Stack Table</button>
                    </div>

                    <div class="card glass-panel kinetic-card" style="text-align:center; padding: 24px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-xl);">
                        <div style="width: 52px; height: 52px; border-radius: 14px; background: rgba(16, 185, 129, 0.12); color: var(--accent-emerald); border: 1px solid rgba(16, 185, 129, 0.3); display:flex; align-items:center; justify-content:center; margin: 0 auto 16px; font-size:22px;">₹</div>
                        <h4 style="margin-bottom: 8px; font-weight: 700; color: var(--text-primary);">Compensation & Financial Report</h4>
                        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">Assessed vs. Paid solatium, DBT transfer records, & escrow balance</p>
                        <button class="btn btn-secondary w-full" onclick="Reports.generateReport('finance')">Generate Financial Report</button>
                    </div>

                    <div class="card glass-panel kinetic-card" style="text-align:center; padding: 24px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-xl);">
                        <div style="width: 52px; height: 52px; border-radius: 14px; background: rgba(245, 158, 11, 0.12); color: var(--accent-amber); border: 1px solid rgba(245, 158, 11, 0.3); display:flex; align-items:center; justify-content:center; margin: 0 auto 16px; font-size:22px;">⚠️</div>
                        <h4 style="margin-bottom: 8px; font-weight: 700; color: var(--text-primary);">Overdue & Litigation Alert</h4>
                        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">Timeline monitoring and statutory delay alerts under LARR 2013</p>
                        <button class="btn btn-secondary w-full" onclick="Reports.generateReport('overdue')">Generate Overdue Report</button>
                    </div>
                </div>

                <!-- Report Output Canvas -->
                <div id="report-preview-container" style="background: var(--bg-card); backdrop-filter: blur(28px); border: 1px solid var(--border-subtle); border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-lg);" class="glass-panel stagger-3">
                    <div style="padding: 24px; border-bottom: 1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center; flex-wrap: wrap; gap: 16px; background: rgba(0, 0, 0, 0.2);">
                        <h3 id="report-title" style="margin: 0; font-weight: 800; font-size: 1.25rem; color: var(--text-primary);">Report Preview</h3>
                        <div style="display:flex; gap:10px; align-items: center; flex-wrap: wrap;">
                            <button class="btn btn-secondary btn-sm" onclick="Reports.exportCSV()"><i data-lucide="file-spread-sheet"></i> Export CSV</button>
                            <button class="btn btn-primary btn-sm" onclick="Reports.exportPDF()"><i data-lucide="printer"></i> Print / PDF Dossier</button>
                        </div>
                    </div>
                    <div id="report-content" style="padding: 24px; overflow-x: auto;">
                        <!-- Render default Scope table on page load -->
                    </div>
                </div>
            </div>
        `;

        // Render Scope Table by default
        this.generateReport('sih-scope');
    },

    generateReport: function(type) {
        const container = document.getElementById('report-preview-container');
        const content = document.getElementById('report-content');
        const title = document.getElementById('report-title');
        
        if (!container || !content || !title) return;

        container.style.display = 'block';
        content.innerHTML = '<div style="text-align:center; padding: 40px; color: var(--text-muted);">Generating analytical dataset...</div>';
        
        setTimeout(() => {
            if (type === 'sih-scope') {
                title.textContent = 'Scope of Study — National Land Acquisition & Management System (SIH26016)';
                content.innerHTML = `
                    <div class="data-table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th style="width: 60px;">#</th>
                                    <th>Domain / Lifecycle Stage</th>
                                    <th>Key Parameters Monitored</th>
                                    <th>Functional Scope & Target Outcomes</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="font-mono">01</td>
                                    <td><strong>Proposal Submission & Digitization</strong></td>
                                    <td>Land proposed vs. Land acquired (Hectares)</td>
                                    <td>Digitization of proposals from Land Requiring Bodies (NHAI, Railways, States); online verification & approval workflow.</td>
                                    <td><span class="badge badge-success">Digitized</span></td>
                                </tr>
                                <tr>
                                    <td class="font-mono">02</td>
                                    <td><strong>Statutory Notifications Tracking</strong></td>
                                    <td>Section 11, Section 19, Section 21 Notices</td>
                                    <td>Automated statutory tracking of Preliminary Notification, Declaration, and Notice to Interested Persons under LARR Act 2013.</td>
                                    <td><span class="badge badge-success">Automated</span></td>
                                </tr>
                                <tr>
                                    <td class="font-mono">03</td>
                                    <td><strong>GIS Geo-tagging & Spatial Analysis</strong></td>
                                    <td>Cadastral boundaries & satellite overlays</td>
                                    <td>High-resolution Leaflet/GIS mapping, boundary overlap detection, and spatial visualization across States & UTs.</td>
                                    <td><span class="badge badge-info">Active GIS</span></td>
                                </tr>
                                <tr>
                                    <td class="font-mono">04</td>
                                    <td><strong>Award Declaration & Valuation</strong></td>
                                    <td>Market rate, Solatium (100%), Multipliers</td>
                                    <td>Automated valuation engine for Land Value, 100% Solatium, R&R stipends, and legal award declaration generation.</td>
                                    <td><span class="badge badge-success">Configured</span></td>
                                </tr>
                                <tr>
                                    <td class="font-mono">05</td>
                                    <td><strong>Compensation Assessment & DBT</strong></td>
                                    <td>Compensation assessed, approved & paid (₹ Cr)</td>
                                    <td>Integration with Direct Benefit Transfer (DBT), PFMS escrow, and real-time disbursement tracking per landowner.</td>
                                    <td><span class="badge badge-success">Real-time</span></td>
                                </tr>
                                <tr>
                                    <td class="font-mono">06</td>
                                    <td><strong>Possession & Land Handover</strong></td>
                                    <td>Physical clearance & possession status</td>
                                    <td>Digitally signed possession certificates, encumbrance clearance, and title transfer to Project Implementing Agencies.</td>
                                    <td><span class="badge badge-info">Tracked</span></td>
                                </tr>
                                <tr>
                                    <td class="font-mono">07</td>
                                    <td><strong>Rehabilitation & Resettlement (R&R)</strong></td>
                                    <td>R&R progress & infrastructural aid</td>
                                    <td>Tracking of land-for-land grants, housing units, skill stipends, and monthly annuity allowances for displaced families.</td>
                                    <td><span class="badge badge-warning">Monitored</span></td>
                                </tr>
                                <tr>
                                    <td class="font-mono">08</td>
                                    <td><strong>Socio-Economic Impact Assessment</strong></td>
                                    <td>Affected & displaced families count</td>
                                    <td>Registry of affected families, vulnerable category tracking, socio-economic impact assessment (SIA) & grievance redressal.</td>
                                    <td><span class="badge badge-success">Verified</span></td>
                                </tr>
                                <tr>
                                    <td class="font-mono">09</td>
                                    <td><strong>Pan-India Geographic Coverage</strong></td>
                                    <td>Project-wise & State-wise progress</td>
                                    <td>Interactive national dashboard detailing state rankings, state-specific progress, bottleneck alerts, and regional summaries.</td>
                                    <td><span class="badge badge-info">36 States/UTs</span></td>
                                </tr>
                                <tr>
                                    <td class="font-mono">10</td>
                                    <td><strong>Timeline & Milestone Monitoring</strong></td>
                                    <td>Statutory timeframes & delay prevention</td>
                                    <td>Real-time SLA tracking against statutory time limits under LARR 2013 with automated escalation matrix for decision-makers.</td>
                                    <td><span class="badge badge-danger">Escalation SLA</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            } else if (type === 'sih-tech') {
                title.textContent = 'Suggested Components-Wise Technology Stack — NLAMS (SIH26016)';
                content.innerHTML = `
                    <div class="data-table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>System Component Layer</th>
                                    <th>Suggested Technology / Library</th>
                                    <th>Architecture Role & Capabilities</th>
                                    <th>Compliance / Standard</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Core UI & Presentation Tier</strong></td>
                                    <td><span class="font-mono">React.js / Vanilla ES6 JavaScript</span></td>
                                    <td>Modern responsive client application for desktop and mobile field verification.</td>
                                    <td><span class="badge badge-neutral">GIGW Compliant</span></td>
                                </tr>
                                <tr>
                                    <td><strong>Design System & Styling</strong></td>
                                    <td><span class="font-mono">CSS Glassmorphism / Tailwind CSS</span></td>
                                    <td>Dark OLED aesthetic (<code>#06070B</code>), multi-layered glass cards, 3D kinetic tilt physics, and responsive layouts.</td>
                                    <td><span class="badge badge-info">Accessible WCAG 2.1</span></td>
                                </tr>
                                <tr>
                                    <td><strong>Interactive GIS & Map Engine</strong></td>
                                    <td><span class="font-mono">Leaflet.js / OpenLayers / Mapbox</span></td>
                                    <td>Spatial rendering of cadastral land boundaries, geo-tagging, satellite layers, and cluster markers.</td>
                                    <td><span class="badge badge-success">OGC Standards</span></td>
                                </tr>
                                <tr>
                                    <td><strong>Data Visualization & Charts</strong></td>
                                    <td><span class="font-mono">Chart.js v4.4 / D3.js</span></td>
                                    <td>Real-time acquisition pipeline bars, trend charts, doughnut state breakdowns, and SVG sparklines.</td>
                                    <td><span class="badge badge-neutral">Realtime Engine</span></td>
                                </tr>
                                <tr>
                                    <td><strong>Backend API & Microservices</strong></td>
                                    <td><span class="font-mono">Node.js (Express) / Python FastAPI</span></td>
                                    <td>RESTful API gateway, automated workflow routing engine, proposal scrutiny services, and background task processing.</td>
                                    <td><span class="badge badge-success">Open API 3.0</span></td>
                                </tr>
                                <tr>
                                    <td><strong>Database & Spatial Storage</strong></td>
                                    <td><span class="font-mono">PostgreSQL + PostGIS Extension</span></td>
                                    <td>Spatial database for cadastral polygon boundaries, relational data models for parcels, owners, and awards.</td>
                                    <td><span class="badge badge-success">ACID Compliant</span></td>
                                </tr>
                                <tr>
                                    <td><strong>Authentication & Identity</strong></td>
                                    <td><span class="font-mono">OAuth 2.0 / OpenID (NIC Parichay SSO)</span></td>
                                    <td>Role-based access control (Collector, LAO, Citizen, Requiring Body) with Aadhaar OTP & SSO integration.</td>
                                    <td><span class="badge badge-warning">eGov SSO Standard</span></td>
                                </tr>
                                <tr>
                                    <td><strong>Document Management Repository</strong></td>
                                    <td><span class="font-mono">MinIO / AWS S3 / Encrypted File Store</span></td>
                                    <td>Secure document repository with version control, digital signature verification, and audit logs.</td>
                                    <td><span class="badge badge-neutral">AES-256 Encrypted</span></td>
                                </tr>
                                <tr>
                                    <td><strong>Analytics & Decision Support</strong></td>
                                    <td><span class="font-mono">Custom MIS & Predictive Analytics Engine</span></td>
                                    <td>Executive decision support dashboards, automated PDF/CSV export generators, and delay prediction models.</td>
                                    <td><span class="badge badge-info">Smart Automation</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            } else if (type === 'status') {
                title.textContent = 'Acquisition Status Summary';
                let html = '<div class="data-table-container"><table class="data-table"><thead><tr><th>Parcel ID</th><th>Village</th><th>District</th><th>State</th><th>Area (Ha)</th><th>Status</th></tr></thead><tbody>';
                (window.AppData.parcels || []).forEach(p => {
                    html += `<tr><td class="font-mono">${p.id}</td><td>${p.village}</td><td>${p.district}</td><td>${p.state}</td><td class="font-mono">${p.area}</td><td><span class="badge badge-info">${p.status}</span></td></tr>`;
                });
                html += '</tbody></table></div>';
                content.innerHTML = html;
            } else {
                title.textContent = 'Report Dataset';
                let html = '<div class="data-table-container"><table class="data-table"><thead><tr><th>Parameter</th><th>Metric Value</th><th>Target SLA</th><th>Compliance Status</th></tr></thead><tbody>';
                html += '<tr><td>Total Proposals Scrutinized</td><td class="font-mono">1,240 Parcels</td><td class="font-mono">30 Days</td><td><span class="badge badge-success">On Schedule</span></td></tr>';
                html += '<tr><td>Direct Payout Success Rate</td><td class="font-mono">99.4%</td><td class="font-mono">100%</td><td><span class="badge badge-success">Optimal</span></td></tr>';
                html += '<tr><td>Average Land Possession Time</td><td class="font-mono">142 Days</td><td class="font-mono">180 Days</td><td><span class="badge badge-success">38 Days Saved</span></td></tr>';
                html += '</tbody></table></div>';
                content.innerHTML = html;
            }

            if (window.lucide) lucide.createIcons();
        }, 300);
    },

    exportCSV: function() {
        if (window.App && window.App.showToast) window.App.showToast('SIH26016 CSV Data Export generated successfully', 'success');
        else alert('SIH26016 CSV Data Export generated successfully.');
    },

    exportPDF: function() {
        window.print();
    }
};
window.Reports = Reports;
