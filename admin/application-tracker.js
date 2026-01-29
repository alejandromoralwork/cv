// Application Tracker JS (ES module)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, updateDoc, doc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { renderTable, showStatsModal } from './table-renderer.js';

// Firebase config (copy from firebase-config.js or define here)
const firebaseConfig = {
  apiKey: "AIzaSyBHw7K6HMLa2W_PmN9Yctq4XO3Zsng5PXI",
  authDomain: "jobsearch-a3a6c.firebaseapp.com",
  projectId: "jobsearch-a3a6c",
  storageBucket: "jobsearch-a3a6c.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};



const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const trackerCollection = collection(db, 'application_tracker');
let editingRowId = null;
let dynamicColumns = [];

const appForm = document.getElementById('appForm');
// Table rendering now handled by Tabulator in table-renderer.js

// Add new application
appForm.addEventListener('submit', async (e) => {
    e.preventDefault();
        const statusValue = document.getElementById('status').value || 'transmitted';
        const newApp = {
            offerLink: document.getElementById('offerLink').value,
            company: document.getElementById('company').value,
            field: document.getElementById('field').value,
            country: document.getElementById('country').value,
            cvVersion: document.getElementById('cvVersion').value,
            wayOfApplication: document.getElementById('wayOfApplication').value,
            status: statusValue,
            entryTime: serverTimestamp()
        };
        // Add dynamic columns if any
        dynamicColumns.forEach(col => {
            newApp[col] = document.getElementById(col).value;
        });
        await addDoc(trackerCollection, newApp);
        appForm.reset();
        // Reset status to default after reset
        document.getElementById('status').value = 'transmitted';
        loadApplications();
});

// Load applications from Firestore
async function loadApplications() {
    console.log('[DEBUG] loadApplications: fetching data from Firestore...');
    const q = query(trackerCollection, orderBy('entryTime', 'desc'));
    const snapshot = await getDocs(q);
    // Detect dynamic columns
    dynamicColumns = [];
    let allApps = [];
    let tableData = [];
    snapshot.forEach(docSnap => {
        const app = docSnap.data();
        app._id = docSnap.id;
        allApps.push(app);
        tableData.push(app);
        Object.keys(app).forEach(key => {
            if (!["offerLink","field","country","cvVersion","status","entryTime","company","wayOfApplication"].includes(key) && !dynamicColumns.includes(key)) {
                dynamicColumns.push(key);
            }
        });
    });
    console.log('[DEBUG] loadApplications: loaded', tableData.length, 'records:', tableData);
    renderDynamicColumns();
    window._allApps = allApps; // for filterable stats
    renderStats(allApps);
    // Build columns for Tabulator
    const baseCols = [
        {title: "Offer Link", field: "offerLink", formatter: "link", formatterParams: {labelField: "offerLink"}},
        {title: "Company", field: "company"},
        {title: "Field", field: "field"},
        {title: "Country", field: "country"},
        {title: "CV Version", field: "cvVersion"},
        {title: "Status", field: "status"},
        {title: "Way of Application", field: "wayOfApplication"},
        {title: "Entry Time", field: "entryTime", formatter: cell => new Date(cell.getValue()).toLocaleString()},
    ];
    const dynamicCols = dynamicColumns.map(col => ({title: col, field: col}));
    baseCols.push({title: "Actions", field: "_id", formatter: (cell) => {
        const id = cell.getValue();
        return `<button onclick=\"deleteEntry('${id}')\">Delete</button>`;
    }});
    const columns = [...baseCols, ...dynamicCols];
    console.log('[DEBUG] loadApplications: calling renderTable with', tableData.length, 'rows and', columns.length, 'columns');
    renderTable('appTableContainer', tableData, columns, true); // true = editable
}

    // Render stats section
    function renderStats(apps) {
        // Add advanced stats and chart data
        const statsSection = document.getElementById('appStats');
        if (!statsSection) return;
        const total = apps.length;
        const statusCounts = {};
        const countryCounts = {};
        const cvCounts = {};
        apps.forEach(app => {
            statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
            countryCounts[app.country] = (countryCounts[app.country] || 0) + 1;
            cvCounts[app.cvVersion] = (cvCounts[app.cvVersion] || 0) + 1;
        });
        let html = `<b>Total Applications:</b> ${total}<br>`;
        html += '<b>Status Breakdown:</b> ';
        html += Object.entries(statusCounts).map(([k,v]) => `${k}: ${v}`).join(', ');
        html += '<br><b>Country Breakdown:</b> ';
        html += Object.entries(countryCounts).map(([k,v]) => `${k}: ${v}`).join(', ');
        html += '<br><b>CV Version Breakdown:</b> ';
        html += Object.entries(cvCounts).map(([k,v]) => `${k}: ${v}`).join(', ');
        statsSection.innerHTML = html;
        window._latestStats = apps;
    }

    function getUniqueValues(apps, field) {
        return Array.from(new Set(apps.map(app => app[field]).filter(Boolean)));
    }

    function updateStatsByFilters() {
        const allApps = window._allApps || [];
        const country = document.getElementById('filterCountry').value;
        const cv = document.getElementById('filterCV').value;
        const status = document.getElementById('filterStatus').value;
        let filtered = allApps;
        if (country) filtered = filtered.filter(app => app.country === country);
        if (cv) filtered = filtered.filter(app => app.cvVersion === cv);
        if (status) filtered = filtered.filter(app => app.status === status);
        renderStats(filtered);
    }

    function renderStatsFilters() {
        const allApps = window._allApps || [];
        const filterDiv = document.getElementById('statsFilters');
        if (!filterDiv) return;
        // Get unique values
        const countries = getUniqueValues(allApps, 'country');
        const cvs = getUniqueValues(allApps, 'cvVersion');
        const statuses = getUniqueValues(allApps, 'status');
        // Build selects
        let html = '';
        html += '<label>Country: <select id="filterCountry"><option value="">All</option>' + countries.map(c => `<option value="${c}">${c}</option>`).join('') + '</select></label>';
        html += '<label>CV Version: <select id="filterCV"><option value="">All</option>' + cvs.map(c => `<option value="${c}">${c}</option>`).join('') + '</select></label>';
        html += '<label>Status: <select id="filterStatus"><option value="">All</option>' + statuses.map(s => `<option value="${s}">${s}</option>`).join('') + '</select></label>';
        filterDiv.innerHTML = html;
        // Add listeners
        document.getElementById('filterCountry').addEventListener('change', updateStatsByFilters);
        document.getElementById('filterCV').addEventListener('change', updateStatsByFilters);
        document.getElementById('filterStatus').addEventListener('change', updateStatsByFilters);
    }

    // Re-render filters and stats after loading
    const origRenderStats = renderStats;
    renderStats = function(apps) {
        origRenderStats(apps);
        renderStatsFilters();
    }

    // Save changes button logic
    window.saveTableChanges = async function() {
        // Always get the latest data from Tabulator, even if user hasn't left the last cell
        const updates = (window._getCurrentTableData && window._getCurrentTableData()) || window._latestTableData;
        if (!updates) return alert('No changes to save.');
        for (const row of updates) {
            if (!row._id) continue;
            const docRef = doc(db, 'application_tracker', row._id);
            const rowCopy = {...row};
            delete rowCopy._id;
            await updateDoc(docRef, rowCopy);
        }
        alert('Changes saved!');
        loadApplications();
    }
    // Show stats modal with charts
    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('showStatsModalBtn');
        if (btn) {
            btn.onclick = () => {
                const apps = window._latestStats || [];
                // Prepare chart data
                const statusCounts = {};
                const countryCounts = {};
                const fieldCounts = {};
                apps.forEach(app => {
                    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
                    countryCounts[app.country] = (countryCounts[app.country] || 0) + 1;
                    fieldCounts[app.field] = (fieldCounts[app.field] || 0) + 1;
                });
                const charts = [
                    {
                        type: 'pie',
                        data: {
                            labels: Object.keys(statusCounts),
                            datasets: [{data: Object.values(statusCounts), backgroundColor: ['#4caf50','#f44336','#2196f3','#ff9800','#9c27b0','#607d8b','#ffc107','#00bcd4']}]
                        },
                        options: {responsive:true, plugins:{title:{display:true,text:'Status Distribution'}}}
                    },
                    {
                        type: 'bar',
                        data: {
                            labels: Object.keys(countryCounts),
                            datasets: [{label:'Applications by Country',data: Object.values(countryCounts), backgroundColor:'#2196f3'}]
                        },
                        options: {responsive:true, plugins:{title:{display:true,text:'Country Breakdown'}}}
                    },
                    {
                        type: 'bar',
                        data: {
                            labels: Object.keys(fieldCounts),
                            datasets: [{label:'Applications by Field',data: Object.values(fieldCounts), backgroundColor:'#4caf50'}]
                        },
                        options: {responsive:true, plugins:{title:{display:true,text:'Field Breakdown'}}}
                    }
                ];
                // Advanced stats HTML
                let statsHtml = `<b>Total Applications:</b> ${apps.length}<br>`;
                statsHtml += `<b>Status:</b> ` + Object.entries(statusCounts).map(([k,v])=>`${k}: ${v}`).join(', ') + '<br>';
                statsHtml += `<b>Countries:</b> ` + Object.entries(countryCounts).map(([k,v])=>`${k}: ${v}`).join(', ') + '<br>';
                statsHtml += `<b>Fields:</b> ` + Object.entries(fieldCounts).map(([k,v])=>`${k}: ${v}`).join(', ') + '<br>';
                showStatsModal(statsHtml, charts);
            };
        }
    });
