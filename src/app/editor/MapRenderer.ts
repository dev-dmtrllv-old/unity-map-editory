import { Editor } from "./Editor";
import { GLBuffer } from "./GLBuffer";
import { Map } from "./Map"
import { Shader } from "./Shader";
import { DefaultShader } from "./shaders/DefaultShader";
import { Vector2 } from "./Vector2";
import { CanvasRenderer } from "./CanvasRenderer";
import { action, observable } from "mobx";
import { Texture } from "./Texture";

export class MapRenderer
{
	public readonly map: Map;

	private get shader() { return Shader.get(DefaultShader); }

	private _buffer: GLBuffer | null = null;

	@observable
	private _zoom: number = 1;

	public get zoom() { return this._zoom; }

	@action
	public setZoom(zoom: number) { return this._zoom = zoom; }

	public get buffer()
	{
		if (!this._buffer)
		{
			const w = this.map.size.x / 2;
			const h = this.map.size.y / 2;
			this._buffer = new GLBuffer(Editor.get().canvasRenderer.gl, [
				new Vector2(-w, h),
				new Vector2(w, h),
				new Vector2(-w, -h),
				new Vector2(w, -h),
			]);
		}
		return this._buffer as GLBuffer;
	}

	public constructor(map: Map)
	{
		this.map = map;
	}

	public render(canvasRenderer: CanvasRenderer)
	{
		const { gl, canvas } = canvasRenderer;

		this.shader.use();

		this.shader.setAttributeBuffer("aVertexPosition", this.buffer);
		gl.uniform1f(this.shader.getUniformLocation("uPixelRatio"), this.map.project.pixelRatio);
		gl.uniform1f(this.shader.getUniformLocation("uZoom"), this.zoom);
		gl.uniform1f(this.shader.getUniformLocation("uRenderTexture"), 0.0);

		gl.uniform2fv(this.shader.getUniformLocation("uCanvasSize"), [canvas?.width || 0, canvas?.height || 0]);
		gl.uniform2fv(this.shader.getUniformLocation("uPosition"), [0, 0]);
		gl.uniform4fv(this.shader.getUniformLocation("uColor"), [1, 1, 1, 1]);
		gl.uniform2fv(this.shader.getUniformLocation("uMapOffset"), [this.map.offset.x, this.map.offset.y]);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.uniform1f(this.shader.getUniformLocation("uRenderTexture"), 1.0);

		this.map.layers.forEach(layer => 
		{
			layer.textures.forEach(({ position, texture }) => 
			{
				if (texture)
				{
					const { x, y } = position;

					this.shader.setAttributeBuffer("aVertexPosition", texture.sizeBuffer);
					this.shader.setAttributeBuffer("aUVPosition", texture.uvBuffer);
					gl.activeTexture(gl.TEXTURE0);
					gl.bindTexture(gl.TEXTURE_2D, texture.glTexture);
					gl.uniform1i(this.shader.getUniformLocation("uSampler"), 0);
					gl.uniform2fv(this.shader.getUniformLocation("uPosition"), [x, y]);

					gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
				}
			});
		});

		if (this.map.selectedObject?.texture)
		{
			const { texture, position } = this.map.selectedObject;

			this.shader.setAttributeBuffer("aVertexPosition", texture.selectionBuffer);
			this.shader.setAttributeBuffer("aUVPosition", texture.uvBuffer);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture.glTexture);
			gl.uniform1i(this.shader.getUniformLocation("uSampler"), 0);
			gl.uniform2fv(this.shader.getUniformLocation("uPosition"), [position.x, position.y]);
			gl.uniform1f(this.shader.getUniformLocation("uSelectionRender"), 1);
			gl.drawArrays(gl.LINE_LOOP, 0, 4);
			gl.uniform1f(this.shader.getUniformLocation("uSelectionRender"), 0);
			gl.uniform4fv(this.shader.getUniformLocation("uSelectionColor"), [1.0, 0.2, 0.2, 1]);
		}

		gl.disable(gl.BLEND);
	}
}
