const CONTENT_FOLDER = "content";
const DEBUG = true;

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

/**
 * @type {BrowserWindow}
 */
let win;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            devTools: DEBUG
        },
        frame: false,
        minWidth: 400,
        minHeight: 250
    });

    win.loadFile(path.join(__dirname, CONTENT_FOLDER, "index.html"));
    //win.webContents.openDevTools();
    win.on('closed', () => {
        win = null;
    });
    win.once('focus', () => win.flashFrame(false));
    win.flashFrame(true);
}

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if(win === null) {
        createWindow();
    }
});

ipcMain.on('systemcall', function(event, message) {
    switch(message) {
        case "shutdown":
            app.quit();
            break;
        
        case "minimize":
            if(!win.isMinimized()) {
                win.minimize();
            }
            break;

        case "maximize":
            if(win.isMaximized())
                win.unmaximize();
            else
                win.maximize();
    }
});

app.on('ready', createWindow);