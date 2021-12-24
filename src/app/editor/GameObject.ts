import { action, computed, makeObservable, observable } from "mobx";
import { Layer } from "./Layer";
import { Texture } from "./Texture";
import { Vector2 } from "./Vector2";

export class GameObject
{
	public readonly layer: Layer;

	private _layerIndex: number = 0;

	public get layerIndex() { return this._layerIndex; };

	@observable
	private _name: string = "Game Object";

	@observable
	private _texture: Texture | null = null;

	@computed
	public get name() { return this._name; }

	@computed
	public get texture() { return this._texture; }

	@observable
	public position: Vector2 = Vector2.zero;

	@action
	public setPosition(position: Vector2)
	{
		this.position = position;
	}

	@action
	public setLayerIndex(index: number)
	{
		if (this.layer.changeLayerIndex(this._layerIndex, index))
			this._layerIndex = index;
	}

	@computed
	public get size()
	{
		return this.texture ? new Vector2(this.texture.canvas.width, this.texture.canvas.height) : new Vector2(8, 8);
	}

	@computed
	public get extent()
	{
		return new Vector2(this.size.x / 2, this.size.y / 2);
	}

	public constructor(layer: Layer, position: Vector2 = Vector2.zero, layerIndex: number = 0, texture: Texture | null = null)
	{
		this.layer = layer;
		this.position = Vector2.clone(position);
		this._layerIndex = layerIndex;
		this._texture = texture;

		makeObservable(this);
	}
}
