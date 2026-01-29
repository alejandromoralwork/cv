// Application Tracker JS (ES module)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, updateDoc, doc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { renderTable, showStatsModal } from './table-renderer.js';



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHw7K6HMLa2W_PmN9Yctq4XO3Zsng5PXI",
  authDomain: "jobsearch-a3a6c.firebaseapp.com",
  databaseURL: "https://jobsearch-a3a6c-default-rtdb.firebaseio.com",
  projectId: "jobsearch-a3a6c",
  storageBucket: "jobsearch-a3a6c.firebasestorage.app",
  messagingSenderId: "63177029478",
  appId: "1:63177029478:web:29682710bea4d3d194faa7",
  measurementId: "G-X7F3CZK48G"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const trackerCollection = collection(db, 'application_tracker');
let editingRowId = null;
let dynamicColumns = [];

const appForm = document.getElementById('appForm');
// Set default date to today in ddmmyy format
function setDefaultDate() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        dateInput.value = dd + mm + yy;
    }
}
document.addEventListener('DOMContentLoaded', setDefaultDate);
// Table rendering now handled by Tabulator in table-renderer.js

// Add new application
appForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (appForm._submitting) return; // Prevent double submit
    appForm._submitting = true;
        const statusValue = document.getElementById('status').value || 'transmitted';
        const newApp = {
            offerLink: document.getElementById('offerLink').value,
            company: document.getElementById('company').value,
            field: document.getElementById('field').value,
            country: document.getElementById('country').value,
            cvVersion: document.getElementById('cvVersion').value,
            wayOfApplication: document.getElementById('wayOfApplication').value,
            status: statusValue,
            date: document.getElementById('date').value
        };
        // Add dynamic columns if any
        dynamicColumns.forEach(col => {
            newApp[col] = document.getElementById(col).value;
        });
        // Validation: prevent saving empty objects
        const hasData = Object.values(newApp).some(v => v && v.trim && v.trim() !== '');
        if (!hasData) {
            alert('Cannot save empty application. Please fill at least one field.');
            return;
        }
        await addDoc(trackerCollection, newApp);
        appForm.reset();
        setDefaultDate();
        document.getElementById('status').value = 'transmitted';
        appForm._submitting = false;
        loadApplications();
});

// Load applications from Firestore
async function loadApplications() {
    console.log('[DEBUG] loadApplications: fetching data from Firestore...');
    const q = query(trackerCollection);
    const snapshot = await getDocs(q);
    // Detect dynamic columns
    dynamicColumns = [];
    let allApps = [];
    let tableData = [];
    snapshot.forEach(docSnap => {
        const app = docSnap.data();
        if (!app || Object.keys(app).length === 0) {
            console.warn('[DEBUG] Skipping empty Firestore docSnap:', docSnap.id, app);
            return; // skip empty docs
        }
        app._id = docSnap.id;
        // Ensure 'date' field exists for Tabulator (fallback for legacy rows)
        if (!('date' in app)) app.date = '';
        allApps.push(app);
        tableData.push(app);
        Object.keys(app).forEach(key => {
            if (!["offerLink","field","country","cvVersion","status","date","company","wayOfApplication"].includes(key) && !dynamicColumns.includes(key)) {
                dynamicColumns.push(key);
            }
        });
    });
    console.log('[DEBUG] loadApplications: loaded', tableData.length, 'records:', tableData);
    // Extra debug: print each row to see if any are empty
    tableData.forEach((row, i) => {
        if (!row || Object.keys(row).length === 0) {
            console.warn('[DEBUG] tableData row is empty at index', i, row);
        }
    });
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
        {title: "Date", field: "date"},
    ];
    const dynamicCols = dynamicColumns.map(col => ({title: col, field: col}));
    baseCols.push({title: "Actions", field: "_id", formatter: (cell) => {
        const id = cell.getValue();
        return `<button onclick=\"deleteEntry('${id}')\">Delete</button>`;
    }});
    const columns = [...baseCols, ...dynamicCols];
    console.log('[DEBUG] loadApplications: calling renderTable with', tableData.length, 'rows and', columns.length, 'columns');
        renderTable('appTableContainer', tableData, columns, true); // true = editable
        // Attach save button handler after table render
        setTimeout(() => {
            const btn = document.getElementById('saveTableBtn');
            if (btn) btn.onclick = () => {
                console.log('[DEBUG] Save Changes button clicked');
                // Always get the latest data from Tabulator, even if user hasn't left the last cell
                if (window._getCurrentTableData) {
                    window._latestTableData = window._getCurrentTableData();
                }
                window.saveTableChanges();
            };
            else {
                console.warn('[DEBUG] Save Changes button not found');
            }
        }, 0);
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
        // Robust: force Tabulator to commit any in-progress edits before saving
        console.log('[DEBUG] saveTableChanges called');
        let tableInstance = null;
        let updates;
        if (document.getElementById('appTableContainer').children.length) {
            tableInstance = Tabulator.findTable('#appTableContainer')[0];
            if (tableInstance) {
                tableInstance.getEditedCells().forEach(cell => cell.cancelEdit());
                // Always get latest data from Tabulator instance
                updates = tableInstance.getData();
                console.log('[DEBUG] Got table data from Tabulator instance:', updates);
            }
        }
        if (!updates && window._getCurrentTableData) {
            updates = window._getCurrentTableData();
            console.log('[DEBUG] Got table data from window._getCurrentTableData:', updates);
        }
        if (!updates && window._latestTableData) {
            updates = window._latestTableData;
            console.log('[DEBUG] Got table data from window._latestTableData:', updates);
        }
        if (!updates || !Array.isArray(updates) || updates.length === 0) {
            console.warn('[DEBUG] No changes to save. Table data:', updates);
            alert('No changes to save.');
            return;
        }
        // 1. Delete all docs in the collection
        console.log('[DEBUG] Deleting all docs in application_tracker...');
        const snapshot = await getDocs(trackerCollection);
        const deletePromises = [];
        for (const docSnap of snapshot.docs) {
            try {
                const { deleteDoc, doc } = await import('https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js');
                deletePromises.push(deleteDoc(doc(db, 'application_tracker', docSnap.id)));
            } catch (err) {
                console.error('[DEBUG] Error deleting doc', docSnap.id, err);
            }
        }
        await Promise.all(deletePromises);
        console.log('[DEBUG] All docs deleted. Adding new rows...');
        // 2. Add all rows as new docs
        const addPromises = updates.map((row, i) => {
            const rowCopy = {...row};
            delete rowCopy._id;
            console.log('[DEBUG] Adding row', i, rowCopy);
            return addDoc(trackerCollection, rowCopy);
        });
        await Promise.all(addPromises);
        console.log('[DEBUG] All rows added.');
        alert('All changes saved!');
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
