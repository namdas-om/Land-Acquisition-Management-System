window.Auth = {
  // Current user state (null when unauthenticated / logged out)
  currentUser: null,

  // Available Demo Govt Profiles
  demoOfficials: [
    { name: 'Rajesh V. Sharma (IAS)', title: 'District Collector', dept: 'Collectorate, Pune', id: 'GOV-MH-8821', avatar: 'RS' },
    { name: 'Dr. Ananya Deshmukh', title: 'Nodal Land Acquisition Officer', dept: 'NHAI Regional Division', id: 'GOV-NHAI-409', avatar: 'AD' },
    { name: 'Sanjay Kumar Verma', title: 'Special Executive Engineer', dept: 'Railway Land Development Auth', id: 'GOV-RLDA-102', avatar: 'SV' }
  ],

  // Available Demo Citizen Profiles
  demoCitizens: [
    { name: 'Ramesh S. Patil', mobile: '+91 98234 56789', parcelId: 'LA-MH-PUN-001', district: 'Pune, Maharashtra', awardAmount: '₹ 45,50,000', avatar: 'RP' },
    { name: 'Sunita Devi Patel', mobile: '+91 94123 88765', parcelId: 'LA-GJ-AMD-004', district: 'Ahmedabad, Gujarat', awardAmount: '₹ 38,20,000', avatar: 'SP' },
    { name: 'Gurpreet Singh', mobile: '+91 98140 12345', parcelId: 'LA-PB-ASR-012', district: 'Amritsar, Punjab', awardAmount: '₹ 62,10,000', avatar: 'GS' }
  ],

  activeTab: 'official',
  _dropdownCloseHandler: null,

  init() {
    this.renderHeaderWidget();
    this.setupAuthModal();
  },

  showModal() {
    this.openAuthModal();
  },

  closeAuthPage() {
    this.closeAuthModal();
    this.removeProfileDropdown();
    if (window.App && typeof App.navigateTo === 'function') {
      App.navigateTo('dashboard');
    }
    if (window.App && window.App.showToast) {
      App.showToast('Closed Authentication. Accessing NLAMS in Guest Mode.', 'info');
    }
  },

  // Render hyper-polished profile button in top-right header column
  renderHeaderWidget() {
    const headerRight = document.querySelector('.top-header .header-right');
    if (!headerRight) return;

    let profileBtn = document.getElementById('user-profile-btn');
    if (!profileBtn) {
      profileBtn = document.createElement('button');
      profileBtn.id = 'user-profile-btn';
      profileBtn.className = 'user-profile-btn';
      
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        headerRight.insertBefore(profileBtn, themeToggle);
      } else {
        headerRight.appendChild(profileBtn);
      }
    }

    const isLoggedIn = !!this.currentUser;

    if (!isLoggedIn) {
      profileBtn.innerHTML = `
        <div class="user-avatar" style="background: rgba(168, 85, 247, 0.15) !important; color: var(--secondary-accent) !important; border-color: rgba(168, 85, 247, 0.3) !important;">
          <i data-lucide="shield-alert" style="width: 15px; height: 15px;"></i>
        </div>
        <div class="user-info-text">
          <span class="user-name">Guest / Unauthenticated</span>
          <span class="user-role-badge" style="color: var(--text-muted);">Click to Sign In</span>
        </div>
        <i data-lucide="chevron-down" style="width: 14px; height: 14px; color: var(--text-muted); margin-left: 2px;"></i>
      `;
    } else {
      const isOfficial = this.currentUser.role === 'official';
      const roleLabel = isOfficial ? 'Govt Official' : 'Citizen / Landowner';

      profileBtn.innerHTML = `
        <div style="position: relative;">
          <div class="user-avatar">
            ${this.currentUser.avatar}
          </div>
          <div style="position: absolute; bottom: -1px; right: -1px; width: 9px; height: 9px; border-radius: 50%; background: var(--accent-emerald); border: 2px solid var(--bg-primary); box-shadow: 0 0 6px var(--accent-emerald);"></div>
        </div>
        <div class="user-info-text">
          <span class="user-name">${this.currentUser.name}</span>
          <span class="user-role-badge">${roleLabel}</span>
        </div>
        <i data-lucide="chevron-down" style="width: 14px; height: 14px; color: var(--text-muted); margin-left: 2px;"></i>
      `;
    }

    // Also update sidebar footer user info if present
    const sbAvatar = document.getElementById('sidebar-user-avatar');
    const sbName = document.getElementById('sidebar-user-name');
    const sbRole = document.getElementById('sidebar-user-role');
    const sbLogoutBtn = document.querySelector('#sidebarFooter .btn-danger');

    if (sbAvatar) sbAvatar.innerHTML = `<span>${isLoggedIn ? this.currentUser.avatar : '?'}</span>`;
    if (sbName) sbName.textContent = isLoggedIn ? this.currentUser.name : 'Not Logged In';
    if (sbRole) sbRole.textContent = isLoggedIn ? (this.currentUser.title || 'Authenticated User') : 'Guest Access';
    if (sbLogoutBtn) {
      if (isLoggedIn) {
        sbLogoutBtn.style.display = 'inline-flex';
      } else {
        sbLogoutBtn.style.display = 'none';
      }
    }

    if (window.lucide) lucide.createIcons();

    profileBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleProfileDropdown();
    };
  },

  // Toggle Top-Right Profile Column Dropdown Menu
  toggleProfileDropdown() {
    const existing = document.getElementById('profile-dropdown-menu');
    if (existing) {
      this.removeProfileDropdown();
      return;
    }

    const profileBtn = document.getElementById('user-profile-btn');
    if (!profileBtn) return;

    const btnRect = profileBtn.getBoundingClientRect();
    const isLoggedIn = !!this.currentUser;

    const dropdown = document.createElement('div');
    dropdown.id = 'profile-dropdown-menu';
    dropdown.className = 'profile-dropdown-menu';
    dropdown.style.cssText = `
      position: fixed;
      top: ${btnRect.bottom + 8}px;
      right: ${window.innerWidth - btnRect.right}px;
      width: 290px;
      background: var(--bg-glass);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-xl);
      padding: 18px;
      box-shadow: var(--shadow-float), var(--ring-inner);
      z-index: 999;
      animation: floatDriftUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    if (!isLoggedIn) {
      dropdown.innerHTML = `
        <div style="display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px solid var(--border-subtle);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="user-avatar" style="width: 42px; height: 42px; font-size: 1rem; background: rgba(168, 85, 247, 0.15) !important; color: var(--secondary-accent) !important;">
              <i data-lucide="shield-alert" style="width: 20px; height: 20px;"></i>
            </div>
            <div>
              <div style="font-weight: 800; font-size: 0.92rem; color: var(--text-primary);">Not Authenticated</div>
              <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">Please log in to access system</div>
            </div>
          </div>
          <button onclick="Auth.removeProfileDropdown()" style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); color: var(--text-muted); width: 26px; height: 26px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; line-height: 1;" title="Close Menu">&times;</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button class="btn btn-primary btn-sm" onclick="App.navigateTo('auth'); Auth.removeProfileDropdown();" style="justify-content: flex-start; text-align: left; width: 100%; box-shadow: var(--glow-button);">
            <i data-lucide="log-in" style="width: 14px; height: 14px;"></i> Open Login Page
          </button>
          <button class="btn btn-secondary btn-sm" onclick="Auth.openAuthModal(); Auth.removeProfileDropdown();" style="justify-content: flex-start; text-align: left; width: 100%;">
            <i data-lucide="shield-check" style="width: 14px; height: 14px;"></i> Authentication Modal
          </button>
        </div>
      `;
    } else {
      dropdown.innerHTML = `
        <div style="display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px solid var(--border-subtle);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="user-avatar" style="width: 42px; height: 42px; font-size: 1rem;">${this.currentUser.avatar}</div>
            <div>
              <div style="font-weight: 800; font-size: 0.92rem; color: var(--text-primary);">${this.currentUser.name}</div>
              <div style="font-size: 0.72rem; color: var(--secondary-accent); font-weight: 700;">${this.currentUser.title || 'Authenticated User'}</div>
              <div style="font-size: 0.68rem; color: var(--text-muted);" class="font-mono">${this.currentUser.id}</div>
            </div>
          </div>
          <button onclick="Auth.removeProfileDropdown()" style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); color: var(--text-muted); width: 26px; height: 26px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; line-height: 1;" title="Close Profile Menu">&times;</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button class="btn btn-secondary btn-sm" onclick="Auth.openAuthModal(); Auth.removeProfileDropdown();" style="justify-content: flex-start; text-align: left; width: 100%;">
            <i data-lucide="arrows-right-left" style="width: 14px; height: 14px;"></i> Switch Account / Portal
          </button>
          <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('auth'); Auth.removeProfileDropdown();" style="justify-content: flex-start; text-align: left; width: 100%;">
            <i data-lucide="shield-check" style="width: 14px; height: 14px;"></i> Authentication Portal Page
          </button>
          <button class="btn btn-danger btn-sm" onclick="Auth.logout();" style="justify-content: flex-start; text-align: left; width: 100%; margin-top: 4px; box-shadow: var(--shadow-sm);">
            <i data-lucide="log-out" style="width: 14px; height: 14px;"></i> Log Out
          </button>
        </div>
      `;
    }

    document.body.appendChild(dropdown);
    if (window.lucide) lucide.createIcons();

    // Close on outside click
    const outsideClickListener = (e) => {
      const drop = document.getElementById('profile-dropdown-menu');
      const btn = document.getElementById('user-profile-btn');
      if (drop && !drop.contains(e.target) && (!btn || !btn.contains(e.target))) {
        this.removeProfileDropdown();
      }
    };

    this._dropdownCloseHandler = outsideClickListener;
    setTimeout(() => {
      document.addEventListener('click', outsideClickListener);
    }, 20);
  },

  removeProfileDropdown() {
    const dropdown = document.getElementById('profile-dropdown-menu');
    if (dropdown) dropdown.remove();
    if (this._dropdownCloseHandler) {
      document.removeEventListener('click', this._dropdownCloseHandler);
      this._dropdownCloseHandler = null;
    }
  },

  redirectToDashboard(message, type = 'success') {
    this.closeAuthModal();
    this.removeProfileDropdown();
    this.renderHeaderWidget();
    window.location.hash = 'dashboard';
    if (window.App && typeof App.navigateTo === 'function') {
      App.navigateTo('dashboard', true);
    }
    if (window.App && window.App.showToast) {
      App.showToast(message, type);
    }
  },

  logout() {
    this.removeProfileDropdown();
    this.currentUser = null; // Reset to unauthenticated state
    this.renderHeaderWidget();
    window.location.hash = 'auth';
    if (window.App && typeof App.navigateTo === 'function') {
      App.navigateTo('auth', true);
    }
    if (window.App && window.App.showToast) {
      App.showToast('You have logged out. Redirected to Login Page.', 'info');
    }
  },

  // Render Full Clean Login Page on Canvas
  renderPage(container) {
    const isOfficial = this.activeTab === 'official';

    container.innerHTML = `
      <div class="auth-page-container stagger-1" style="max-width: 900px; margin: 20px auto; color: var(--text-primary); position: relative;">
        
        <!-- Header Hero Banner -->
        <div style="background: var(--bg-card); backdrop-filter: blur(28px); border: 1px solid var(--border-subtle); border-radius: var(--radius-xl); padding: 36px; margin-bottom: 28px; position: relative; overflow: hidden; box-shadow: var(--shadow-float), var(--ring-inner); text-align: center;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--gradient-edge);"></div>
          
          <!-- Top Right Close Button on Auth Page Banner -->
          <button type="button" onclick="Auth.closeAuthPage()" style="position: absolute; top: 16px; right: 16px; z-index: 10; width: 36px; height: 36px; border-radius: 50%; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" title="Close Authentication Page & Go to Dashboard" onmouseover="this.style.color='#fff'; this.style.background='rgba(244,63,94,0.3)';" onmouseout="this.style.color='var(--text-muted)'; this.style.background='var(--bg-tertiary)';">
            <i data-lucide="x" style="width: 20px; height: 20px;"></i>
          </button>

          <div class="govt-emblem-icon float-animate" style="width: 64px; height: 64px; border-radius: 20px; font-size: 1.8rem; margin-bottom: 16px;">
            <i data-lucide="shield-check" style="width: 32px; height: 32px;"></i>
          </div>

          <h1 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 10px; color: var(--text-primary); letter-spacing: -0.03em;">
            NLAMS Unified Portal Authentication
          </h1>
          <p style="font-size: 0.95rem; color: var(--text-secondary); max-width: 620px; margin: 0 auto 20px auto; line-height: 1.6;">
            Government of India &bull; Ministry of Revenue & Land Monitoring <br/>
            Secure Access Gateway under the LARR Act, 2013
          </p>
        </div>

        <!-- Main Auth Card -->
        <div class="glass-panel" style="background: var(--bg-card); backdrop-filter: blur(28px); border: 1px solid var(--border-subtle); border-radius: var(--radius-xl); padding: 0; box-shadow: var(--shadow-md); overflow: hidden;">
          
          <!-- Tab Switcher -->
          <div class="auth-tabs">
            <div class="auth-tab ${isOfficial ? 'active' : ''}" id="page-tab-official" onclick="Auth.switchPageTab('official')">
              <i data-lucide="building-2" style="width: 18px; height: 18px; display: inline-block; vertical-align: text-bottom; margin-right: 8px;"></i>
              Govt Official Portal (NIC Parichay SSO)
            </div>
            <div class="auth-tab ${!isOfficial ? 'active' : ''}" id="page-tab-citizen" onclick="Auth.switchPageTab('citizen')">
              <i data-lucide="user-check" style="width: 18px; height: 18px; display: inline-block; vertical-align: text-bottom; margin-right: 8px;"></i>
              Citizen / Landowner Compensation Portal
            </div>
          </div>

          <div style="padding: 32px;">
            
            <!-- Official Form View -->
            <form id="page-form-official" onsubmit="event.preventDefault(); Auth.submitOfficialLogin();" style="display: ${isOfficial ? 'block' : 'none'};">
              <div style="background: rgba(168, 85, 247, 0.1); border-left: 4px solid var(--secondary-accent); padding: 14px 18px; border-radius: 8px; font-size: 0.88rem; margin-bottom: 24px; color: var(--text-secondary);">
                <strong style="color: var(--text-primary);">Authorized Official Gateway:</strong> Single Sign-On via NIC Parichay, e-Office, or Land Revenue Officer ID credentials.
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group">
                  <label class="form-label">Govt Email / Employee ID</label>
                  <input type="text" id="page-off-email" class="form-input" placeholder="e.g. officer@nic.in">
                </div>

                <div class="form-group">
                  <label class="form-label">Department / Agency</label>
                  <select id="page-off-dept" class="form-select">
                    <option selected>Revenue Dept & Collectorate (LAO)</option>
                    <option>National Highways Authority of India (NHAI)</option>
                    <option>Ministry of Railways (DFCCIL)</option>
                    <option>State Urban Development Authority</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Security PIN / Password</label>
                <input type="password" class="form-input" placeholder="Enter secure PIN">
              </div>

              <button type="submit" class="btn btn-primary w-full" style="padding: 14px; font-size: 0.95rem; margin-top: 10px; box-shadow: var(--glow-button);">
                <i data-lucide="log-in"></i> Authenticate & Launch Dashboard
              </button>

              <div class="quick-demo-box">
                <div class="quick-demo-title">Select Instant Demo Official Profile:</div>
                <div class="demo-btn-group">
                  ${this.demoOfficials.map((o, idx) => `
                    <button type="button" class="btn btn-secondary" onclick="Auth.selectDemoOfficial(${idx})" style="padding: 10px 16px; font-size: 0.85rem;">
                      <i data-lucide="user-check" style="width: 14px; height: 14px; color: var(--secondary-accent);"></i> ${o.title} (${o.name.split(' ')[0]})
                    </button>
                  `).join('')}
                </div>
              </div>
            </form>

            <!-- Citizen Form View -->
            <form id="page-form-citizen" onsubmit="event.preventDefault(); Auth.submitCitizenLogin();" style="display: ${!isOfficial ? 'block' : 'none'};">
              <div style="background: rgba(6, 182, 212, 0.1); border-left: 4px solid var(--accent-cyan); padding: 14px 18px; border-radius: 8px; font-size: 0.88rem; margin-bottom: 24px; color: var(--text-secondary);">
                <strong style="color: var(--text-primary);">Public Landowner Portal:</strong> Check compensation awards, direct bank disbursement (DBT) transfer status, and file grievances under LARR Act 2013.
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group">
                  <label class="form-label">Aadhaar / Mobile Number</label>
                  <input type="text" id="page-cit-mobile" class="form-input" placeholder="e.g. 10-digit Mobile or 12-digit Aadhaar">
                </div>

                <div class="form-group">
                  <label class="form-label">Land Survey / Parcel ID</label>
                  <input type="text" id="page-cit-parcel" class="form-input" placeholder="e.g. LA-MH-PUN-001">
                </div>
              </div>

              <button type="submit" class="btn btn-primary w-full" style="padding: 14px; font-size: 0.95rem; margin-top: 10px; background: linear-gradient(135deg, #06b6d4, #10b981); border: none; box-shadow: 0 4px 20px rgba(6, 182, 212, 0.45);">
                <i data-lucide="shield-check"></i> Verify OTP & Launch Dashboard
              </button>

              <div class="quick-demo-box">
                <div class="quick-demo-title">Select Instant Demo Citizen Profile:</div>
                <div class="demo-btn-group">
                  ${this.demoCitizens.map((c, idx) => `
                    <button type="button" class="btn btn-secondary" onclick="Auth.selectDemoCitizen(${idx})" style="padding: 10px 16px; font-size: 0.85rem;">
                      <i data-lucide="heart" style="width: 14px; height: 14px; color: var(--accent-emerald);"></i> ${c.name} (${c.district.split(',')[0]})
                    </button>
                  `).join('')}
                </div>
              </div>
            </form>

            <!-- Bottom Close & Skip Section -->
            <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <span style="font-size: 0.82rem; color: var(--text-muted);">Want to explore system features first?</span>
              <button type="button" class="btn btn-secondary" onclick="Auth.closeAuthPage()" style="padding: 10px 18px; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
                <i data-lucide="x-circle" style="width: 15px; height: 15px; color: var(--accent-rose);"></i> Close Page & Continue as Guest
              </button>
            </div>

          </div>
        </div>

      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  switchPageTab(type) {
    this.activeTab = type;
    const offTab = document.getElementById('page-tab-official');
    const citTab = document.getElementById('page-tab-citizen');
    const offPanel = document.getElementById('page-form-official');
    const citPanel = document.getElementById('page-form-citizen');

    if (type === 'official') {
      if (offTab) offTab.classList.add('active');
      if (citTab) citTab.classList.remove('active');
      if (offPanel) offPanel.style.display = 'block';
      if (citPanel) citPanel.style.display = 'none';
    } else {
      if (citTab) citTab.classList.add('active');
      if (offTab) offTab.classList.remove('active');
      if (citPanel) citPanel.style.display = 'block';
      if (offPanel) offPanel.style.display = 'none';
    }
  },

  // Open modal selection
  openAuthModal() {
    let overlay = document.getElementById('auth-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'auth-modal-overlay';
      overlay.className = 'modal-overlay';
      document.body.appendChild(overlay);
    }

    overlay.onclick = (e) => {
      if (e.target === overlay) {
        this.closeAuthModal();
      }
    };

    const isOfficial = this.activeTab === 'official';

    overlay.innerHTML = `
      <div class="auth-modal" style="position: relative;">
        <!-- Top Right Close Button on Modal -->
        <button type="button" onclick="Auth.closeAuthModal()" style="position: absolute; top: 16px; right: 16px; z-index: 20; background: rgba(255, 255, 255, 0.08); border: 1px solid var(--border-subtle); color: var(--text-muted); width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" title="Close Modal" onmouseover="this.style.color='#fff'; this.style.background='rgba(244,63,94,0.3)';" onmouseout="this.style.color='var(--text-muted)'; this.style.background='rgba(255,255,255,0.08)';">
          <i data-lucide="x" style="width: 18px; height: 18px;"></i>
        </button>

        <div class="auth-header">
          <div class="govt-emblem-icon">
            <i data-lucide="shield-check" style="width: 28px; height: 28px;"></i>
          </div>
          <h3 style="margin-bottom: 4px; font-size: 1.35rem; font-weight: 800;">NLAMS Portal Authentication</h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;">Government of India | LARR Act 2013 Digital Monitoring</p>
        </div>

        <div class="auth-tabs">
          <div class="auth-tab ${isOfficial ? 'active' : ''}" id="tab-official" onclick="Auth.switchTab('official')">
            <i data-lucide="building-2" style="width: 16px; height: 16px; display: inline-block; vertical-align: text-bottom; margin-right: 6px;"></i>
            Govt Official Login
          </div>
          <div class="auth-tab ${!isOfficial ? 'active' : ''}" id="tab-citizen" onclick="Auth.switchTab('citizen')">
            <i data-lucide="user" style="width: 16px; height: 16px; display: inline-block; vertical-align: text-bottom; margin-right: 6px;"></i>
            Citizen / Landowner Portal
          </div>
        </div>

        <div class="auth-body">
          <!-- Official Form -->
          <form id="form-official-panel" onsubmit="event.preventDefault(); Auth.submitOfficialLogin();" style="display: ${isOfficial ? 'block' : 'none'};">
            <div style="background: rgba(168, 85, 247, 0.1); border-left: 3px solid var(--secondary-accent); padding: 10px 14px; border-radius: 6px; font-size: 0.8rem; margin-bottom: 16px; color: var(--text-secondary);">
              <strong>Authorized Access:</strong> Single Sign-On via NIC Parichay / Government Identity Provider.
            </div>
            
            <div class="form-group">
              <label class="form-label">Govt Email / Employee ID</label>
              <input type="text" id="off-email" class="form-input" placeholder="e.g. officer@nic.in">
            </div>

            <div class="form-group">
              <label class="form-label">Department</label>
              <select id="off-dept" class="form-select">
                <option selected>Revenue Dept & Collectorate (LAO)</option>
                <option>National Highways Authority of India (NHAI)</option>
                <option>Ministry of Railways (DFCCIL)</option>
                <option>State Urban Development Authority</option>
              </select>
            </div>

            <button type="submit" class="btn btn-primary w-full" style="box-shadow: var(--glow-button);">
              <i data-lucide="log-in" style="width: 16px; height: 16px;"></i> Login & Redirect to Dashboard
            </button>

            <div class="quick-demo-box">
              <div class="quick-demo-title">Quick Demo Govt Profiles:</div>
              <div class="demo-btn-group">
                ${this.demoOfficials.map((o, idx) => `
                  <button type="button" class="btn btn-secondary btn-sm" onclick="Auth.selectDemoOfficial(${idx})">
                    ${o.title} (${o.name.split(' ')[0]})
                  </button>
                `).join('')}
              </div>
            </div>
          </form>

          <!-- Citizen Form -->
          <form id="form-citizen-panel" onsubmit="event.preventDefault(); Auth.submitCitizenLogin();" style="display: ${!isOfficial ? 'block' : 'none'};">
            <div style="background: rgba(6, 182, 212, 0.1); border-left: 3px solid var(--accent-cyan); padding: 10px 14px; border-radius: 6px; font-size: 0.8rem; margin-bottom: 16px; color: var(--text-secondary);">
              <strong>Public Landowner Portal:</strong> Check compensation award, DBT payout status & file grievances under LARR 2013.
            </div>

            <div class="form-group">
              <label class="form-label">Aadhaar / Registered Mobile Number</label>
              <input type="text" id="cit-mobile" class="form-input" placeholder="e.g. 10-digit Mobile or 12-digit Aadhaar">
            </div>

            <div class="form-group">
              <label class="form-label">Land Survey / Parcel ID (Optional)</label>
              <input type="text" id="cit-parcel" class="form-input" placeholder="e.g. LA-MH-PUN-001">
            </div>

            <button type="submit" class="btn btn-primary w-full" style="background: linear-gradient(135deg, #06b6d4, #10b981); border: none;">
              <i data-lucide="shield-check" style="width: 16px; height: 16px;"></i> Verify OTP & Launch Dashboard
            </button>

            <div class="quick-demo-box">
              <div class="quick-demo-title">Quick Demo Citizen Profiles:</div>
              <div class="demo-btn-group">
                ${this.demoCitizens.map((c, idx) => `
                  <button type="button" class="btn btn-secondary btn-sm" onclick="Auth.selectDemoCitizen(${idx})">
                    ${c.name} (${c.district.split(',')[0]})
                  </button>
                `).join('')}
              </div>
            </div>
          </form>
        </div>

        <div style="background: rgba(0, 0, 0, 0.3); padding: 14px 24px; text-align: right; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.78rem; color: var(--text-muted);">LARR Act 2013 Digital Gateway</span>
          <button type="button" class="btn btn-secondary btn-sm" onclick="Auth.closeAuthModal()">
            <i data-lucide="x" style="width: 14px; height: 14px; display: inline-block; vertical-align: text-bottom;"></i> Close Window
          </button>
        </div>
      </div>
    `;

    overlay.classList.add('active');
    if (window.lucide) lucide.createIcons();
  },

  switchTab(type) {
    this.activeTab = type;
    const offTab = document.getElementById('tab-official');
    const citTab = document.getElementById('tab-citizen');
    const offPanel = document.getElementById('form-official-panel');
    const citPanel = document.getElementById('form-citizen-panel');

    if (type === 'official') {
      if (offTab) offTab.classList.add('active');
      if (citTab) citTab.classList.remove('active');
      if (offPanel) offPanel.style.display = 'block';
      if (citPanel) citPanel.style.display = 'none';
    } else {
      if (citTab) citTab.classList.add('active');
      if (offTab) offTab.classList.remove('active');
      if (citPanel) citPanel.style.display = 'block';
      if (offPanel) offPanel.style.display = 'none';
    }
  },

  selectDemoOfficial(idx) {
    const prof = this.demoOfficials[idx];
    this.currentUser = {
      role: 'official',
      ...prof
    };
    this.redirectToDashboard(`Logged in as Official: ${prof.name} (${prof.title})`, 'success');
  },

  selectDemoCitizen(idx) {
    const cit = this.demoCitizens[idx];
    this.currentUser = {
      role: 'citizen',
      title: 'Landowner / Citizen',
      dept: 'Public Land Acquisition Portal',
      id: cit.parcelId,
      ...cit
    };
    this.redirectToDashboard(`Logged in as Citizen: ${cit.name} (Parcel ${cit.parcelId})`, 'success');
  },

  submitOfficialLogin() {
    const emailInput = document.getElementById('off-email')?.value || document.getElementById('page-off-email')?.value;
    const email = emailInput && emailInput.trim() ? emailInput.trim() : 'officer@nic.in';
    const namePart = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').toUpperCase();
    const name = namePart.length >= 3 ? namePart : 'RAJESH V. SHARMA (IAS)';
    
    this.currentUser = {
      role: 'official',
      name: name,
      title: 'Land Acquisition Officer',
      dept: 'Department of Revenue & Land Records',
      id: 'GOV-SSO-9912',
      avatar: name.split(' ').map(n => n[0]).join('').slice(0, 2) || 'GO'
    };
    this.redirectToDashboard(`Authenticated via NIC Parichay SSO: Welcome ${this.currentUser.name}`, 'success');
  },

  submitCitizenLogin() {
    const mobileInput = document.getElementById('cit-mobile')?.value || document.getElementById('page-cit-mobile')?.value;
    const parcelInput = document.getElementById('cit-parcel')?.value || document.getElementById('page-cit-parcel')?.value;
    
    this.currentUser = {
      role: 'citizen',
      name: 'Ramesh S. Patil',
      title: 'Landowner / Citizen',
      dept: 'Public Citizen Portal',
      mobile: mobileInput || '+91 98234 56789',
      parcelId: parcelInput || 'LA-MH-PUN-001',
      id: parcelInput || 'LA-MH-PUN-001',
      avatar: 'RP'
    };
    this.redirectToDashboard(`OTP Verified! Welcome to Citizen Portal, ${this.currentUser.name}`, 'success');
  },

  closeAuthModal() {
    const overlay = document.getElementById('auth-modal-overlay');
    if (overlay) overlay.classList.remove('active');
    if (window.App && App.currentModule === 'auth') {
      App.navigateTo('dashboard');
    }
  },

  setupAuthModal() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAuthModal();
        this.removeProfileDropdown();
      }
    });
  }
};

