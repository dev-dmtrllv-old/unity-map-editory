import { makeObservable } from "mobx";
import { GameObject } from "./GameObject";
import { Layer } from "./Layer";
import { Texture } from "./Texture";
import { Vector2 } from "./Vector2";

export class Platform extends GameObject
{	
	public constructor(layer: Layer, texture: Texture, position: Vector2 = Vector2.zero, layerIndex: number = 0)
	{
		super(layer, position, layerIndex, texture);
		makeObservable(this);
	}
}
