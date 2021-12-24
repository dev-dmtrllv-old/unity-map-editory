import { action, makeAutoObservable, makeObservable, observable } from "mobx";
import { Map } from "./Map";
import { MapTexture } from "./MapTexture";
import { Texture } from "./Texture";
import { Vector2 } from "./Vector2";

export class Platform extends MapTexture
{	
	public constructor(map: Map, texture: Texture, position: Vector2 = Vector2.zero, layerIndex: number = 0)
	{
		super(map, texture, position, layerIndex);
		makeObservable(this);
	}
}
