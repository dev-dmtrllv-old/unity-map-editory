import { action, computed, makeAutoObservable, observable } from "mobx";
import { observer } from "mobx-react-lite";
import React from "react";
import { CanvasRenderer } from "./CanvasRenderer";
import { Map } from "./Map"
import { showOpenDialog } from "app/dialogs/OpenDialog";
import { Vector2 } from "./Vector2";
import { Texture } from "./Texture";
import { MapTexture } from "./MapTexture";
import { utils } from "utils";

export class Editor
{
	public static readonly minZoom = 5;
	public static readonly maxZoom = 500;

	public static withStore<P extends {} = {}>(component: React.FC<P & { editor: Editor }>)
	{
		return (props: P) => React.createElement(observer(component), { ...props, editor: Editor._instance });
	}

	public onSelect = (index: number) => action((e: React.MouseEvent<Element, MouseEvent>) =>
	{
		if (this._openMaps[index] && (this._activeMap !== this._openMaps[index]))
			this.setActiveMap(this._openMaps[index]);
	});

	public onClose = (index: number) => action((e: React.MouseEvent<Element, MouseEvent>) =>
	{
		if (index <= this._openMaps.length - 1)
		{
			if (this.closeOpenMap(this._openMaps[index]))
			{
				e.preventDefault();
				e.stopPropagation();
				if (this._openMaps.length <= 0)
				{
					console.log("onClose")
					showOpenDialog({ createMap: false });
				}
			}
		}
	});

	
	private static _instance = new Editor();
	
	public static get() { return this._instance; };
	
	@observable
	private _openMaps: Map[] = [];
	
	@observable
	private _activeMap: Map | null = null;
	
	@observable
	private _selectedTextureIndex: number = -1;
	
	private _mouseDownPos: Vector2 | null = null;
	private _startPos: Vector2 = Vector2.zero;
	private _startOffset: Vector2 = Vector2.zero;
	private _zoomSensitivity: number = 8;
	private _mouseDownButton: -1 | 0 | 1 | 2 = -1;
	private _didMouseMoveOnClick: boolean = false;
	private _mouseClickCleanTimeout: NodeJS.Timeout | null = null;
	
	@computed
	public get projectTextures(): Texture[] { return this.activeMap?.project.textures || []; }

	@computed
	public get selectedTextureIndex() { return this._selectedTextureIndex; }

	public readonly canvasRenderer = new CanvasRenderer();

	private constructor()
	{
		this._activeMap = this._openMaps[0];
		window.addEventListener("mousemove", this.onMouseMove);
		window.addEventListener("mouseup", this.onMouseUp);
		window.addEventListener("wheel", this.onMouseWheel);
		makeAutoObservable(this);
	}

	@computed
	public get openMapNames() { return this._openMaps.map(m => m.name); }

	@computed
	public get activeMapName() { return this._activeMap?.name || ""; }

	@computed
	public get activeMap() { return this._activeMap; }

	public getMap(name: string): Map | null { return this._openMaps.find(m => m.name === name) || null; }

	public render()
	{
		if (this._activeMap)
			this.canvasRenderer.render(this._activeMap);
		else
			this.canvasRenderer.clear();
	}

	@action
	private setActiveMap = (map: Map) => 
	{
		if (this._activeMap !== map)
		{
			this._activeMap = map;
			this.render();
		}
	};

	@action
	public async addToOpenMaps(map: Map)
	{
		if (!this._openMaps.find(m => map === m))
		{
			this._openMaps = [...this._openMaps, map];
			if (!map.project.isLoaded)
				await map.project.load();
		}

		this.setActiveMap(map);
		this.render();
	}

	@action
	public closeOpenMap(map: Map)
	{
		const index = this._openMaps.indexOf(map);
		if (index > -1)
		{
			const maps = [...this._openMaps];
			maps.splice(index, 1);
			this._openMaps = maps;

			if (maps.length === 0)
				this._activeMap = null;
			else if (index > this._openMaps.length - 1)
				this._activeMap = this._openMaps[this._openMaps.length - 1];
			else
				this._activeMap = this._openMaps[index];

			this.selectTexture(-1);
			this.render();
			return true;
		}
	}

	public readonly onClick = (e: React.MouseEvent<HTMLCanvasElement>) =>
	{
		if (this._didMouseMoveOnClick)
		{
			this._didMouseMoveOnClick = false;
			return
		}

		const map = this._activeMap;

		if (map && (e.button === 0))
		{
			const pos = this.mouseToMap(e);
			map.selectObject(pos);
		}

		this._mouseDownPos = null;
		this._mouseDownButton = -1;
		this._startOffset = Vector2.zero;
		this._startPos = Vector2.zero;
		this.render();
	}

