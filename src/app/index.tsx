import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { OpenDialog } from "./dialogs/OpenDialog";
import { Editor } from "./editor/Editor";
import { MENU_ITEMS } from "./menu-items";
import { DialogStore } from "./stores/DialogStore";
import { MenuBarStore } from "./stores/MenuBarStore";
import { OpenDialogStore } from "./stores/OpenDialogStore";
import { RootStore } from "./stores/RootStore";
import { SidebarStore } from "./stores/SidebarStore";

const exec = (callback: Function) => callback();

new Promise(() => 
{
	
}).then(() => 
{
	debugger;
}).catch(console.error);

exec(async () => 
{
	const root = document.createElement("div");
	root.id = "root";

	document.body.appendChild(root);

	RootStore.init(MenuBarStore, MENU_ITEMS);
	RootStore.init(OpenDialogStore, {});
	RootStore.init(DialogStore, {
		open: true,
		component: OpenDialog,
		title: "Open Map",
		options: {
			closable: Editor.get().openMapNames.length > 0
		},
		size: {
			max: {
				width: "920px",
				height: "720px"
			}
		}
	});
	RootStore.init(SidebarStore, {});

	try
	{
		ReactDOM.render(<App />, root);
	}
	catch (e)
	{
		console.error(e);
	}
});
