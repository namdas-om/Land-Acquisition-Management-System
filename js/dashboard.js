window.Dashboard = {
    render(container) {
        this.container = container;
        this.container.innerHTML = this.getHTML();
        this.initCharts();
        this.animateKPIs();
        if (window.lucide) window.lucide.createIcons();
    },

    getHTML() {
        const stats = window.AppData?.stats || {};
        const activities = window.AppData?.activityLog || [];

        return `
            <div class="dashboard-module" style="color: var(--text-primary); font-family: inherit;">
                
                <!-- Anti-Gravity Kinetic Hero Canvas & Flanking HUD Modules -->
                <div class="hero-banner stagger-1" style="background: var(--bg-card); backdrop-filter: blur(24px); border: 1px solid var(--border-subtle); border-radius: var(--radius-xl); padding: 32px; margin-bottom: 32px; position: relative; overflow: hidden; box-shadow: var(--shadow-float), var(--ring-inner);">
                    
                    <!-- Ambient Radial Mesh Illumination -->
                    <div style="position: absolute; top: -80px; right: -80px; width: 450px; height: 450px; background: radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, rgba(99, 102, 241, 0.1) 45%, transparent 70%); pointer-events: none; border-radius: 50%; filter: blur(30px);"></div>
                    <div style="position: absolute; bottom: -60px; left: 10%; width: 350px; height: 350px; background: radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, transparent 65%); pointer-events: none; filter: blur(25px);"></div>

                    <!-- Glowing Edge Highlight -->
                    <div style="position: absolute; top: 0; left: 0; right: 0; height: 1px; background: var(--gradient-edge);"></div>

                    <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 28px; position: relative; z-index: 2; align-items: center;">
                        
                        <!-- Main Core Text & Call To Action -->
                        <div>
                            <div class="badge badge-info float-animate" style="margin-bottom: 16px; padding: 6px 14px; font-size: 0.75rem; letter-spacing: 0.08em; background: rgba(168, 85, 247, 0.12); border-color: rgba(168, 85, 247, 0.35); color: var(--secondary-accent); box-shadow: 0 0 16px rgba(168, 85, 247, 0.25);">
                                ✨ REAL-TIME DIGITAL MONITORING & DECISION SUPPORT SYSTEM
                            </div>
                            
                            <h1 style="font-size: 2.4rem; font-weight: 800; line-height: 1.2; margin-bottom: 14px; color: var(--text-primary); letter-spacing: -0.03em;">
                                National Land Acquisition <br/>& Management System
                            </h1>

                            <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px; max-width: 680px;">
                                End-to-end digital monitoring under LARR Act 2013. Streamlining land parcel verification, automated financial disbursements, interactive GIS mapping, and legal compliance tracking.
                            </p>

                            <!-- Primary Control Action Buttons -->
                            <div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: center; margin-bottom: 28px;">
                                <button class="btn btn-primary" onclick="if(window.Parcels) Parcels.openModal();" style="padding: 12px 24px; font-size: 0.88rem; box-shadow: var(--glow-button);">
                                    <i data-lucide="plus-circle"></i> Add New Parcel
                                </button>
                                <button class="btn btn-secondary" onclick="App.navigateTo('map')" style="padding: 12px 24px; font-size: 0.88rem;">
                                    <i data-lucide="globe-2"></i> Launch Live GIS Map
                                </button>
                                <button class="btn btn-secondary" onclick="if(window.Auth) Auth.showModal();" style="padding: 12px 24px; font-size: 0.88rem;">
                                    <i data-lucide="shield-check"></i> Official Access
                                </button>
                            </div>

                            <!-- Live Quick Metrics Footer -->
                            <div style="display: flex; gap: 24px; flex-wrap: wrap; border-top: 1px solid var(--border-subtle); padding-top: 20px;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div style="width: 10px; height: 10px; border-radius: 50%; background: var(--accent-emerald); box-shadow: 0 0 10px var(--accent-emerald);"></div>
                                    <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;"><strong style="color: var(--text-primary);" class="font-mono">99.4%</strong> DBT Transfer Success</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div style="width: 10px; height: 10px; border-radius: 50%; background: var(--secondary-accent); box-shadow: 0 0 10px var(--secondary-accent);"></div>
                                    <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;"><strong style="color: var(--text-primary);" class="font-mono">1,240+</strong> Parcels Tracked</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div style="width: 10px; height: 10px; border-radius: 50%; background: var(--accent-amber); box-shadow: 0 0 10px var(--accent-amber);"></div>
                                    <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;"><strong style="color: var(--text-primary);">LARR 2013</strong> Compliance</span>
                                </div>
                            </div>
                        </div>

                        <!-- Flanking Secondary HUD Kinetic Stat Modules -->
                        <div style="display: flex; flex-direction: column; gap: 14px;">
                            
                            <!-- Floating HUD Card 1: Disbursement Velocity -->
                            <div class="kpi-card float-animate-delay" style="background: rgba(15, 18, 28, 0.7); backdrop-filter: blur(20px); border: 1px solid var(--border-strong); padding: 18px; border-radius: var(--radius-lg); box-shadow: var(--shadow-md);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                    <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); font-weight: 700;">DBT Disbursement Velocity</span>
                                    <span class="badge badge-success" style="font-size: 0.65rem;">Optimum</span>
                                </div>
                                <div style="display: flex; align-items: baseline; justify-content: space-between;">
                                    <div style="font-size: 1.6rem; font-weight: 800; color: var(--text-primary);" class="font-mono">₹482.5 Cr</div>
                                    <svg width="80" height="24" viewBox="0 0 80 24" fill="none">
                                        <path d="M2 18L18 14L34 20L50 8L66 12L78 2" stroke="url(#sparkGradient1)" stroke-width="2.5" stroke-linecap="round"/>
                                        <defs>
                                            <linearGradient id="sparkGradient1" x1="0" y1="0" x2="80" y2="0">
                                                <stop offset="0%" stop-color="#10b981"/>
                                                <stop offset="100%" stop-color="#06b6d4"/>
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <!-- Glowing Progress Bar -->
                                <div style="margin-top: 12px; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; position: relative;">
                                    <div style="width: 82%; height: 100%; background: var(--gradient-brand); border-radius: 3px; box-shadow: 0 0 12px rgba(168, 85, 247, 0.6);"></div>
                                </div>
                            </div>

                            <!-- Floating HUD Card 2: AI Land Verification -->
                            <div class="kpi-card float-animate" style="background: rgba(15, 18, 28, 0.7); backdrop-filter: blur(20px); border: 1px solid var(--border-strong); padding: 18px; border-radius: var(--radius-lg); box-shadow: var(--shadow-md);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                    <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); font-weight: 700;">GIS Boundary Verification</span>
                                    <span class="badge badge-info" style="font-size: 0.65rem;">98.8% Clear</span>
                                </div>
                                <div style="display: flex; align-items: baseline; justify-content: space-between;">
                                    <div style="font-size: 1.6rem; font-weight: 800; color: var(--text-primary);" class="font-mono">8,420 Ha</div>
                                    <svg width="80" height="24" viewBox="0 0 80 24" fill="none">
                                        <path d="M2 20L20 12L38 16L54 6L68 10L78 4" stroke="url(#sparkGradient2)" stroke-width="2.5" stroke-linecap="round"/>
                                        <defs>
                                            <linearGradient id="sparkGradient2" x1="0" y1="0" x2="80" y2="0">
                                                <stop offset="0%" stop-color="#a855f7"/>
                                                <stop offset="100%" stop-color="#6366f1"/>
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <div style="margin-top: 12px; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; position: relative;">
                                    <div style="width: 94%; height: 100%; background: linear-gradient(90deg, #6366f1, #06b6d4); border-radius: 3px; box-shadow: 0 0 12px rgba(6, 182, 212, 0.6);"></div>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -0.02em;">Key Performance Indicators</h2>
                    <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">LIVE SYSTEM ANALYTICS</span>
                </div>
                
                <!-- KPI Cards Grid (Anti-Gravity Floating Stagger) -->
                <div class="stagger-2" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 32px;">
                    ${this.createKPICard('Total Parcels', stats.totalParcels || 0, '+12%', 'map-pin', 'var(--secondary-accent)')}
                    ${this.createKPICard('In Progress', stats.inProgress || 0, '+5%', 'clock', 'var(--accent-amber)')}
                    ${this.createKPICard('Completed Transfers', stats.completed || 0, '+8%', 'check-circle', 'var(--accent-emerald)')}
                    ${this.createKPICard('Total Compensation', (stats.totalCompensation || 0), '+2%', 'indian-rupee', 'var(--accent-cyan)', true)}
                    ${this.createKPICard('Avg. Processing Days', stats.avgProcessingDays || 0, '-4%', 'calendar', 'var(--primary-accent)')}
                    ${this.createKPICard('Pending Approvals', stats.pendingApprovals || 0, '+1%', 'alert-circle', 'var(--accent-amber)')}
                    ${this.createKPICard('Overdue Cases', stats.overdueCases || 0, '-10%', 'alert-triangle', 'var(--accent-rose)')}
                    ${this.createKPICard('Budget Utilization', stats.budgetUtilization || 0, '+15%', 'pie-chart', 'var(--secondary-accent)', false, true)}
                </div>

                <!-- Charts Section with Glassmorphism Panels -->
                <div class="stagger-3" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(440px, 1fr)); gap: 24px; margin-bottom: 32px;">
                    ${this.createChartCard('Acquisition Pipeline Stage Breakdown', 'pipelineChart')}
                    ${this.createChartCard('Monthly Acquisition Progress (Hectares)', 'progressChart')}
                    ${this.createChartCard('State-wise Distribution', 'stateChart')}
                    ${this.createChartCard('Quarterly Compensation Breakdown', 'compensationChart')}
                </div>

                <!-- Recent Activity Feed Glass Panel -->
                <div class="glass-panel stagger-4" style="background: var(--bg-card); backdrop-filter: blur(24px); border: 1px solid var(--border-subtle); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-md);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 14px;">
                        <h3 style="font-size: 1.1rem; margin: 0; color: var(--text-primary); font-weight: 700;">Recent Acquisition Activity</h3>
                        <span class="badge badge-neutral">REALTIME FEED</span>
                    </div>
                    <div style="max-height: 420px; overflow-y: auto; padding-right: 8px;">
                        ${activities.slice(0, 15).map(act => this.createActivityItem(act)).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    createKPICard(label, value, trend, icon, color, isCurrency = false, isPercentage = false) {
        let displayValue = value;
        if (isCurrency) displayValue = `₹${(value / 10000000).toFixed(1)} Cr`;
        else if (isPercentage) displayValue = `${value}%`;

        return `
            <div class="kpi-card kinetic-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
                    <div class="kpi-label">${label}</div>
                    <div class="kpi-icon-wrapper" style="background: rgba(168, 85, 247, 0.1); border-color: rgba(168, 85, 247, 0.25); color: ${color};">
                        <i data-lucide="${icon}"></i>
                    </div>
                </div>
                <div class="kpi-value font-mono" data-value="${value}" data-currency="${isCurrency}" data-percentage="${isPercentage}">${displayValue}</div>
                <div style="font-size: 12px; color: ${trend.startsWith('+') ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; font-weight: 600; display: flex; align-items: center; gap: 4px; margin-top: 8px;">
                    <span>${trend.startsWith('+') ? '↑' : '↓'} ${trend}</span> <span style="color: var(--text-muted); font-weight: 400;">vs last month</span>
                </div>
            </div>
        `;
    },

    createChartCard(title, canvasId) {
        return `
            <div class="glass-panel kinetic-card" style="background: var(--bg-card); backdrop-filter: blur(24px); border: 1px solid var(--border-subtle); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-md);">
                <h3 style="font-size: 1rem; margin-bottom: 18px; color: var(--text-primary); font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
                    <span>${title}</span>
                    <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-family: var(--font-mono);">LIVE DATA</span>
                </h3>
                <div style="position: relative; height: 300px; width: 100%;">
                    <canvas id="${canvasId}"></canvas>
                </div>
            </div>
        `;
    },

    createActivityItem(act) {
        const icons = {
            'parcel-added': { icon: 'map-pin', bg: 'rgba(168, 85, 247, 0.12)', color: 'var(--secondary-accent)' },
            'stage-change': { icon: 'arrow-right', bg: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-amber)' },
            'payment': { icon: 'indian-rupee', bg: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)' },
            'document-upload': { icon: 'file-text', bg: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary-accent)' },
            'approval': { icon: 'check-circle', bg: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent-cyan)' },
            'note-added': { icon: 'edit-3', bg: 'rgba(100, 116, 139, 0.12)', color: 'var(--text-muted)' }
        };
        const config = icons[act.type] || { icon: 'activity', bg: 'rgba(168, 85, 247, 0.12)', color: 'var(--secondary-accent)' };
        
        return `
            <div style="display: flex; gap: 16px; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid var(--border-subtle); align-items: flex-start;">
                <div style="width: 38px; height: 38px; border-radius: 10px; background: ${config.bg}; color: ${config.color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid var(--border-subtle); box-shadow: var(--ring-inner);">
                    <i data-lucide="${config.icon}" style="width: 18px; height: 18px;"></i>
                </div>
                <div style="flex-grow: 1;">
                    <div style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary);">${act.title}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">${act.description}</div>
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); white-space: nowrap; font-weight: 600; background: var(--bg-tertiary); padding: 4px 10px; border-radius: var(--radius-pill); border: 1px solid var(--border-subtle);" class="font-mono">${act.time}</div>
            </div>
        `;
    },

    initCharts() {
        if (!window.Chart) return;
        
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const textCol = isDark ? '#cbd5e1' : '#475569';
        const gridCol = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)';
        
        const palette = ['#a855f7', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

        // Pipeline Chart (Horizontal Bar with rounded corners)
        new Chart(document.getElementById('pipelineChart'), {
            type: 'bar',
            data: {
                labels: ['Preliminary', 'Notification', 'Survey', 'Declaration', 'Negotiation', 'Payment', 'Possession'],
                datasets: [{
                    label: 'Parcels',
                    data: [120, 90, 75, 60, 45, 30, 15],
                    backgroundColor: palette,
                    borderRadius: 8,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: gridCol }, ticks: { color: textCol, font: { family: 'JetBrains Mono, monospace' } } },
                    y: { grid: { display: false }, ticks: { color: textCol, font: { weight: '600' } } }
                }
            }
        });

        // Progress Line Chart with Neon Gradient Fill
        const ctxProgress = document.getElementById('progressChart').getContext('2d');
        const grad = ctxProgress.createLinearGradient(0, 0, 0, 300);
        grad.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
        grad.addColorStop(1, 'rgba(168, 85, 247, 0.0)');
        new Chart(ctxProgress, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Acquired Area (ha)',
                    data: [10, 25, 45, 60, 85, 110, 140, 165, 190, 220, 250, 280],
                    borderColor: '#a855f7',
                    borderWidth: 3,
                    backgroundColor: grad,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#a855f7',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: gridCol }, ticks: { color: textCol } },
                    y: { grid: { color: gridCol }, ticks: { color: textCol, font: { family: 'JetBrains Mono, monospace' } } }
                }
            }
        });

        // State Distribution Doughnut
        new Chart(document.getElementById('stateChart'), {
            type: 'doughnut',
            data: {
                labels: ['Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh'],
                datasets: [{
                    data: [35, 25, 20, 10, 10],
                    backgroundColor: palette.slice(0, 5),
                    borderColor: isDark ? '#06070b' : '#ffffff',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: textCol, font: { weight: '600', size: 12 }, padding: 16 }
                    }
                }
            }
        });

        // Compensation Breakdown Stacked Bar
        new Chart(document.getElementById('compensationChart'), {
            type: 'bar',
            data: {
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [
                    { label: 'Land Value', data: [40, 50, 60, 70], backgroundColor: '#a855f7', borderRadius: 4 },
                    { label: 'Solatium', data: [20, 25, 30, 35], backgroundColor: '#6366f1', borderRadius: 4 },
                    { label: 'R&R Support', data: [10, 15, 20, 25], backgroundColor: '#10b981', borderRadius: 4 },
                    { label: 'Admin Expenses', data: [5, 5, 5, 5], backgroundColor: '#f59e0b', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { stacked: true, grid: { color: gridCol }, ticks: { color: textCol } },
                    y: { stacked: true, grid: { color: gridCol }, ticks: { color: textCol, font: { family: 'JetBrains Mono, monospace' } } }
                },
                plugins: { legend: { labels: { color: textCol } } }
            }
        });
    },

    animateKPIs() {
        if(window.App && typeof window.App.animateCounter === 'function') {
            document.querySelectorAll('.kpi-value').forEach(el => {
                const target = parseFloat(el.getAttribute('data-value'));
                const isCurr = el.getAttribute('data-currency') === 'true';
                const isPct = el.getAttribute('data-percentage') === 'true';
                window.App.animateCounter(el, target, isCurr, isPct);
            });
        }
        if(window.lucide) window.lucide.createIcons();
    }
};
