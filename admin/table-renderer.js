// Table rendering and stats modal module for Application Tracker
// Uses Tabulator for table and Chart.js for stats
// Requires: Tabulator (https://unpkg.com/tabulator-tables@5.5.0/dist/js/tabulator.min.js)
//           Chart.js (https://cdn.jsdelivr.net/npm/chart.js)

let _pendingTableRender = null;
export function renderTable(containerId, data, columns, editable=false) {
    function _render() {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn('[DEBUG] renderTable: container not found:', containerId);
            return;
        }
        container.innerHTML = '';
        // Add Save Changes button if editable
        if (editable) {
            const saveBtn = document.createElement('button');
            saveBtn.textContent = 'Save Changes';
            saveBtn.style = 'margin-bottom:8px;float:right;background:#1976d2;color:#fff;border:none;padding:6px 16px;border-radius:4px;cursor:pointer;';
            saveBtn.onclick = () => window.saveTableChanges();
            container.appendChild(saveBtn);
        }
        console.log('[DEBUG] renderTable: rendering Tabulator with', data.length, 'rows and', columns.length, 'columns', {data, columns});
        // Set default width for columns if not set
        const cols = columns.map(col => ({...col, width: col.width || 160, editor: editable && col.field !== '_id' && col.field !== 'Actions' ? 'input' : false}));
        let tableInstance = null;
        try {
            tableInstance = new Tabulator(container, {
                data,
                columns: cols,
                layout: 'fitColumns',
                responsiveLayout: false,
                movableColumns: true,
                pagination: false,
                autoColumns: false,
                height: '400px',
                virtualDom: true,
                resizableColumns: true,
                tooltips: true,
                columnDefaults: {
                    headerSort: true,
                    hozAlign: 'left',
                    vertAlign: 'middle',
                },
                autoResize: true,
                scrollHorizontal: true,
                cellEdited: function(cell) {
                    // Save all table data to window for batch save
                    const tableData = cell.getTable().getData();
                    window._latestTableData = tableData;
                },
                tableBuilt: function() {
                    // Always keep latest data reference for save
                    window._getCurrentTableData = () => tableInstance.getData();
                }
            });
            // Add compact/visibility classes
            container.classList.add('tabulator-compact', 'tabulator-visible');
        } catch (e) {
            console.error('[DEBUG] renderTable: Tabulator error', e);
        }
    }
    if (!window.Tabulator) {
        console.log('[DEBUG] renderTable: Tabulator not loaded, queueing render');
        _pendingTableRender = () => _render();
        if (!document.getElementById('tabulator-js')) {
            const script = document.createElement('script');
            script.id = 'tabulator-js';
            script.src = 'https://unpkg.com/tabulator-tables@5.5.0/dist/js/tabulator.min.js';
            script.onload = () => {
                console.log('[DEBUG] Tabulator script loaded');
                if (_pendingTableRender) {
                    _pendingTableRender();
                    _pendingTableRender = null;
                }
            };
            document.head.appendChild(script);
        }
    } else {
        _render();
    }
}

export function showStatsModal(stats, charts) {
    // Dynamically load Chart.js if not present
    if (!window.Chart) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => _show();
        document.head.appendChild(script);
    } else {
        _show();
    }
    function _show() {
        let modal = document.getElementById('statsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'statsModal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.background = 'rgba(0,0,0,0.7)';
            modal.style.zIndex = '9999';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.innerHTML = `<div style="background:#fff;padding:32px 24px 24px 24px;max-width:900px;width:90vw;max-height:90vh;overflow:auto;position:relative;border-radius:12px;">
                <button id="closeStatsModal" style="position:absolute;top:8px;right:12px;font-size:1.5em;background:none;border:none;cursor:pointer;">&times;</button>
                <h2 style="margin-top:0;">Application Tracker Stats</h2>
                <div id="statsCharts" style="display:grid;grid-template-columns:1fr 1fr;gap:24px;"></div>
                <div id="statsDetails" style="margin-top:24px;"></div>
            </div>`;
            document.body.appendChild(modal);
            document.getElementById('closeStatsModal').onclick = () => modal.remove();
        } else {
            modal.style.display = 'flex';
        }
        // Render charts
        const chartsDiv = document.getElementById('statsCharts');
        chartsDiv.innerHTML = '';
        charts.forEach((chart, i) => {
            const canvas = document.createElement('canvas');
            canvas.id = 'chart' + i;
            canvas.width = 350;
            canvas.height = 250;
            chartsDiv.appendChild(canvas);
            new Chart(canvas.getContext('2d'), chart);
        });
        // Render advanced stats
        const detailsDiv = document.getElementById('statsDetails');
        detailsDiv.innerHTML = stats;
    }
}
