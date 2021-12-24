import { app, BrowserWindow, dialog, ipcMain } from "electron";
import fs from "fs";

(process.env as any)["ELECTRON_DISABLE_SECURITY_WARNINGS"] = true;

let win: BrowserWindow;
let isReady = false;

app.whenReady().then(async () => 
{
	win = new BrowserWindow({
		title: "Dark Descent - Map Editor",
		show: false,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	win.setMenu(null);

	await win.loadFile("./dist/app/index.html");

	win.show();
	win.webContents.openDevTools();
});

ipcMain.on("ready", (e, ...args) => 
{
	if (!isReady)
	{
		isReady = true;
		win.maximize();
		win.show();
		win.webContents.openDevTools();
		fs.watch("./dist/app/js", {}, () => win.webContents.reload());
		fs.watch("./dist/app/css", {}, () => win.webContents.reload());
		fs.watch("./dist/app/index.html", {}, () => win.webContents.reload());
	}
});

ipcMain.on("toggle-dev-window", () => 
{
	if (!win.webContents.isDevToolsOpened())
		win.webContents.openDevTools();
	else
		win.webContents.closeDevTools();
});

ipcMain.handle("open-dir", async (e) => await dialog.showOpenDialog(BrowserWindow.fromWebContents(e.sender), { properties: ["openDirectory"] }));

ipcMain.on("reload", (e) => 
{
	e.sender.reload();
});

app.on("quit", () => app.quit());
