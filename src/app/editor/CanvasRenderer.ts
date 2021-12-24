import React from "react";
import { Editor } from "./Editor";
import { Map } from "./Map";

export class CanvasRenderer
{
	public readonly canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();

	public get canvas() { return this.canvasRef.current; }

	private _gl: WebGLRenderingContext | null = null;

	public get gl()
	{
		if (!this._gl)
			throw new Error(`WebGL2 is not initialized yet!`);
		return this._gl;
	}

	public constructor() { }

	public onMount()
	{
		if (this.canvas && this.canvas.parentElement)
		{
			const gl = this.canvas.getContext("webgl2", {
				alpha: true,
				desynchronized: false,
				antialias: false,
				powerPreference: "high-performance",
				preserveDrawingBuffer: true,
			});

			if (!gl)
				throw new Error();

			this._gl = gl;

			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			// gl.imageSmoo

			this.resizeObserver.observe(this.canvas.parentElement);

			this.onResize();
		}
	}

	public onUnmount = () =>
	{
		this._gl = null;
	}

	private onResize()
	{
		if (this.canvas && this.canvas.parentElement)
		{
			const editor = Editor.get();
			const p = this.canvas.parentElement;

			this.canvas.style.width = (this.canvas.width = p.clientWidth) + "px";
			this.canvas.style.height = (this.canvas.height = p.clientHeight) + "px";

			this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

			editor.render();
		}
	}

	private readonly resizeObserver = new ResizeObserver((entries, observer) => 
	{
		this.onResize();
	});

	public clear()
	{
		if (this.gl)
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	}

	public render(map: Map)
	{
		if (this.gl)
		{
			const gl = this.gl;
			gl.clearDepth(1.0);

			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);

			this.clear();

			map.renderer.render(this);
		}
	}
}
