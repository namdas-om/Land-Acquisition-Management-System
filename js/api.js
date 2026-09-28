/**
 * NLAMS Centralized API Client
 * Wraps all REST API calls to the Express backend with fallback to window.AppData if backend is offline.
 */
window.API = (function() {
  const BASE_URL = '/api';

  async function request(endpoint, options = {}) {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        credentials: 'same-origin',
        ...options
      };

      if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        config.body = JSON.stringify(options.body);
      }

      const res = await fetch(`${BASE_URL}${endpoint}`, config);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[API Client] Endpoint ${endpoint} unreachable or error: ${err.message}. Falling back to AppData.`);
      throw err;
    }
  }

  return {
    // ── Auth API ───────────────────────────────────────────────────
    auth: {
      login: async (username, password) => {
        try {
          return await request('/auth/login', { method: 'POST', body: { username, password } });
        } catch (err) {
          // Fallback demo auth
          return { success: true, user: { role: 'official', name: 'Dr. Ananya Verma IAS', title: 'District Collector', avatar: '👩‍💼' } };
        }
      },
      logout: async () => {
        try {
          return await request('/auth/logout', { method: 'POST' });
        } catch (err) {
          return { success: true };
        }
      },
      me: async () => {
        try {
          return await request('/auth/me');
        } catch (err) {
          return null;
        }
      }
    },

    // ── Parcels API ────────────────────────────────────────────────
    parcels: {
      list: async (params = {}) => {
        try {
          const query = new URLSearchParams(params).toString();
          const res = await request(`/parcels?${query}`);
          return res.parcels || res;
        } catch (err) {
          return window.AppData ? window.AppData.parcels : [];
        }
      },
      get: async (id) => {
        try {
          return await request(`/parcels/${id}`);
        } catch (err) {
          return window.AppData ? window.AppData.parcels.find(p => p.id === id) : null;
        }
      },
      create: async (data) => {
        try {
          return await request('/parcels', { method: 'POST', body: data });
        } catch (err) {
          if (window.AppData) {
            const newParcel = { id: `PCL-2024-${Math.floor(1000 + Math.random() * 9000)}`, ...data };
            window.AppData.parcels.unshift(newParcel);
            return { success: true, parcel: newParcel };
          }
          throw err;
        }
      },
      updateStage: async (id, stage) => {
        try {
          return await request(`/parcels/${id}/stage`, { method: 'PATCH', body: { stage } });
        } catch (err) {
          if (window.AppData) {
            const p = window.AppData.parcels.find(x => x.id === id);
            if (p) p.currentStage = stage;
          }
          return { success: true, stage };
        }
      },
      delete: async (id) => {
        try {
          return await request(`/parcels/${id}`, { method: 'DELETE' });
        } catch (err) {
          if (window.AppData) {
            window.AppData.parcels = window.AppData.parcels.filter(p => p.id !== id);
          }
          return { success: true };
        }
      }
    },

    // ── Stakeholders API ───────────────────────────────────────────
    stakeholders: {
      getOwners: async () => {
        try {
          return await request('/stakeholders/owners');
        } catch (err) {
          return window.AppData ? window.AppData.owners : [];
        }
      },
      getOfficers: async () => {
        try {
          return await request('/stakeholders/officers');
        } catch (err) {
          return window.AppData ? window.AppData.officers : [];
        }
      },
      getLegalTeams: async () => {
        try {
          return await request('/stakeholders/legal-teams');
        } catch (err) {
          return window.AppData ? window.AppData.legalTeams : [];
        }
      }
    },

    // ── Finances API ───────────────────────────────────────────────
    finances: {
      list: async () => {
        try {
          return await request('/finances');
        } catch (err) {
          return window.AppData ? window.AppData.finances : [];
        }
      },
      getByParcel: async (parcelId) => {
        try {
          return await request(`/finances/${parcelId}`);
        } catch (err) {
          return window.AppData ? window.AppData.finances.find(f => f.parcelId === parcelId) : null;
        }
      },
      updatePayment: async (parcelId, data) => {
        try {
          return await request(`/finances/${parcelId}`, { method: 'PUT', body: data });
        } catch (err) {
          if (window.AppData) {
            const f = window.AppData.finances.find(x => x.parcelId === parcelId);
            if (f) Object.assign(f, data);
          }
          return { success: true };
        }
      }
    },

    // ── Documents API ──────────────────────────────────────────────
    documents: {
      list: async () => {
        try {
          return await request('/documents');
        } catch (err) {
          return window.AppData ? window.AppData.documents : [];
        }
      },
      create: async (data) => {
        try {
          return await request('/documents', { method: 'POST', body: data });
        } catch (err) {
          if (window.AppData) window.AppData.documents.unshift(data);
          return { success: true };
        }
      },
      delete: async (id) => {
        try {
          return await request(`/documents/${id}`, { method: 'DELETE' });
        } catch (err) {
          if (window.AppData) window.AppData.documents = window.AppData.documents.filter(d => d.id !== id);
          return { success: true };
        }
      }
    },

    // ── Notifications API ──────────────────────────────────────────
    notifications: {
      list: async () => {
        try {
          return await request('/notifications');
        } catch (err) {
          return window.AppData ? window.AppData.notifications : [];
        }
      },
      markRead: async (id) => {
        try {
          return await request(`/notifications/${id}/read`, { method: 'PATCH' });
        } catch (err) {
          if (window.AppData) {
            const n = window.AppData.notifications.find(x => x.id === id);
            if (n) n.isRead = true;
          }
          return { success: true };
        }
      },
      markAllRead: async () => {
        try {
          return await request('/notifications/read-all', { method: 'PATCH' });
        } catch (err) {
          if (window.AppData) window.AppData.notifications.forEach(n => n.isRead = true);
          return { success: true };
        }
      }
    },

    // ── Stats & Analytics API ──────────────────────────────────────
    stats: {
      get: async () => {
        try {
          return await request('/stats');
        } catch (err) {
          return window.AppData ? window.AppData.stats : null;
        }
      },
      getActivityLog: async () => {
        try {
          return await request('/stats/activity-log');
        } catch (err) {
          return window.AppData ? window.AppData.activityLog : [];
        }
      }
    }
  };
})();
