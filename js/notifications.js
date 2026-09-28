const Notifications = {
    renderPanel: function() {
        // Implementation for slide-out drawer
        let panel = document.getElementById('notification-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'notification-panel';
            panel.className = 'glass-panel';
            panel.style.cssText = 'position:fixed; top:0; right:-400px; width:400px; height:100vh; background: var(--bg-primary); border-left: 1px solid var(--border-subtle); z-index:9999; transition: right 0.3s ease; padding: 24px; box-shadow: -5px 0 25px rgba(0,0,0,0.3); overflow-y:auto;';
            document.body.appendChild(panel);
        }

        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                <h3 style="margin:0; font-weight: 600; color: var(--text-primary);">Notifications</h3>
                <button class="btn btn-icon" onclick="Notifications.closePanel()" style="color: var(--text-primary); background: transparent; border: none; font-size: 16px; cursor: pointer;">✕</button>
            </div>
            <div class="filters" style="margin-bottom: 15px; display:flex; flex-wrap:wrap; gap:6px;">
                <span class="badge" style="cursor:pointer; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-subtle);">All</span>
                <span class="badge" style="cursor:pointer; background: var(--bg-secondary); color: var(--text-muted); border: 1px solid var(--border-subtle);">Deadlines</span>
            </div>
            <div id="notif-list">
                <!-- Mock list -->
                <div style="padding: 12px 14px; border-left: 3px solid var(--text-primary); background: var(--bg-secondary); margin-bottom: 10px; border-radius: 4px; border: 1px solid var(--border-subtle);">
                    <strong style="color: var(--text-primary); font-size: 14px;">New Survey Report Uploaded</strong><br>
                    <small style="color: var(--text-muted);">2 hours ago</small>
                </div>
                <div style="padding: 12px 14px; border-left: 3px solid var(--text-muted); background: var(--bg-secondary); margin-bottom: 10px; border-radius: 4px; border: 1px solid var(--border-subtle);">
                    <strong style="color: var(--text-primary); font-size: 14px;">Compensation Disbursement Initiated</strong><br>
                    <small style="color: var(--text-muted);">5 hours ago</small>
                </div>
            </div>
        `;
        
        setTimeout(() => { panel.style.right = '0'; }, 10);
    },

    closePanel: function() {
        const panel = document.getElementById('notification-panel');
        if (panel) {
            panel.style.right = '-400px';
        }
    },

    updateBellCount: function() {
        // Logic to update bell icon count
    },

    render: function(container) {
        container.innerHTML = `
            <div class="notifications-page" style="padding: 24px; color: var(--text-primary);">
                <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 24px; color: var(--text-primary);">Notifications & Alerts</h2>
                <div class="glass-panel" style="padding: 24px; min-height: 500px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 24px; gap: 16px; flex-wrap: wrap;">
                        <div style="display:flex; gap: 10px;">
                            <button class="btn btn-primary">Mark Selected Read</button>
                            <button class="btn btn-secondary">Delete Selected</button>
                        </div>
                        <input type="text" placeholder="Search notifications..." class="form-input" style="width: 250px;">
                    </div>
                    <div class="notif-full-list">
                        <div class="notif-group">
                            <h4 style="color: var(--text-muted); margin-bottom: 12px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Today</h4>
                            <div style="display:flex; align-items:center; gap: 14px; padding: 16px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 8px; margin-bottom: 12px;">
                                <input type="checkbox" style="accent-color: var(--text-primary);">
                                <div style="flex:1;">
                                    <strong style="color: var(--text-primary); font-size: 15px;">Hearing Scheduled: Parcel MH-P-1002</strong>
                                    <p style="margin:4px 0 0; color: var(--text-muted); font-size: 13px;">Scheduled for tomorrow at 10:00 AM in Collectorate Court 2.</p>
                                </div>
                                <span style="font-size: 12px; color: var(--text-muted); font-weight: 500;">10:30 AM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
window.Notifications = Notifications;
