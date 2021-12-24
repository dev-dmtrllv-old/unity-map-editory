import fs from "fs";
import path, { basename } from "path";
import { GLBuffer } from "./GLBuffer";
import { Vector2 } from "./Vector2";

export class Texture
{
	private static readonly textures: { [path: string]: Texture } = {};

	public static get(path: string): Texture
	{
		let t = this.textures[path]
		if (!t)
		{
			t = new Texture(path);
			this.textures[path] = t;
		}
		return t;
	}

	public readonly path: string;

	private readonly _img: HTMLImageElement = document.createElement("img");

	public readonly canvas: HTMLCanvasElement = document.createElement("canvas");

	private _sizeBuffer: GLBuffer | null = null;

	public get sizeBuffer() { return this._sizeBuffer || GLBuffer.defaultBuffer; }

	private _uvBuffer: GLBuffer | null = null;

	public get uvBuffer() { return this._uvBuffer || GLBuffer.defaultUVBuffer; }

	private _name: string = "";

	public get name() { return this._name; }

	private _base64: string = "";

	public get base64() { return this._base64; }

	public get dataString() { return this.base64.length > 0 ? this.base64 : this.path; }

	private _isLoaded: boolean = false;
	private _spriteInfo: SpriteInfo | null = null;

	public get isLoaded() { return this._isLoaded; }

	private readonly metaInfo: string[];

	private constructor(path: string)
	{
		this.path = path;
		this._name = basename(path);
		const metaPath = path + ".meta";

		this.metaInfo = fs.existsSync(metaPath) ? fs.readFileSync(metaPath, "utf-8").split(/(\n|\r)/g) : [];

		this._spriteInfo = this.getSpriteInfo();
		if (this._spriteInfo)
			this._name = this._spriteInfo.name;
	}

	private getSpriteInfo(): SpriteInfo | null
	{
		const l = this.getMetaLine("sprites");
		if (l)
		{
			let name = "";
			let x = -1;
			let y = -1;
			let width = -1;
			let height = -1;

			if (!l.includes("[]"))
			{
				let i = this.metaInfo.indexOf(l) + 1;
				for (; i < this.metaInfo.length; i++)
				{
					const line = this.metaInfo[i];

					if ((x === -1) && line.includes("x:"))
					{
						x = Number(line.substring(line.indexOf("x:") + 2, line.length));
					}
					else if ((y === -1) && line.includes("y:"))
					{
						y = Number(line.substring(line.indexOf("y:") + 2, line.length));
					}
					else if ((width === -1) && line.includes("width:"))
					{
						// console.log(line.substring(line.indexOf("width:") + 6, line.length))
						width = Number(line.substring(line.indexOf("width:") + 6, line.length));
					}
					else if ((height === -1) && line.includes("height:"))
					{
						height = Number(line.substring(line.indexOf("height:") + 7, line.length));
					}
					else if (name.length === 0 && line.includes("name:"))
					{
						name = line.substring(line.indexOf("name:") + 5, line.length - 1).trimStart().trimEnd();
					}

					if (x !== -1 && y !== -1 && name.length !== 0 && width !== -1 && height !== -1)
						break;
				}
			}

			if (x !== -1 && y !== -1 && name.length !== 0 && width !== -1 && height !== -1)
			{
				return {
					x, y, width, height, name
				};
			}
		}
		return null;
	}

	private getImageData(): string
	{
		if (this._spriteInfo)
		{
			const canvas = document.createElement("canvas");

			canvas.style.width = (canvas.width = this._img.width) + "px";
			canvas.style.height = (canvas.height = this._img.height) + "px";

			const ctx = canvas.getContext("2d", {})!;
			ctx.imageSmoothingEnabled = false;
			ctx.imageSmoothingQuality = "low";
			ctx.drawImage(this._img, 0, 0);

			const id = ctx.getImageData(this._spriteInfo.x, this._img.height - (this._spriteInfo.y + this._spriteInfo.height), this._spriteInfo.width, this._spriteInfo.height, { colorSpace: "srgb" });

			const ctx2 = this.canvas.getContext("2d")!;
			ctx2.imageSmoothingEnabled = false;
			ctx2.imageSmoothingQuality = "low";

			this.canvas.style.width = (this.canvas.width = this._spriteInfo.width) + "px";
			this.canvas.style.height = (this.canvas.height = this._spriteInfo.height) + "px";

			ctx2.putImageData(id, 0, 0);
			return this.canvas.toDataURL("image/png");
		}
		else
		{
			this.canvas.style.width = (this.canvas.width = this._img.width) + "px";
			this.canvas.style.height = (this.canvas.height = this._img.height) + "px";

			const ctx = this.canvas.getContext("2d", {})!;
			ctx.imageSmoothingEnabled = false;
			ctx.imageSmoothingQuality = "low";
			ctx.drawImage(this._img, 0, 0);

			return this.canvas.toDataURL("image/png");
		}
	}

	public getMetaLine(key: string)
	{
		return this.metaInfo.find((s, _i) => s.trimStart().startsWith(key));
	}

	public load(gl: WebGLRenderingContext)
	{
		return new Promise<void>((resolve, reject) => 
		{
			if (!this._isLoaded)
			{
				this._img.onload = () =>
				{
					this._isLoaded = true;
					this._base64 = this.getImageData();

					const w = (this._spriteInfo ? this._spriteInfo.width : this._img.width) / 2;
					const h = (this._spriteInfo ? this._spriteInfo.height : this._img.height) / 2;

					this._sizeBuffer = new GLBuffer(gl, [
						new Vector2(w, h),
						new Vector2(-w, h),
						new Vector2(w, -h),
						new Vector2(-w, -h),
					]);

					this._uvBuffer = GLBuffer.defaultUVBuffer;

					resolve();
				};
				this._img.onerror = reject;
				this._img.src = this.path;
			}
			else
			{
				resolve();
			}
		});
	}

	public render(gl: WebGLRenderingContext)
	{

	}
}

type SpriteInfo = {
	x: number;
	y: number;
	width: number;
	height: number;
	name: string;
};
