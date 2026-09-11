// App State
const state = {
    activeTab: 'dashboard',
    selectedPanel: null,
    wsConnected: false,
    wsMessageCount: 0,
    wsUrl: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/`,

    // Data buffers for charts
    timeBuffer: [],      // Últimas 60 timestamps
    powerBuffer: [],     // Potencia en watts
    energyBuffer: [],    // Energía acumulada en kWh
    readingsBuffer: [],  // Últimas lecturas completas
    anomalies: [],       // Detectadas anomalías

    // Chart instances
    charts: {}
};

// WebSocket Connection
let ws = null;

function connectWebSocket() {
    try {
        ws = new WebSocket(state.wsUrl);

        ws.onopen = () => {
            state.wsConnected = true;
            updateWSStatus(true);
            showToast('Conectado a servidor en tiempo real', 'success');
            console.log('WebSocket conectado:', state.wsUrl);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                state.wsMessageCount++;
                document.getElementById('ws-message-count').innerText = state.wsMessageCount;

                if (data.tipo === 'lectura_nueva') {
                    handleNewReading(data);
                } else if (data.tipo === 'anomalia') {
                    handleAnomaly(data);
                }
            } catch (e) {
                console.error('Error al parsear WebSocket:', e);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            updateWSStatus(false);
        };

        ws.onclose = () => {
            state.wsConnected = false;
            updateWSStatus(false);
            console.log('WebSocket desconectado');
            // Reconectar en 3 segundos
            setTimeout(() => connectWebSocket(), 3000);
        };
    } catch (e) {
        console.error('Error conectando WebSocket:', e);
        updateWSStatus(false);
    }
}

function updateWSStatus(connected) {
    const badge = document.getElementById('ws-status-badge');

    if (connected) {
        badge.className = 'flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20';
        badge.innerHTML = '<span class="ws-indicator ws-connected"></span> Conectado';
    } else {
        badge.className = 'flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20';
        badge.innerHTML = '<span class="ws-indicator ws-disconnected"></span> Desconectado';
    }
}

// Handle new reading from WebSocket
function handleNewReading(data) {
    if (state.selectedPanel && data.panel_code !== state.selectedPanel) {
        return; // Ignore readings from other panels
    }

    const reading = {
        timestamp: data.timestamp,
        voltaje: data.voltaje,
        corriente: data.corriente,
        potencia: data.potencia,
        eficiencia_pct: calculateEfficiency(data.potencia, 5000), // Asumir max 5kW
        anomalia: data.anomalia
    };

    // Add to buffers (max 60 for charts)
    state.timeBuffer.push(new Date(data.timestamp).toLocaleTimeString());
    state.powerBuffer.push(data.potencia);
    state.energyBuffer.push(data.potencia * (1/12)); // Asumir 5min intervals = 1/12 hora

    if (state.timeBuffer.length > 60) {
        state.timeBuffer.shift();
        state.powerBuffer.shift();
        state.energyBuffer.shift();
    }

    state.readingsBuffer.unshift(reading);
    if (state.readingsBuffer.length > 20) {
        state.readingsBuffer.pop();
    }

    // Update KPIs
    document.getElementById('kpi-voltage').innerText = reading.voltaje.toFixed(2);
    document.getElementById('kpi-current').innerText = reading.corriente.toFixed(2);
    document.getElementById('kpi-last-update').innerText = new Date(data.timestamp).toLocaleTimeString();

    updateCharts();
    renderReadingsTable();
}

// Handle anomaly alert
function handleAnomaly(data) {
    const anomaly = {
        timestamp: data.timestamp,
        panel_code: data.panel_code,
        tipo: data.tipo,
        esperado_w: data.esperado_w,
        actual_w: data.actual_w,
        mensaje: data.mensaje
    };

    state.anomalies.unshift(anomaly);
    if (state.anomalies.length > 10) {
        state.anomalies.pop();
    }

    document.getElementById('alert-badge').innerText = state.anomalies.length;
    renderAlertsTable();
    showToast(`⚠️ Anomalía: ${data.mensaje}`, 'error');
}

// Calculate efficiency percentage
function calculateEfficiency(potencia, maxPotencia) {
    return Math.min(100, (potencia / maxPotencia) * 100);
}

// Fetch initial panel list
async function fetchPanels() {
    try {
        const response = await fetch('/api/v1/paneles');
        if (response.ok) {
            const panels = await response.json();
            populatePanelSelector(panels);
            if (panels.length > 0) {
                selectPanel(panels[0].code);
            }
        }
    } catch (e) {
        console.error('Error fetching panels:', e);
        showToast('Error cargando paneles', 'error');
    }
}

function populatePanelSelector(panels) {
    const selector = document.getElementById('panel-selector');
    selector.innerHTML = '<option value="">Seleccionar Panel...</option>';
    panels.forEach(panel => {
        const option = document.createElement('option');
        option.value = panel.code;
        option.innerText = `${panel.nombre} (${panel.code})`;
        selector.appendChild(option);
    });
}

// Select panel and fetch its stats
async function selectPanel(code) {
    if (!code) return;

    state.selectedPanel = code;
    state.timeBuffer = [];
    state.powerBuffer = [];
    state.energyBuffer = [];
    state.readingsBuffer = [];
    state.anomalies = [];

    document.getElementById('alert-badge').innerText = '0';

    try {
        // Fetch today's stats
        const todayResponse = await fetch(`/api/v1/paneles/${code}/estadisticas/hoy`);
        if (todayResponse.ok) {
            const today = await todayResponse.json();
            document.getElementById('kpi-energy').innerText = today.energia_kwh.toFixed(2);
            document.getElementById('kpi-efficiency').innerText = `${(today.potencia_pico_w / 5000 * 100).toFixed(1)}%`;
        }

        // Fetch recent readings
        const readingsResponse = await fetch(`/api/v1/paneles/${code}/lecturas?skip=0&limit=20`);
        if (readingsResponse.ok) {
            const result = await readingsResponse.json();
            state.readingsBuffer = result.items.map(r => ({
                timestamp: r.created_at,
                voltaje: r.voltaje,
                corriente: r.corriente,
                potencia: r.voltaje * r.corriente,
                eficiencia_pct: calculateEfficiency(r.voltaje * r.corriente, 5000),
                anomalia: null
            })).reverse();
            renderReadingsTable();
        }

        showToast(`Panel ${code} seleccionado`, 'success');
    } catch (e) {
        console.error('Error fetching panel data:', e);
        showToast('Error cargando datos del panel', 'error');
    }
}

function fetchPanelData() {
    if (state.selectedPanel) {
        selectPanel(state.selectedPanel);
    } else {
        fetchPanels();
    }
}

// Tab Switching
function switchTab(tabId) {
    state.activeTab = tabId;
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.className = 'nav-btn';
    });

    const activeBtn = document.getElementById(`nav-${tabId}`);
    if (activeBtn) {
        activeBtn.className = 'nav-btn active';
    }

    const titles = {
        'dashboard': 'Dashboard en Vivo',
        'analytics': 'Análisis de Rendimiento',
        'alerts': 'Alertas y Anomalías'
    };
    document.getElementById('page-title').innerText = titles[tabId] || 'Dashboard';

    // Redibuja gráficas
    setTimeout(() => {
        Object.values(state.charts).forEach(chart => {
            if (chart) chart.resize();
        });
    }, 100);
}

// Initialize Charts
function initCharts() {
    const ctxPower = document.getElementById('powerChart').getContext('2d');
    state.charts.power = new Chart(ctxPower, {
        type: 'line',
        data: {
            labels: state.timeBuffer,
            datasets: [{
                label: 'Potencia (W)',
                data: state.powerBuffer,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, labels: { color: '#94a3b8' } }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8', font: { size: 10 } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#f59e0b' }
                }
            }
        }
    });

    const ctxEnergy = document.getElementById('energyChart').getContext('2d');
    state.charts.energy = new Chart(ctxEnergy, {
        type: 'bar',
        data: {
            labels: state.timeBuffer,
            datasets: [{
                label: 'Energía (kWh)',
                data: state.energyBuffer.map((v, i) => state.energyBuffer.slice(0, i + 1).reduce((a, b) => a + b, 0)),
                backgroundColor: '#10b981',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, labels: { color: '#94a3b8' } }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#10b981' }
                }
            }
        }
    });

    const ctxHistory = document.getElementById('historyChart').getContext('2d');
    state.charts.history = new Chart(ctxHistory, {
        type: 'bar',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'kWh',
                data: [28.4, 31.2, 29.8, 22.1, 33.5, 30.1, 24.8],
                backgroundColor: '#3b82f6',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

function updateCharts() {
    if (state.charts.power) {
        state.charts.power.data.labels = state.timeBuffer;
        state.charts.power.data.datasets[0].data = state.powerBuffer;
        state.charts.power.update('none');
    }

    if (state.charts.energy) {
        state.charts.energy.data.labels = state.timeBuffer;
        state.charts.energy.data.datasets[0].data = state.energyBuffer.map((v, i) =>
            state.energyBuffer.slice(0, i + 1).reduce((a, b) => a + b, 0)
        );
        state.charts.energy.update('none');
    }
}

function renderReadingsTable() {
    const tbody = document.getElementById('readings-table-body');
    tbody.innerHTML = state.readingsBuffer.map(r => `
        <tr>
            <td class="anomaly-cell">${new Date(r.timestamp).toLocaleTimeString()}</td>
            <td><span style="color: #fbbf24; font-weight: 600;">${r.voltaje.toFixed(2)}</span></td>
            <td><span style="color: #06b6d4; font-weight: 600;">${r.corriente.toFixed(2)}</span></td>
            <td><span style="color: white; font-weight: 600;">${r.potencia.toFixed(0)}</span></td>
            <td><span style="color: #10b981; font-weight: 600;">${r.eficiencia_pct.toFixed(1)}</span></td>
            <td>
                ${r.anomalia ? `<span style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.625rem; font-weight: 600; background-color: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3);">⚠️ ${r.anomalia.tipo}</span>` : '<span style="color: #64748b;">—</span>'}
            </td>
        </tr>
    `).join('');
}

function renderAlertsTable() {
    const container = document.getElementById('alerts-container');
    if (state.anomalies.length === 0) {
        container.innerHTML = '<p class="text-center text-slate-400 py-8">Sin anomalías detectadas</p>';
        return;
    }

    container.innerHTML = state.anomalies.map(a => `
        <div class="alert-item">
            <div class="alert-content">
                <div class="alert-title">${a.tipo}</div>
                <div class="alert-message">${a.mensaje}</div>
                <div class="alert-details">Esperado: ${a.esperado_w.toFixed(0)}W | Actual: ${a.actual_w.toFixed(0)}W</div>
            </div>
            <div class="alert-time">${new Date(a.timestamp).toLocaleTimeString()}</div>
        </div>
    `).join('');
}

function clearAlerts() {
    state.anomalies = [];
    document.getElementById('alert-badge').innerText = '0';
    renderAlertsTable();
    showToast('Alertas limpiadas', 'info');
}

function exportDataCSV() {
    if (!state.selectedPanel) {
        showToast('Selecciona un panel primero', 'error');
        return;
    }

    let csv = 'Timestamp,Voltaje (V),Corriente (A),Potencia (W),Eficiencia (%)\n';
    state.readingsBuffer.forEach(r => {
        csv += `${new Date(r.timestamp).toISOString()},${r.voltaje.toFixed(2)},${r.corriente.toFixed(2)},${r.potencia.toFixed(0)},${r.eficiencia_pct.toFixed(1)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panel_${state.selectedPanel}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('CSV descargado', 'success');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// Initialize on load
window.addEventListener('load', () => {
    initCharts();
    fetchPanels();
    connectWebSocket();
    document.getElementById('ws-url-text').innerText = state.wsUrl;
});

// Update "hace X segundos"
setInterval(() => {
    if (state.readingsBuffer.length > 0) {
        const lastReading = new Date(state.readingsBuffer[0].timestamp);
        const diff = Math.floor((new Date() - lastReading) / 1000);
        document.getElementById('kpi-last-update-ago').innerText = `hace ${diff} segundos`;
    }
}, 1000);