	public readonly onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => 
	{
		this._didMouseMoveOnClick = false;
		
		if(this._mouseClickCleanTimeout)
			clearTimeout(this._mouseClickCleanTimeout);
		
		const map = this._activeMap;
		if (map)
		{
			const pos = this.mouseToMap(e);

			this._mouseDownPos = Vector2.clone(pos);
			this._mouseDownButton = e.button as any;
			this._startPos = Vector2.clone(pos);
			if (e.button === 0 && map.selectedObject)
			{
				this._startOffset = Vector2.add(Vector2.sub(map.selectedObject.position, pos), map.offset);
				console.log(pos.serialize());
			}
			else if (e.button === 1)
				this._startOffset = map.offset;
		}
	}

	public readonly onMouseEnter = (e: React.MouseEvent) =>
	{
		const pos = this.mouseToMap(e);
		const map = this._activeMap;

		if (map && (this._selectedTextureIndex > -1))
		{
			this._mouseDownPos = Vector2.clone(pos);
			this._startPos = Vector2.clone(pos);
			this._mouseDownButton = 0;
			map.setSelectedObject(map.activeLayer.addTexture(map.project.textures[this._selectedTextureIndex], pos));
			this.selectTexture(-1);
			this.render();
		}
	}

	public readonly onMouseMove = (e: MouseEvent) => 
	{
		if (this._activeMap)
		{
			const map = this._activeMap;
			const pos = this.mouseToMap(e);

			if (this._mouseDownPos)
			{
				if (!this._didMouseMoveOnClick)
				{
					const x1 = this._mouseDownPos.x - 2;
					const x2 = this._mouseDownPos.x + 2;
					const y1 = this._mouseDownPos.y - 2;
					const y2 = this._mouseDownPos.y + 2;
					if (pos.x < x1 || pos.x > x2 || pos.y < y1 || pos.y > y2)
						this._didMouseMoveOnClick = true;
				}
				if ((this._mouseDownButton === 0) && map.selectedObject && (map.selectedObject instanceof MapTexture))
				{
					const offset = new Vector2(pos.x - this._mouseDownPos.x, pos.y - this._mouseDownPos.y);
					const { width, height } = map.selectedObject.texture.canvas;
					const e = new Vector2(width / 2, height / 2);

					let p = Vector2.round(Vector2.add(this._startPos, offset));

					let n = Vector2.add(this._startOffset, Vector2.add(p, Vector2.mul(map.offset, new Vector2(-1, -1))));

					if (!Number.isInteger(e.x))
						n.setX(n.x + 0.5);
					if (!Number.isInteger(e.y))
						n.setY(n.y + 0.5);

					map.selectedObject.setPosition(n);
				}
				else if (this._mouseDownButton === 1)
				{
					map.offset = Vector2.add(this._startOffset, Vector2.sub(pos, this._mouseDownPos));
				}
			}

			this.render();
		}
	}

	@action
	public readonly onMouseUp = (e: MouseEvent) => 
	{
		this._mouseDownPos = null;
		this._mouseDownButton = -1;
		this.selectTexture(-1);
		this._startPos = Vector2.zero;

		if(this._mouseClickCleanTimeout)
			clearTimeout(this._mouseClickCleanTimeout);
		this._mouseClickCleanTimeout = setTimeout(() => 
		{
			this._didMouseMoveOnClick = false;
		}, 120);
	}

	public readonly onMouseWheel = (e: WheelEvent) => 
	{
		if(this._mouseDownPos)
			return;

		const pos = this.mouseToMap(e);
		const map = this._activeMap;
		if (map)
		{
			const z = map.renderer.zoom;
			const d = (this._zoomSensitivity * -z * Math.sign(e.deltaY)) / 100;
			map.renderer.setZoom(utils.math.clamp(z + d, Editor.minZoom / 100, Editor.maxZoom / 100));

			this.render();
		}
	}

	// converts to canvas coordinates
	private mouseToMap(e: { clientX: number, clientY: number })
	{
		let zoom = 1;
		let ratio = 1;

		if (this._activeMap)
		{
			zoom = this._activeMap.renderer.zoom;
			ratio = this._activeMap.project.pixelRatio;
		}

		const z = zoom * ratio;

		const c = this.canvasRenderer.canvas!;
		let { x, y } = c.getBoundingClientRect();

		x = ((e.clientX - x - (c.width / 2)) / z);
		y = (((e.clientY - y - (c.height / 2)) * -1) / z);

		return new Vector2(x, y);
	}

	@action
	public readonly selectTexture = (i: number) =>
	{
		this._selectedTextureIndex = i;
	}
}
