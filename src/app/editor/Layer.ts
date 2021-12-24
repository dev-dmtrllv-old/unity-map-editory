import { action, computed, makeAutoObservable, observable } from "mobx";
import { GameObject } from "./GameObject";
import { Map } from "./Map";
import { Platform } from "./Platform";
import { Texture } from "./Texture";
import { Vector2 } from "./Vector2";

export class Layer
{
	public readonly map: Map;

	private _gameObjects: (GameObject | undefined)[] = [];

	@observable
	private _platforms: Platform[] = [];

	@observable
	private _textures: GameObject[] = [];

	@observable
	private _background: Texture | null = null;

	@computed
	public get platforms() { return [...this._platforms]; }

	@computed
	public get textures() { return [...this._textures]; }

	@computed
	private get background() { return this._background };

	private _lastGameObjectIndex: number = -1;

	public changeLayerIndex(from: number, to: number)
	{
		if(!this._gameObjects[to])
		{
			this._gameObjects[to] = this._gameObjects[from];
			this._gameObjects[from] = undefined;

			if(from === this._lastGameObjectIndex && to < from)
			{
				for(let i = from - 1; i >= 0; i--)
				{
					if(this._gameObjects[i])
					{
						this._lastGameObjectIndex = i;
						break;
					}
				}
			}
			return true;
		}
		return false;
	}

	private removeGameObject(o: GameObject)
	{
		this._gameObjects[o.layerIndex] = undefined;
	}

	@action	
	public addTexture(texture: Texture, position: Vector2 = Vector2.zero): GameObject
	{
		const o = new GameObject(this, position, ++this._lastGameObjectIndex, texture);
		this._gameObjects.push(o);
		this._textures = [...this._textures, o];
		return o;
	}

	@action
	public removeTexture(texture: GameObject)
	{
		this.removeGameObject(texture);

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
