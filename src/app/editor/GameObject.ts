import { action, makeAutoObservable, makeObservable, observable } from "mobx";
import { Map } from "./Map";
import { Vector2 } from "./Vector2";

export abstract class GameObject
{
	public readonly map: Map;

	private _layerIndex: number = 0;

	public get layerIndex() { return this._layerIndex; };

	@observable
	public position: Vector2 = Vector2.zero;

	@action
	public setPosition(position: Vector2)
	{
		this.position = position;
	}

	public constructor(map: Map, position: Vector2 = Vector2.zero, layerIndex: number = 0)
	{
		this.map = map;
		this.position = Vector2.clone(position);
		this._layerIndex = layerIndex; 
		
		makeObservable(this);
	}
}