// Delete entry logic
window.deleteEntry = async function(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        await import('https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js').then(({ deleteDoc, doc }) => {
            const docRef = doc(db, 'application_tracker', id);
            return deleteDoc(docRef);
        });
        loadApplications();
    }
};

// Render dynamic columns in form and table
function renderDynamicColumns() {
    const dynamicDiv = document.getElementById('dynamicColumns');
    dynamicDiv.innerHTML = '';
    dynamicColumns.forEach(col => {
        if (!document.getElementById(col)) {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = col;
            input.placeholder = col.charAt(0).toUpperCase() + col.slice(1);
            input.style.margin = '0 8px 8px 0';
            dynamicDiv.appendChild(input);
        }
    });
    // No table header update needed; Tabulator handles columns.
}

// Edit and save logic
window.editRow = function(id) {
    editingRowId = id;
    loadApplications();
};
window.cancelEdit = function() {
    editingRowId = null;
    loadApplications();
};
window.saveEdit = async function(id) {
    const docRef = doc(db, 'application_tracker', id);
    const updateData = {
        offerLink: document.getElementById('edit-offerLink').value,
        company: document.getElementById('edit-company').value,
        field: document.getElementById('edit-field').value,
        country: document.getElementById('edit-country').value,
        cvVersion: document.getElementById('edit-cvVersion').value,
        wayOfApplication: document.getElementById('edit-wayOfApplication').value,
        status: document.getElementById('edit-status').value
    };
    dynamicColumns.forEach(col => {
        updateData[col] = document.getElementById('edit-' + col).value;
    });
    await updateDoc(docRef, updateData);
    editingRowId = null;
    loadApplications();
};

// Initial load
loadApplications();
