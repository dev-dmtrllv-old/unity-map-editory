import { MenuItem, MENU_SEPERATOR } from "./stores/MenuBarStore";
import { ipcRenderer } from "electron";
import { Editor } from "./editor/Editor";
import { showOpenDialog } from "./dialogs/OpenDialog";

export const MENU_ITEMS = [
	new MenuItem("File", [
		new MenuItem("New Map", () => showOpenDialog({ createMap: true, selectedProject: Editor.get().activeMap?.project })),
		MENU_SEPERATOR,
		new MenuItem("Open Map", () => showOpenDialog({ createMap: false, selectedProject: Editor.get().activeMap?.project })),
		new MenuItem("Open Recent Map", [
			new MenuItem("Test 123"),
			new MenuItem("Test 123"),
			new MenuItem("Test 123"),
		]),
		MENU_SEPERATOR,
		new MenuItem("Save Map", []),
		new MenuItem("Save Map As...", []),
	]),
	new MenuItem("Edit", []),
	new MenuItem("View", [
		new MenuItem("Toggle Developer Window", () => ipcRenderer.send("toggle-dev-window")),
	]),
	new MenuItem("Help", [
		new MenuItem("Reload", () => ipcRenderer.send("reload"))
	]),
];
