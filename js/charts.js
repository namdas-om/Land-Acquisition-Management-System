window.ChartUtils = {
  // Kinetic Electric Accent Palette
  colors: ['#a855f7', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#3b82f6'],
  
  // Store chart instances
  instances: {},

  // Set global Chart.js defaults based on current active theme
  applyDefaults() {
    if (typeof Chart === 'undefined') return;
    
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    
    this.colors = isLight 
      ? ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#8b5cf6']
      : ['#a855f7', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#3b82f6'];

    const textColor = isLight ? '#0f172a' : '#f8fafc';
    const tooltipBg = isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(12, 15, 24, 0.95)';
    const tooltipText = isLight ? '#0f172a' : '#ffffff';
    const tooltipBorder = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)';
    
    Chart.defaults.color = textColor;
    Chart.defaults.font.family = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
    
    Chart.defaults.plugins.legend.labels.color = textColor;
    Chart.defaults.plugins.tooltip.backgroundColor = tooltipBg;
    Chart.defaults.plugins.tooltip.titleColor = tooltipText;
    Chart.defaults.plugins.tooltip.bodyColor = textColor;
    Chart.defaults.plugins.tooltip.borderColor = tooltipBorder;
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.boxPadding = 6;
    Chart.defaults.plugins.tooltip.usePointStyle = true;
  },

  // Destroy chart by canvas ID if exists
  destroyChart(canvasId) {
    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
      delete this.instances[canvasId];
    }
  },

  // Format number with Indian numbering (lakhs, crores)
  formatIndianCurrency(num) {
    return '₹' + num.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      style: 'decimal'
    });
  },

  // Format large numbers compactly
  formatCompact(num) {
    if (num >= 10000000) {
      return (num / 10000000).toFixed(2) + ' Cr';
    } else if (num >= 100000) {
      return (num / 100000).toFixed(2) + ' L';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + ' k';
    }
    return num.toString();
  },

  // Helper for grid options
  getGridOptions(showX = true, showY = true) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const gridColor = isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.06)';
    const tickColor = isLight ? '#71717a' : '#a1a1aa';

    return {
      x: {
        display: showX,
        grid: { color: gridColor, drawBorder: false },
        ticks: { color: tickColor }
      },
      y: {
        display: showY,
        grid: { color: gridColor, drawBorder: false },
        ticks: { color: tickColor }
      }
    };
  },

  // Create a line chart
  createLineChart(canvasId, labels, datasets, options = {}) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const chartDatasets = datasets.map((ds, i) => ({
      ...ds,
      borderColor: ds.borderColor || this.colors[i % this.colors.length],
      backgroundColor: ds.backgroundColor || 'transparent',
      borderWidth: 2,
      tension: 0.4,
      pointBackgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#f4f4f5' : '#09090b',
      pointBorderColor: ds.borderColor || this.colors[i % this.colors.length],
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }));

    const config = {
      type: 'line',
      data: { labels, datasets: chartDatasets },
      options: {
        ...options,
        scales: this.getGridOptions()
      }
    };
    
    this.instances[canvasId] = new Chart(ctx, config);
    return this.instances[canvasId];
  },

  // Create a bar chart
  createBarChart(canvasId, labels, data, options = {}) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const config = {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: options.colors || this.colors[0] + '80',
          borderColor: options.borderColors || this.colors[0],
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: this.getGridOptions(),
        ...options
      }
    };
    
    this.instances[canvasId] = new Chart(ctx, config);
    return this.instances[canvasId];
  },

  // Create a doughnut chart
  createDoughnutChart(canvasId, labels, data, colors, options = {}) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const bgColors = colors || this.colors.slice(0, data.length);
    
    const config = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: bgColors.map(c => c + 'CC'),
          borderColor: bgColors,
          borderWidth: 1,
          hoverOffset: 4
        }]
      },
      options: {
        cutout: '75%',
        plugins: {
          legend: { position: 'bottom' }
        },
        ...options
      }
    };
    
    this.instances[canvasId] = new Chart(ctx, config);
    return this.instances[canvasId];
  },

  // Create a horizontal bar chart
  createHorizontalBarChart(canvasId, labels, data, colors, options = {}) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const config = {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors || this.colors.slice(0, data.length).map(c => c + '80'),
          borderColor: colors || this.colors.slice(0, data.length),
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: this.getGridOptions(),
        ...options
      }
    };
    
    this.instances[canvasId] = new Chart(ctx, config);
    return this.instances[canvasId];
  },

  // Create a stacked bar chart
  createStackedBarChart(canvasId, labels, datasets, options = {}) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const chartDatasets = datasets.map((ds, i) => ({
      ...ds,
      backgroundColor: ds.backgroundColor || this.colors[i % this.colors.length] + '99',
      borderRadius: 2
    }));

    const config = {
      type: 'bar',
      data: { labels, datasets: chartDatasets },
      options: {
        scales: {
          x: { stacked: true, grid: { color: 'rgba(0, 0, 0, 0.05)' }, ticks: { color: '#71717a' } },
          y: { stacked: true, grid: { color: 'rgba(0, 0, 0, 0.05)' }, ticks: { color: '#71717a' } }
        },
        ...options
      }
    };
    
    this.instances[canvasId] = new Chart(ctx, config);
    return this.instances[canvasId];
  },

  // Create a radial/gauge chart for percentages
  createGaugeChart(canvasId, value, maxValue = 100, color = null, options = {}) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const themeColor = color || this.colors[0];
    const remaining = maxValue - value;

    const config = {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [value, remaining],
          backgroundColor: [themeColor, document.documentElement.getAttribute('data-theme') === 'light' ? '#e4e4e7' : '#27272a'],
          borderWidth: 0,
          circumference: 270,
          rotation: 225
        }]
      },
      options: {
        cutout: '85%',
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false }
        },
        ...options
      }
    };
    
    this.instances[canvasId] = new Chart(ctx, config);
    return this.instances[canvasId];
  }
};
