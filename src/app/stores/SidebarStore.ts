import { Editor } from "app/editor/Editor";
import { action, computed, observable } from "mobx";
import React from "react";
import { InitializableStore } from "./Store";

export class SidebarStore extends InitializableStore
{
	@observable
	private _tabs: boolean[] = [];

	private _editor: Editor | null = null;

	public get editor()
	{
		if (!this._editor)
			this._editor = Editor.get();

		return this._editor;
	}

	protected init = (props: any) => {}

	public readonly loadTabs = (names: string[]) => React.useEffect(() =>  { this._tabs = names.map(t => false); }, []);

	public readonly isCollapsed = (i: number) =>
	{
		return false;
	}

	@action
	public readonly toggleCollapse = (i: number) => 
	{
		const t = [...this._tabs];
		t[i] = !t[i];
		this._tabs = t;
	}
}
