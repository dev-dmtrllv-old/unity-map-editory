import { action, computed, makeAutoObservable, makeObservable, observable } from "mobx";
import { Texture } from "./Texture";
import { Vector2 } from "./Vector2";
import { Editor } from "./Editor";
import { GameObject } from "./GameObject";
import { Map } from "./Map";

export class MapTexture extends GameObject
{
	public readonly glTexture: WebGLTexture;

	@observable
	private _texture: Texture;

	@computed
	public get texture() { return this._texture }

	@action
	public setTexture(texture: Texture) { this._texture = texture; }

	public constructor(map: Map, texture: Texture, position: Vector2 = Vector2.zero, layerIndex: number = 0)
	{
		super(map, position, layerIndex);

		this._texture = texture;
		
		const gl = Editor.get().canvasRenderer.gl;

		const t = gl.createTexture();

		if (!t)
			throw new Error();

		gl.bindTexture(gl.TEXTURE_2D, t);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._texture.canvas);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.bindTexture(gl.TEXTURE_2D, null);

		this.glTexture = t;

		makeObservable(this);
	}
}
