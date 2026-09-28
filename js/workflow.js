window.Workflow = {
    stages: [
        { id: 'stage-1', name: 'Preliminary Survey' },
        { id: 'stage-2', name: 'Notification Sec.11' },
        { id: 'stage-3', name: 'Survey & Objections' },
        { id: 'stage-4', name: 'Declaration Sec.19' },
        { id: 'stage-5', name: 'Negotiation & Award' },
        { id: 'stage-6', name: 'Compensation Payment' },
        { id: 'stage-7', name: 'Possession & Transfer' }
    ],

    render(container) {
        this.container = container;
        this.parcels = window.AppData?.parcels || [];
        // Assign dummy stages if not present
        this.parcels.forEach((p, i) => { if(!p.currentStage) p.currentStage = `stage-${(i % 7) + 1}`; });
        this.container.innerHTML = this.getHTML();
        this.attachDragEvents();
    },

    getHTML() {
        return `
            <div class="workflow-module" style="padding: 24px; color: var(--text-primary); font-family: inherit; height: calc(100vh - 80px); display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-shrink: 0;">
                    <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">Acquisition Pipeline</h2>
                </div>
                
                <!-- Stage Stats Bar -->
                <div style="display: flex; gap: 16px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 8px; flex-shrink: 0;">
                    ${this.stages.map(s => this.renderStatCard(s)).join('')}
                </div>

                <!-- Kanban Board -->
                <div style="display: flex; gap: 16px; overflow-x: auto; flex-grow: 1; padding-bottom: 20px;">
                    ${this.stages.map(s => this.renderColumn(s)).join('')}
                </div>
            </div>
        `;
    },

    renderStatCard(stage) {
        const count = this.parcels.filter(p => p.currentStage === stage.id).length;
        return `
            <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-top: 3px solid var(--text-primary); border-radius: 8px; padding: 12px 20px; min-width: 160px;">
                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px; white-space: nowrap; font-weight: 500;">${stage.name}</div>
                <div style="font-size: 20px; font-weight: 700; color: var(--text-primary);">${count} <span style="font-size:12px; font-weight:normal; color: var(--text-muted);">Parcels</span></div>
            </div>
        `;
    },

    renderColumn(stage) {
        const stageParcels = this.parcels.filter(p => p.currentStage === stage.id);
        return `
            <div class="kanban-column" data-stage-id="${stage.id}" style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; min-width: 300px; width: 300px; display: flex; flex-direction: column;">
                <div style="padding: 16px; border-bottom: 2px solid var(--border-strong); display: flex; justify-content: space-between; align-items: center; background: var(--bg-tertiary); border-radius: 12px 12px 0 0;">
                    <h3 style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0;">${stage.name}</h3>
                    <span style="background: var(--bg-primary); color: var(--text-primary); padding: 2px 8px; border-radius: 12px; font-size: 12px; border: 1px solid var(--border-subtle); font-weight: 600;">${stageParcels.length}</span>
                </div>
                <div class="kanban-dropzone" style="padding: 12px; flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px;">
                    ${stageParcels.map(p => this.renderCard(p)).join('')}
                </div>
            </div>
        `;
    },

    renderCard(parcel) {
        return `
            <div class="kanban-card" draggable="true" data-parcel-id="${parcel.id}" style="background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 16px; cursor: grab; transition: transform 0.2s, box-shadow 0.2s;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
                    <span style="font-weight: 700; color: var(--text-primary); font-size: 14px;">${parcel.id}</span>
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--text-primary);"></span>
                </div>
                <div style="font-size: 13px; color: var(--text-primary); margin-bottom: 4px; font-weight: 500;">Owner ID: ${parcel.ownerId || 'N/A'}</div>
                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">${parcel.village}, ${parcel.district} • ${parcel.area} ha</div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 11px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); padding: 2px 6px; border-radius: 4px; color: var(--text-muted);">14 days in stage</span>
                    <span style="font-size: 11px; color: var(--text-primary); border: 1px solid var(--border-strong); padding: 2px 6px; border-radius: 10px; font-weight: 500;">${parcel.status || 'Active'}</span>
                </div>
            </div>
        `;
    },

    attachDragEvents() {
        const cards = this.container.querySelectorAll('.kanban-card');
        const columns = this.container.querySelectorAll('.kanban-column');

        cards.forEach(card => {
            card.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', card.dataset.parcelId);
                card.style.opacity = '0.5';
            });
            card.addEventListener('dragend', () => {
                card.style.opacity = '1';
                columns.forEach(c => c.style.background = 'var(--bg-secondary)');
            });
        });

        columns.forEach(col => {
            col.addEventListener('dragover', e => {
                e.preventDefault();
                col.style.background = 'var(--bg-tertiary)';
            });
            col.addEventListener('dragleave', () => {
                col.style.background = 'var(--bg-secondary)';
            });
            col.addEventListener('drop', e => {
                e.preventDefault();
                col.style.background = 'var(--bg-secondary)';
                const parcelId = e.dataTransfer.getData('text/plain');
                const newStageId = col.dataset.stageId;
                
                const parcel = this.parcels.find(p => p.id === parcelId);
                if(parcel && parcel.currentStage !== newStageId) {
                    parcel.currentStage = newStageId;
                    if(window.App && window.App.showToast) window.App.showToast(`Parcel ${parcelId} moved to new stage`, 'success');
                    this.render(this.container);
                }
            });
        });
    }
};
