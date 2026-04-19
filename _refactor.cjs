const fs = require('fs');

let content = fs.readFileSync('App.tsx', 'utf8');

// 1. Remove states
content = content.replace("  const [roomSyncPasswordModal, setRoomSyncPasswordModal] = useState(false);\r\n", "");
content = content.replace("  const [roomSyncPassword, setRoomSyncPassword] = useState('');\r\n", "");
content = content.replace("  const [roomSyncPasswordModal, setRoomSyncPasswordModal] = useState(false);\n", "");
content = content.replace("  const [roomSyncPassword, setRoomSyncPassword] = useState('');\n", "");

// 2. Add dev mock and remove password parameter
const syncHeaderRegex = /const startRoomSync = async \(password: string\) => \{([\s\S]*?)setRoomSyncError\(''\);/;
const replacementSyncHeader = `const startRoomSync = async () => {$1setRoomSyncError('');

    if (import.meta.env.DEV) {
      for (let i = 0; i < ALL_SYNC_ROOM_IDS.length; i++) {
        setRoomSyncProgress(i + 1);
        setRoomSyncCurrentRoom(ALL_SYNC_ROOM_IDS[i]);
        setRoomSyncLogs(prev => [...prev, \`[Localhost] Mocked sync of \${ALL_SYNC_ROOM_IDS[i]} (backend skipped)\`]);
        await new Promise(r => setTimeout(r, 60));
      }
      setRoomSyncCompleted(true);
      setRoomSyncLogs(prev => [...prev, \`🎉 Sync mock complete!\`]);
      setRoomSyncing(false);
      return;
    }`;
content = content.replace(syncHeaderRegex, replacementSyncHeader);

// Fix the fetch call to remove password body
content = content.replace("password,\r\n            roomIds:", "roomIds:");
content = content.replace("password,\n            roomIds:", "roomIds:");

// 3. Extract and remove the Panel from rooms tab
const panelStartMarker = "{/* --- LIVE ROOM SYNC PANEL --- */}";
const panelEndMarker = "{/* --- NEW: SEARCH & FILTER CONTROLS --- */}";
const panelStartIdx = content.indexOf(panelStartMarker);
const panelEndIdx = content.indexOf(panelEndMarker);

let syncPanelCode = "";
if (panelStartIdx !== -1 && panelEndIdx !== -1) {
    syncPanelCode = content.substring(panelStartIdx, panelEndIdx);
    
    // Fix the panel's button logic to skip the modal
    syncPanelCode = syncPanelCode.replace(
      "onClick={() => { setRoomSyncPasswordModal(true); setRoomSyncPassword(''); setRoomSyncError(''); }}",
      "onClick={() => { startRoomSync(); }}"
    );
    
    // Remove it from the original spot
    content = content.substring(0, panelStartIdx) + content.substring(panelEndIdx);
}

// 4. Update the Admin Tabs to include Rooms and inject the panel
const adminTabsRegex = /<button onClick=\{\(\) => setAdminTab\('events'\)\}[\s\S]*?>Manage Ads<\/button>\s*<\/div>/;
const newAdminTabs = `<button onClick={() => setAdminTab('events')} className={\`flex-1 py-2 font-bold text-sm transition-colors \${adminTab === 'events' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-gray-600'}\`}>Manage Ads</button>
                    <button onClick={() => setAdminTab('rooms')} className={\`flex-1 py-2 font-bold text-sm transition-colors \${adminTab === 'rooms' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-gray-600'}\`}>Room Data Sync</button>
                  </div>`;
content = content.replace(adminTabsRegex, newAdminTabs);

// Inject panel as the new tab content inside Admin
const eventsTabRegex = /\{\/\* --- EVENTS \/ ADS TAB ---\*\/\}[\s\S]*?\{adminTab === 'events' && \([\s\S]*?<\/div>\s*\)\}/;
const newEventsTab = content.match(eventsTabRegex)?.[0] || "";
const roomsAdminTab = `\n                  {/* --- ROOMS SYNC TAB --- */}\n                  {adminTab === 'rooms' && (\n                    <div className="space-y-4 pt-2">\n${syncPanelCode.replace(/^/gm, '                      ')}\n                    </div>\n                  )}\n`;

content = content.replace(eventsTabRegex, newEventsTab + roomsAdminTab);

// Update initial state of adminTab if needed (optional)
content = content.replace(`const [adminTab, setAdminTab] = useState<'attendance' | 'events'>('attendance');`, `const [adminTab, setAdminTab] = useState<'attendance' | 'events' | 'rooms'>('attendance');`);

// 5. Remove the password modal entirely
const modalStartRegex = /\{\/\* ROOM SYNC PASSWORD MODAL \*\/\}[\s\S]*?\}\)/;
content = content.replace(modalStartRegex, "");

fs.writeFileSync('App.tsx', content);
console.log('Successfully updated App.tsx via Node!');
