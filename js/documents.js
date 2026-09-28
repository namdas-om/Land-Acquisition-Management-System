const Documents = {
    render: function(container) {
        container.innerHTML = `
            <div class="documents-module">
                <div class="header">
                    <h2>Document Management</h2>
                    <button class="btn btn-primary" onclick="Documents.openUploadModal()">+ Upload Document</button>
                </div>
                
                <div class="toolbar glass-panel">
                    <input type="text" id="doc-search" placeholder="Search by name or Parcel ID" class="search-input">
                    
                    <select id="doc-type-filter" class="filter-select">
                        <option value="All">All Types</option>
                        <option value="SIA Report">SIA Report</option>
                        <option value="Preliminary Notification">Preliminary Notification</option>
                        <option value="Survey Report">Survey Report</option>
                        <option value="Declaration Order">Declaration Order</option>
                        <option value="Award Letter">Award Letter</option>
                        <option value="Compensation Agreement">Compensation Agreement</option>
                        <option value="Title Deed">Title Deed</option>
                        <option value="Possession Certificate">Possession Certificate</option>
                        <option value="Objection Filing">Objection Filing</option>
                        <option value="Court Order">Court Order</option>
                    </select>
                    
                    <select id="doc-status-filter" class="filter-select">
                        <option value="All">All Statuses</option>
                        <option value="Draft">Draft</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Final">Final</option>
                        <option value="Archived">Archived</option>
                    </select>

                    <div class="view-toggles">
                        <button class="btn btn-icon active" id="view-list" onclick="Documents.setView('list')">List View</button>
                        <button class="btn btn-icon" id="view-grid" onclick="Documents.setView('grid')">Grid View</button>
                    </div>
                </div>

                <div id="documents-content" class="list-view"></div>
            </div>

            <!-- Upload Modal -->
            <div id="upload-modal" class="modal" style="display:none;">
                <div class="modal-content glass-panel">
                    <h3>Upload Document</h3>
                    <select id="upload-parcel" class="form-input"></select>
                    <select id="upload-type" class="form-input">
                        <option value="SIA Report">SIA Report</option>
                        <option value="Award Letter">Award Letter</option>
                    </select>
                    <input type="text" id="upload-name" class="form-input" placeholder="Document Name">
                    <textarea id="upload-desc" class="form-input" placeholder="Description"></textarea>
                    
                    <div class="drop-zone" id="drop-zone">
                        <p>Drag and drop file here, or click to select</p>
                    </div>
                    <div class="progress-bar-container" style="display:none;" id="upload-progress-container">
                        <div class="progress-bar" id="upload-progress" style="width:0%"></div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn" onclick="Documents.closeUploadModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="Documents.simulateUpload()">Upload</button>
                    </div>
                </div>
            </div>

            <!-- Preview Modal -->
            <div id="preview-modal" class="modal" style="display:none;">
                <div class="modal-content glass-panel">
                    <h3 id="preview-title"></h3>
                    <div id="preview-meta"></div>
                    <div class="mock-document" style="height: 300px; background: #fff; color: #000; margin: 15px 0; display: flex; align-items: center; justify-content: center;">
                        [Document Preview Content]
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-success" onclick="Documents.simulateDownload()">Download</button>
                        <button class="btn btn-danger" onclick="Documents.deleteDocument()">Delete</button>
                        <button class="btn" onclick="Documents.closePreviewModal()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        this.renderDocuments('list');
        this.attachEventListeners();
        this.populateUploadParcels();
    },

    attachEventListeners: function() {
        document.getElementById('doc-search').addEventListener('input', () => this.filterDocuments());
        document.getElementById('doc-type-filter').addEventListener('change', () => this.filterDocuments());
        document.getElementById('doc-status-filter').addEventListener('change', () => this.filterDocuments());
    },

    setView: function(view) {
        document.getElementById('view-list').classList.toggle('active', view === 'list');
        document.getElementById('view-grid').classList.toggle('active', view === 'grid');
        this.renderDocuments(view);
    },

    getStatusBadgeClass: function(status) {
        switch(status) {
            case 'Draft': return 'badge-warning';
            case 'Under Review': return 'badge-info';
            case 'Final': return 'badge-success';
            default: return 'badge-neutral';
        }
    },

    renderDocuments: function(view) {
        const content = document.getElementById('documents-content');
        content.className = view + '-view';
        
        const docs = window.AppData.documents || [];
        
        if (view === 'list') {
            let html = '<table class="data-table"><thead><tr><th>Name</th><th>Type</th><th>Parcel</th><th>Uploaded By</th><th>Date</th><th>Size</th><th>Status</th></tr></thead><tbody>';
            docs.forEach(doc => {
                html += `<tr onclick="Documents.openPreviewModal('${doc.id}')">
                    <td>${doc.name}</td>
                    <td>${doc.type}</td>
                    <td>${doc.parcelId}</td>
                    <td>${doc.uploadedBy}</td>
                    <td>${doc.uploadDate}</td>
                    <td>${doc.size}</td>
                    <td><span class="badge ${this.getStatusBadgeClass(doc.status)}">${doc.status}</span></td>
                </tr>`;
            });
            html += '</tbody></table>';
            content.innerHTML = html;
        } else {
            let html = '<div class="grid-layout">';
            docs.forEach(doc => {
                html += `<div class="card glass-panel" onclick="Documents.openPreviewModal('${doc.id}')">
                    <h4>${doc.name}</h4>
                    <p>${doc.type} - ${doc.parcelId}</p>
                    <p>${doc.uploadDate} | ${doc.size}</p>
                    <span class="badge ${this.getStatusBadgeClass(doc.status)}">${doc.status}</span>
                </div>`;
            });
            html += '</div>';
            content.innerHTML = html;
        }
    },

    filterDocuments: function() {
        // Implement filtering logic
    },

    populateUploadParcels: function() {
        const select = document.getElementById('upload-parcel');
        select.innerHTML = '<option value="">Select Parcel</option>';
        if (window.AppData.parcels) {
            window.AppData.parcels.forEach(p => {
                select.innerHTML += `<option value="${p.id}">${p.id} - ${p.village}</option>`;
            });
        }
    },

    openUploadModal: function() {
        document.getElementById('upload-modal').style.display = 'flex';
    },

    closeUploadModal: function() {
        document.getElementById('upload-modal').style.display = 'none';
        document.getElementById('upload-progress-container').style.display = 'none';
        document.getElementById('upload-progress').style.width = '0%';
    },

    simulateUpload: function() {
        document.getElementById('upload-progress-container').style.display = 'block';
        let width = 0;
        const progress = document.getElementById('upload-progress');
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
                alert('Upload successful!');
                this.closeUploadModal();
                // Add to mock data here
            } else {
                width += 10;
                progress.style.width = width + '%';
            }
        }, 200);
    },

    openPreviewModal: function(docId) {
        const doc = (window.AppData.documents || []).find(d => d.id === docId);
        if (!doc) return;
        document.getElementById('preview-title').textContent = doc.name;
        document.getElementById('preview-meta').innerHTML = `
            <p><strong>Type:</strong> ${doc.type}</p>
            <p><strong>Parcel:</strong> ${doc.parcelId}</p>
            <p><strong>Uploaded By:</strong> ${doc.uploadedBy} on ${doc.uploadDate}</p>
        `;
        document.getElementById('preview-modal').style.display = 'flex';
    },

    closePreviewModal: function() {
        document.getElementById('preview-modal').style.display = 'none';
    },

    simulateDownload: function() {
        alert('Download started...');
    },

    deleteDocument: function() {
        if(confirm('Delete document?')) {
            this.closePreviewModal();
        }
    }
};
window.Documents = Documents;
