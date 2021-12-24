import { action, computed, makeAutoObservable, observable } from "mobx";
import { Map } from "./Map";
import { MapTexture } from "./MapTexture";
import { Platform } from "./Platform";
import { Texture } from "./Texture";
import { Vector2 } from "./Vector2";

export class Layer
{
	public readonly map: Map;

	@observable
	private _platforms: Platform[] = [];

	@observable
	private _textures: MapTexture[] = [];

	@observable
	private _background: Texture | null = null;

	@computed
	public get platforms() { return [...this._platforms]; }

	@computed
	public get textures() { return [...this._textures]; }

	@computed
	private get background() { return this._background };

	@action	
	public addTexture(texture: Texture, position: Vector2 = Vector2.zero): MapTexture
	{
		const o = new MapTexture(this.map, texture, position);
		this._textures = [...this._textures, o];
		return o;
	}

	public constructor(map: Map)
	{
		this.map = map;
		makeAutoObservable(this);
	}

	@action
	public setBackground(texture: Texture)
	{
		this._background = texture;
	}
}
