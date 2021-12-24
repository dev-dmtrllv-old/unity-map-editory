import { Editor } from "./Editor";
import { Vector2 } from "./Vector2";

export class GLBuffer
{
	public use(gl: WebGLRenderingContext)
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	}

	private static _defaultBuffer: GLBuffer | null = null;

	public static get defaultBuffer(): GLBuffer
	{
		if (!this._defaultBuffer)
		{
			this._defaultBuffer = new GLBuffer(Editor.get().canvasRenderer.gl, [
				new Vector2(1.0, 1.0),
				new Vector2(-1.0, 1.0),
				new Vector2(1.0, -1.0),
				new Vector2(-1.0, -1.0),
			]);
		}
		return this._defaultBuffer as GLBuffer;
	}

	private static _defaultUVBuffer: GLBuffer | null = null;

	public static get defaultUVBuffer(): GLBuffer
	{
		if (!this._defaultUVBuffer)
		{
			this._defaultUVBuffer = new GLBuffer(Editor.get().canvasRenderer.gl, [
				new Vector2(1, 0),
				new Vector2(0, 0),
				new Vector2(1, 1),
				new Vector2(0, 1),
			]);
		}
		return this._defaultUVBuffer as GLBuffer;
	}

	public readonly buffer: WebGLBuffer;

	public constructor(gl: WebGLRenderingContext, positions: Vector2[])
	{
		const b = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, b);

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions.map(p => [p.x, p.y]).flat()), gl.STATIC_DRAW);

		this.buffer = b;
	}
}
