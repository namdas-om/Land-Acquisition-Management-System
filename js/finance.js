const Finance = {
    render: function(container) {
        container.innerHTML = `
            <div class="finance-module stagger-1" style="padding: 24px; color: var(--text-primary);">
                <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 24px;">
                    <div class="kpi-card glass-panel">
                        <div class="kpi-label">Total Compensation Sanctioned</div>
                        <div class="kpi-value font-mono" id="fin-budget" style="color: var(--secondary-accent);">₹542.80 Cr</div>
                    </div>
                    <div class="kpi-card glass-panel">
                        <div class="kpi-label">DBT Disbursed via PFMS</div>
                        <div class="kpi-value font-mono" id="fin-disbursed" style="color: var(--accent-emerald);">₹368.50 Cr</div>
                    </div>
                    <div class="kpi-card glass-panel">
                        <div class="kpi-label">Pending Award Disbursal</div>
                        <div class="kpi-value font-mono" id="fin-pending" style="color: var(--accent-amber);">18 Cases</div>
                    </div>
                    <div class="kpi-card glass-panel">
                        <div class="kpi-label">Avg. Rate / Hectare</div>
                        <div class="kpi-value font-mono" id="fin-avg" style="color: var(--accent-cyan);">₹48.50 L/ha</div>
                    </div>
                </div>

                <div class="tabs" style="display: flex; gap: 8px; border-bottom: 1px solid var(--border-subtle); margin-bottom: 24px;">
                    <button class="tab-btn active" onclick="Finance.switchTab('table', event)"><i data-lucide="table" style="width:16px; height:16px; display:inline-block; vertical-align:text-bottom;"></i> Compensation & DBT Ledger</button>
                    <button class="tab-btn" onclick="Finance.switchTab('charts', event)"><i data-lucide="pie-chart" style="width:16px; height:16px; display:inline-block; vertical-align:text-bottom;"></i> Budget Analysis</button>
                    <button class="tab-btn" onclick="Finance.switchTab('calculator', event)"><i data-lucide="calculator" style="width:16px; height:16px; display:inline-block; vertical-align:text-bottom;"></i> LARR 2013 Calculator</button>
                </div>

                <div id="tab-table" class="tab-content active">
                    <div class="glass-panel" style="padding:15px; margin-bottom:15px;">
                        <input type="text" id="fin-search" placeholder="Search by Parcel ID or Bank Method..." class="form-input" oninput="Finance.renderTable(this.value)">
                    </div>
                    <div id="finance-table-container"></div>
                </div>

                <div id="tab-charts" class="tab-content" style="display:none;">
                    <div class="chart-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px;">
                        <div class="glass-panel" style="padding: 20px;">
                            <h4 style="margin: 0 0 14px 0; font-weight: 800;">Compensation Breakdown (LARR Sec 26-30)</h4>
                            <div style="height: 260px; position: relative;"><canvas id="budgetAllocationChart"></canvas></div>
                        </div>
                        <div class="glass-panel" style="padding: 20px;">
                            <h4 style="margin: 0 0 14px 0; font-weight: 800;">State-wise Disbursed Funds</h4>
                            <div style="height: 260px; position: relative;"><canvas id="stateExpenditureChart"></canvas></div>
                        </div>
                    </div>
                </div>

                <div id="tab-calculator" class="tab-content" style="display:none;">
                    <div class="glass-panel" style="padding: 28px; max-width: 640px; margin: 0 auto; border-radius: var(--radius-xl); backdrop-filter: blur(28px);">
                        <h3 style="margin: 0 0 6px 0; font-weight: 800; font-size: 1.25rem;">LARR Act 2013 Statutory Compensation Calculator</h3>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 20px;">Computes Market Rate, 100% Solatium, Rural Multiplier (1.25x - 2.0x), and R&R Admin Allowances</div>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label class="form-label">Notified Land Area (hectares)</label>
                            <input type="number" id="calc-area" class="form-input" value="2.5" step="0.1">
                        </div>
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label class="form-label">Circle / Market Rate (₹ / hectare)</label>
                            <input type="number" id="calc-rate" class="form-input" value="4500000">
                        </div>
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label class="form-label">Location Classification</label>
                            <select id="calc-location" class="form-select">
                                <option value="rural">Rural (2.0x Multiplier under Sec 26)</option>
                                <option value="urban">Urban (1.0x Multiplier under Sec 26)</option>
                            </select>
                        </div>
                        <div style="display:flex; gap: 12px;">
                            <button class="btn btn-primary" onclick="Finance.calculate()" style="box-shadow: var(--glow-button);"><i data-lucide="calculator"></i> Calculate Award</button>
                            <button class="btn btn-secondary" onclick="Finance.resetCalc()">Reset</button>
                        </div>

                        <div id="calc-result" style="display:none; margin-top: 24px; border-top: 1px solid var(--border-subtle); padding-top: 20px; background: rgba(0,0,0,0.2); border-radius: 12px; padding: 18px;">
                            <div style="display:flex; justify-content: space-between; margin-bottom: 10px; color: var(--text-secondary); font-size: 0.88rem;"><span>Base Land Market Value:</span> <strong id="res-land" class="font-mono" style="color: var(--text-primary);">₹0</strong></div>
                            <div style="display:flex; justify-content: space-between; margin-bottom: 10px; color: var(--text-secondary); font-size: 0.88rem;"><span>100% Solatium (LARR Sec 30):</span> <strong id="res-solatium" class="font-mono" style="color: var(--secondary-accent);">₹0</strong></div>
                            <div style="display:flex; justify-content: space-between; margin-bottom: 10px; color: var(--text-secondary); font-size: 0.88rem;"><span>Rural Multiplier Compensation:</span> <strong id="res-add" class="font-mono" style="color: var(--accent-cyan);">₹0</strong></div>
                            <div style="display:flex; justify-content: space-between; margin-bottom: 10px; color: var(--text-secondary); font-size: 0.88rem;"><span>R&R Resettlement Package (15%):</span> <strong id="res-rr" class="font-mono" style="color: var(--accent-emerald);">₹0</strong></div>
                            <div style="display:flex; justify-content: space-between; margin-bottom: 10px; color: var(--text-secondary); font-size: 0.88rem;"><span>Administrative Cost (5%):</span> <strong id="res-admin" class="font-mono" style="color: var(--text-muted);">₹0</strong></div>
                            <div style="display:flex; justify-content: space-between; margin-top: 16px; padding-top: 14px; border-top: 1px dashed var(--border-subtle); font-size: 1.15rem; font-weight: 800; color: var(--text-primary);"><span>FINAL SANCTIONED AWARD:</span> <strong id="res-total" class="font-mono" style="color: var(--accent-emerald);">₹0</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.initData();
    },

    initData: function() {
        this.renderTable();
        this.updateKPISummary();
    },

    updateKPISummary: function() {
        const finances = window.AppData?.finances || [];
        let totalVal = 0;
        let paidVal = 0;
        let pendingCount = 0;

        finances.forEach(f => {
            totalVal += f.totalAward || 0;
            paidVal += f.paidAmount || 0;
            if (f.paymentStatus !== 'completed') pendingCount++;
        });

        const budgetEl = document.getElementById('fin-budget');
        const disbEl = document.getElementById('fin-disbursed');
        const pendEl = document.getElementById('fin-pending');
        const avgEl = document.getElementById('fin-avg');

        if (budgetEl) budgetEl.textContent = `₹${(totalVal / 100).toFixed(2)} Cr`;
        if (disbEl) disbEl.textContent = `₹${(paidVal / 100).toFixed(2)} Cr`;
        if (pendEl) pendEl.textContent = `${pendingCount} Cases`;
        if (avgEl) avgEl.textContent = `₹48.50 L/ha`;
    },

    switchTab: function(tab, evt) {
        document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        
        const targetTab = document.getElementById('tab-' + tab);
        if (targetTab) targetTab.style.display = 'block';
        if (evt && evt.currentTarget) evt.currentTarget.classList.add('active');
        
        if (tab === 'charts') {
            setTimeout(() => this.renderCharts(), 50);
        }
    },

    renderTable: function(filterTerm = '') {
        const container = document.getElementById('finance-table-container');
        if (!container) return;

        let finances = window.AppData?.finances || [];
        if (filterTerm) {
            const term = filterTerm.toLowerCase().trim();
            finances = finances.filter(f => f.parcelId.toLowerCase().includes(term) || (f.paymentMethod || '').toLowerCase().includes(term));
        }

        let html = `
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Parcel ID</th>
                            <th>Land Value (₹ Lakhs)</th>
                            <th>100% Solatium</th>
                            <th>Total Award (Lakhs)</th>
                            <th>Paid Amount</th>
                            <th>PFMS / DBT Status</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        finances.forEach(f => {
            const statusClass = f.paymentStatus === 'completed' ? 'badge-success' : (f.paymentStatus === 'in-progress' ? 'badge-warning' : 'badge-danger');
            html += `<tr>
                <td style="font-weight: 800; color: var(--secondary-accent);" class="font-mono">${f.parcelId}</td>
                <td style="font-family: monospace; text-align: right;">₹${(f.landMarketValue || 0).toLocaleString('en-IN')} L</td>
                <td style="font-family: monospace; text-align: right; color: var(--accent-cyan);">₹${(f.solatium || 0).toLocaleString('en-IN')} L</td>
                <td style="font-family: monospace; text-align: right; color: var(--text-primary); font-weight: 800;">₹${(f.totalAward || 0).toLocaleString('en-IN')} L</td>
                <td style="font-family: monospace; text-align: right; color: var(--accent-emerald);">₹${(f.paidAmount || 0).toLocaleString('en-IN')} L</td>
                <td><span class="badge ${statusClass}">${f.paymentStatus} (${f.paymentMethod || 'RTGS'})</span></td>
            </tr>`;
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
    },

    renderCharts: function() {
        if (!window.Chart) return;
        const bCtx = document.getElementById('budgetAllocationChart')?.getContext('2d');
        const sCtx = document.getElementById('stateExpenditureChart')?.getContext('2d');

        if (bCtx) {
            new Chart(bCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Land Value', '100% Solatium', 'R&R Package', 'Admin Charges'],
                    datasets: [{
                        data: [45, 40, 10, 5],
                        backgroundColor: ['#a855f7', '#06b6d4', '#10b981', '#f59e0b'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
                }
            });
        }

        if (sCtx) {
            new Chart(sCtx, {
                type: 'bar',
                data: {
                    labels: ['Maharashtra', 'Gujarat', 'Rajasthan', 'Tamil Nadu', 'Uttar Pradesh'],
                    datasets: [{
                        label: 'Disbursed (₹ Cr)',
                        data: [120, 95, 80, 60, 53.5],
                        backgroundColor: '#6366f1',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                    }
                }
            });
        }
    },

    calculate: function() {
        const area = parseFloat(document.getElementById('calc-area').value) || 0;
        const rate = parseFloat(document.getElementById('calc-rate').value) || 0;
        const loc = document.getElementById('calc-location').value;

        const landVal = area * rate;
        const solatium = landVal; // 100%
        const addComp = loc === 'rural' ? landVal * 1.0 : 0;
        const rr = landVal * 0.15;
        const admin = landVal * 0.05;
        const total = landVal + solatium + addComp + rr + admin;

        document.getElementById('res-land').textContent = '₹' + landVal.toLocaleString('en-IN');
        document.getElementById('res-solatium').textContent = '₹' + solatium.toLocaleString('en-IN');
        document.getElementById('res-add').textContent = '₹' + addComp.toLocaleString('en-IN');
        document.getElementById('res-rr').textContent = '₹' + rr.toLocaleString('en-IN');
        document.getElementById('res-admin').textContent = '₹' + admin.toLocaleString('en-IN');
        document.getElementById('res-total').textContent = '₹' + total.toLocaleString('en-IN');

        document.getElementById('calc-result').style.display = 'block';
    },

    resetCalc: function() {
        document.getElementById('calc-area').value = '2.5';
        document.getElementById('calc-rate').value = '4500000';
        document.getElementById('calc-result').style.display = 'none';
    }
};
window.Finance = Finance;

