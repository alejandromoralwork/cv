// Application Tracker JS (ES module)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, updateDoc, doc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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
const appTableBody = document.getElementById('appTable').querySelector('tbody');

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
        appTableBody.innerHTML = '';
        const q = query(trackerCollection, orderBy('entryTime', 'desc'));
        const snapshot = await getDocs(q);
        // Detect dynamic columns
        dynamicColumns = [];
        snapshot.forEach(docSnap => {
            const app = docSnap.data();
            Object.keys(app).forEach(key => {
                if (!["offerLink","field","country","cvVersion","status","entryTime"].includes(key) && !dynamicColumns.includes(key)) {
                    dynamicColumns.push(key);
                }
            });
        });
        renderDynamicColumns();
        snapshot.forEach(docSnap => {
                const app = docSnap.data();
                const row = document.createElement('tr');
                if (editingRowId === docSnap.id) {
                    row.innerHTML = `
                        <td><input type="url" value="${app.offerLink || ''}" id="edit-offerLink"></td>
                        <td><input type="text" value="${app.field || ''}" id="edit-field"></td>
                        <td><input type="text" value="${app.country || ''}" id="edit-country"></td>
                        <td><input type="text" value="${app.cvVersion || ''}" id="edit-cvVersion"></td>
                        <td><input type="text" value="${app.status || ''}" id="edit-status"></td>
                        <td><input type="text" value="${app.company || ''}" id="edit-company"></td>
                        <td><input type="text" value="${app.wayOfApplication || ''}" id="edit-wayOfApplication"></td>
                        <td>${app.entryTime && app.entryTime.toDate ? app.entryTime.toDate().toLocaleString() : ''}</td>
                        ${dynamicColumns.map(col => `<td><input type="text" value="${app[col] || ''}" id="edit-${col}"></td>`).join('')}
                        <td>
                            <button class="save-btn" onclick="window.saveEdit('${docSnap.id}')">Save</button>
                            <button class="cancel-btn" onclick="window.cancelEdit()">Cancel</button>
                            <button class="cancel-btn" onclick="window.deleteEntry('${docSnap.id}')">Delete</button>
                        </td>
                    `;
                } else {
                    row.innerHTML = `
                        <td><a href="${app.offerLink}" target="_blank">Link</a></td>
                        <td>${app.field}</td>
                        <td>${app.country}</td>
                        <td>${app.cvVersion}</td>
                        <td>${app.status}</td>
                        <td>${app.company || ''}</td>
                        <td>${app.wayOfApplication || ''}</td>
                        <td>${app.entryTime && app.entryTime.toDate ? app.entryTime.toDate().toLocaleString() : ''}</td>
                        ${dynamicColumns.map(col => `<td>${app[col] || ''}</td>`).join('')}
                        <td>
                            <button class="edit-btn" onclick="window.editRow('${docSnap.id}')">Edit</button>
                            <button class="cancel-btn" onclick="window.deleteEntry('${docSnap.id}')">Delete</button>
                        </td>
                    `;
                }
                appTableBody.appendChild(row);
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
        });
}

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
    // Update table header
    const theadRow = document.querySelector('#appTable thead tr');
    // Remove old dynamic ths
    while (theadRow.children.length > 7) theadRow.removeChild(theadRow.lastChild);
    dynamicColumns.forEach(col => {
        if (![...theadRow.children].some(th => th.textContent === col)) {
            const th = document.createElement('th');
            th.textContent = col;
            theadRow.insertBefore(th, theadRow.children[theadRow.children.length-1]);
        }
    });
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
