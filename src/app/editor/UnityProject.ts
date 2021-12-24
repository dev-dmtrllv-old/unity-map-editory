import { Map } from "./Map";
import path from "path";
import fs from "fs";
import { action, computed, makeAutoObservable, observable } from "mobx";
import { utils } from "utils";
import { Serializable, SerializedType } from "app/Serializable";
import { Texture } from "./Texture";
import { Editor } from "./Editor";

export type UnityProjectSettingsProps = {
	spriteDir: string;
	prefabDir: string;
	exportDir: string;
	ignoreAssetDirs: string[];
	pixelRatio: number;
};

export class UnityProjectSettings
{
	private static readonly FILE_NAME = "map-editor-settings.json";

	private static readonly defaultSettings: UnityProjectSettingsProps = {
		prefabDir: "Prefabs",
		spriteDir: "Sprites",
		exportDir: "MapExports",
		ignoreAssetDirs: [
			"TextMesh Pro"
		],
		pixelRatio: 4
	};

	private readonly path: string;

	@observable
	private _settings: UnityProjectSettingsProps;


	public constructor(projectPath: string)
	{
		this.path = path.resolve(projectPath, UnityProjectSettings.FILE_NAME);
		if (!fs.existsSync(this.path))
		{
			this._settings = UnityProjectSettings.defaultSettings;
			this.updateAndSave(this._settings);
		}
		else
		{
			this._settings = JSON.parse(fs.readFileSync(this.path, "utf-8"));
			if (!utils.arrayEquals(Object.keys(this._settings), Object.keys(UnityProjectSettings.defaultSettings)))
			{
				this._settings = { ...UnityProjectSettings.defaultSettings, ...this._settings };
				this.updateAndSave(this._settings);
			}
		}
		makeAutoObservable(this);
	}

	public update(settings: Partial<UnityProjectSettingsProps>)
	{
		if (!utils.objectEquals(this._settings, settings))
			this.updateAndSave(settings);
	}

	@action
	private updateAndSave(settings: Partial<UnityProjectSettingsProps>)
	{
		this._settings = { ...this._settings, ...settings };
		fs.writeFileSync(this.path, JSON.stringify(this._settings), "utf-8");
	}

	public get<K extends keyof UnityProjectSettingsProps>(key: K): UnityProjectSettingsProps[K]
	{
		return this._settings[key];
	}
}

export class UnityProject implements Serializable<SerializedUnityProjectData>
{
	public readonly name: string;
	public readonly path: string;

	private _isLoaded: boolean = false;

	public readonly settings: UnityProjectSettings;

	public get isLoaded() { return this._isLoaded; }

	@observable
	private _textures: Texture[] = [];

	@computed
	public get textures() { return [...this._textures]; }

	@observable
	private _maps: Map[] = [];

	@computed
	public get maps() { return [...this._maps]; }

	@computed
	public get pixelRatio() { return this.settings.get("pixelRatio"); }

	public readonly getAssetsPath = (p: "prefab" | "sprite" | "map-exports") => 
	{
		let name: keyof UnityProjectSettingsProps;
		switch (p)
		{
			case "prefab":
				name = "prefabDir";
				break;
			case "map-exports":
				name = "exportDir";
				break;
			case "sprite":
				name = "spriteDir";
				break;
		}
		return path.resolve(this.path, "Assets", this.settings.get(name));
	}

	public constructor(name: string, projectPath: string)
	{
		this.name = name;
		this.path = projectPath;
		this.settings = new UnityProjectSettings(this.path);

		const exportDir = this.getAssetsPath("map-exports");

		if (!fs.existsSync(exportDir))
			fs.mkdirSync(exportDir, { recursive: true });
		else
			fs.readdirSync(exportDir).map(file => 
			{
				if (file.endsWith(".json"))
				{
					const name = file.substring(0, file.length - 5);
					this.addMap(name);
				}
			});

		makeAutoObservable(this);
	}

	@action
	public async load()
	{
		if (!this.isLoaded)
		{
			await this.checkAssetFiles();
			this._isLoaded = true;
		}
	}

	private async checkAssetFiles()
	{
		const ignoreDirs = [...this.settings.get("ignoreAssetDirs")];

		const walk = (basePath: string, paths: string[], onFile: (path: string) => void) =>
		{
			paths.forEach((p) => 
			{
				if (!ignoreDirs.includes(p))
				{
					const _p = path.resolve(basePath, p);
					if (fs.statSync(_p).isFile())
						onFile(_p);
					else
						walk(_p, fs.readdirSync(_p, {}) as string[], onFile);
				}
			});
		}

		const base = path.resolve(this.path, "Assets");
		const paths = fs.readdirSync(base, {}) as string[];

		const textures: Texture[] = [];

		walk(base, paths, (file) => 
		{
			if (file.endsWith(".png"))
			{
				textures.push(Texture.get(file))
			}
		});

		await Promise.all(textures.map(t => t.load(Editor.get().canvasRenderer.gl)));

		this._textures = textures;
	}


	public parse({ name, path }: SerializedType<SerializedUnityProjectData>)
	{
		return { name, path };
	}

	public serialize(): SerializedType<SerializedUnityProjectData>
	{
		return {
			name: this.name,
			path: this.path
		};
	}

	public addMap(name: string): Map;
	public addMap(name: string, width: number, height: number): Map;
	@action
	public addMap(name: string, width?: number, height?: number): Map
	{
		if (this._maps.find(m => m.name === name))
			throw new Error(`There is already a map with the name "${name}"!`);

		const p = path.resolve(this.getAssetsPath("map-exports"), name + ".json");;

		let map: Map;

		if (!fs.existsSync(p))
		{
			map = new Map(this, name, p, width!, height!);
			fs.writeFileSync(p, JSON.stringify(map.serialize()), "utf-8");
		}
		else
		{
			map = new Map(this, name, p);
			map.parse(JSON.parse(fs.readFileSync(p, "utf-8")));
		}

		this._maps = [...this._maps, map];

		return map;
	}

	public removeMap(name: string)
	{
		const foundMap = this.maps.find(m => m.name === name);
		if (foundMap)
		{
			if (fs.existsSync(foundMap.path))
				fs.unlinkSync(foundMap.path);

			const index = this.maps.indexOf(foundMap);
			if (index > -1)
			{
				const maps = [...this.maps];
				maps.splice(index, 1);
				this._maps = maps;
			}
		}
	}

	public renameMapFile(map: Map, name: string): string
	{
		const newPath = path.resolve(this.getAssetsPath("map-exports"), name + ".json");
		fs.renameSync(map.path, newPath);
		return newPath;
	}

	public cloneMap(map: Map)
	{
		let cloneNum = 1;
		let failed = true;
		while (failed)
		{
			try
			{
				this.addMap(map.name + "-" + (cloneNum++), map.size.x, map.size.y);
				failed = false;
			}
			catch (e)
			{

			}
		}
	}
}

type SerializedUnityProjectData = {
	name: string;
	path: string;
};
