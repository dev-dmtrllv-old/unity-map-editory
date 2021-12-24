import { UnityProject } from "app/editor/UnityProject";
import { ipcRenderer } from "electron";
import { action, computed, observable } from "mobx";
import fs from "fs";
import path from "path";
import { SerializableStore } from "./SerializableStore";
import { SerializedType } from "app/Serializable";
import { RootStore } from "./RootStore";
import { DialogStore, IDialogStore } from "./DialogStore";
import { Editor } from "app/editor/Editor";
import { Map } from "app/editor/Map";

const defaultInputValues: Required<CreateMapInputs> = {
	name: "",
	width: "640",
	height: "480",
};

export class OpenDialogStore extends SerializableStore<SerializableData> implements IDialogStore<OpenArgs>
{
	@action
	public onShow = (args: OpenArgs): void =>
	{
		this.showCreateMapPanel(args.createMap || false);
		this._selected = args.selectedProject ? (this.projects.indexOf(args.selectedProject) || 0) : 0;
	}

	@action
	public onClose = (): void =>
	{
		this.showCreateMapPanel(false);
		this.resetInputValues();
	}

	protected get defaultData(): SerializableData
	{
		return {
			recentProjects: []
		};
	}

	@observable
	private _editMapTarget: Map | null = null;

	@observable
	private _createProps: CreateMapInputs = defaultInputValues;

	@observable
	private _selected: number = 0;

	@observable
	private _selectedDropdown: number = -1;

	@observable
	private _isCreatePanelShown: boolean = false;

	@observable
	private _createMapErrors: string[] = [];

	@computed
	public get createMapErrors() { return [...this._createMapErrors]; }

	@computed
	public get selectedDropdown() { return this._selectedDropdown; }

	@computed
	public get createInputValues() { return this._createProps; }

	@computed
	public get projects() { return this.get("recentProjects"); }

	@computed
	public get hasProjects() { return this.projects.length !== 0; }

	@computed
	public get hasSelectedProjectMaps()
	{
		if (!this.selectedProject)
			return false;
		return this.selectedProject.maps.length !== 0;
	}

	@computed
	public get isCreatePanelShown() { return this._isCreatePanelShown || !this.hasSelectedProjectMaps || (this._editMapTarget !== null); }

	@computed
	public get selectedProject(): UnityProject | null { return this.projects.length === 0 ? null : this.projects[this._selected] };

	@computed
	public get sliderLeftStyle(): string
	{
		return (this._isCreatePanelShown || !this.hasSelectedProjectMaps) ? "-100%" : "-0%";
	}

	@computed
	public get isEditing() { return this._editMapTarget !== null; }

	protected onInit = () => 
	{
		window.addEventListener("click", (e) => this.onClick(e));
	}

	@action
	private onClick = (e: MouseEvent) =>
	{
		if (this.selectedDropdown > -1)
		{
			this._selectedDropdown = -1;
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
		}

	}

	public readonly openProject = async () =>
	{
		const info: DirInfo = await ipcRenderer.invoke("open-dir");
		if (!info.canceled)
		{
			const dir = info.filePaths[0];
			if (!this.get("recentProjects").find(p => p.path === dir))
			{
				fs.readdir(dir, (err, files: string[]) => 
				{
					if (!files.includes("UnityEditor.UI.csproj"))
					{
						// SHOW ERROR
					}
					else
					{
						this.addProject(dir);
					}
				});
			}
		}
	}

	public serialize(): SerializedType<SerializableData>
	{
		return {
			recentProjects: this.get("recentProjects").map(({ name, path }) => ({ name, path }))
		}
	}

	public parse(data: SerializedType<SerializableData>): SerializableData
	{
		return {
			recentProjects: data.recentProjects.map(r => new UnityProject(r.name, r.path))
		};
	}

	@action
	public selectMapDropdown = (index: number) => 
	{
		if (this._selectedDropdown === index)
			this._selectedDropdown = -1;
		else
			this._selectedDropdown = index
	};

	@action
	private addProject(dir: string)
	{
		this.update("recentProjects", (data) => 
		{
			if (!data)
				data = [];
			data.push(new UnityProject(path.basename(dir), dir));
			return data;
		});
	}

	@action
	public readonly selectProject = (id: number) => 
	{
		if ((this._selectedDropdown === -1) && (id !== this._selected))
		{
			this._selected = id;
			if (!this.hasSelectedProjectMaps)
			{
				this.showCreateMapPanel(true);
			}
			else if (this._isCreatePanelShown)
			{
				this.showCreateMapPanel(false);
			}
		}
	};

	@action
	public readonly showCreateMapPanel = (val: boolean) => 
	{
		this._isCreatePanelShown = val;

		if (!val)
		{
			this.resetInputValues();
			this._editMapTarget = null;
		}
	};

	@action
	public createMap = (values: CreateMapInputs) => 
	{
		let errors = [];

		if (!this.selectedProject)
			errors.push(`No project is selected!`);

		if (!values.name)
			errors.push(`No name is provided for the map!`);
		else if (!this.isEditing && this.selectedProject?.maps.find(m => m.name === values.name))
			errors.push(`There already is an map with the name ${values.name}`);

		if (Number(values.width) <= 0)
			errors.push(`Invalid width!`);
		if (Number(values.height) <= 0)
			errors.push(`Invalid height!`);


		if (errors.length === 0 && this.selectedProject)
		{
			if (this._editMapTarget)
			{
				this._editMapTarget.edit(values as any);
				this.showCreateMapPanel(false);
			}
			else
			{
				const { name, width, height } = values as Required<CreateMapInputs>;
				this._createMapErrors = [];
				try 
				{
					this.openMap(this.selectedProject.addMap(name, +width, +height));
				}
				catch (e)
				{
					errors.push(e);
					this._createMapErrors = errors;
				}
			}
		}
		else
		{
			this._createMapErrors = errors;
		}
	}

	@action
	public updateInputValues = (key: string, value: string) =>
	{
		this._createProps = { ...this._createProps, [key]: value };
	}

	@action
	public resetInputValues = () => { this._createProps = defaultInputValues; }

	@action
	public removeError = (index: number) => 
	{
		const errors = [...this._createMapErrors];
		errors.splice(index, 1);
		this._createMapErrors = errors;
	}

	@action
	public openMap = (map: Map) =>
	{
		if (this._selectedDropdown === -1)
		{
			this.resetInputValues();
			Editor.get().addToOpenMaps(map);
			this.showCreateMapPanel(false);
			RootStore.get(DialogStore).close(true);
		}
	}

	@action
	public removeMap = (map: Map) =>
	{
		map.project.removeMap(map.name);
		this._selectedDropdown = -1;
	}

	@action
	public editMap = (map: Map) =>
	{
		this._editMapTarget = map;
		this._createProps = {
			name: map.name,
			width: String(map.size.x),
			height: String(map.size.y),
		};
		this._selectedDropdown = -1;
	}

	@action
	public duplicateMap(map: Map)
	{
		this.selectedProject?.cloneMap(map);
		this._selectedDropdown = -1;
	}
}

type DirInfo = {
	canceled: boolean;
	filePaths: string[];
};

type CreateMapInputs = {
	name?: string;
	width?: string;
	height?: string;
};

type SerializableData = {
	recentProjects: UnityProject[];
};

type OpenArgs = {
	selectedProject?: UnityProject;
	createMap?: boolean;
};
