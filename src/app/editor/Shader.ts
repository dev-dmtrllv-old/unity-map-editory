import { Editor } from "./Editor";
import { GLBuffer } from "./GLBuffer";

export abstract class Shader<A extends Attributes, U extends Uniforms>
{
	private static readonly typeToComponentNum = (type: ShaderAttrType) =>
	{
		switch (type)
		{
			case "float":
				return 1;
			case "vec2":
				return 2;
			case "vec3":
				return 3;
			case "vec4":
			case "mat2":
				return 4;
			case "mat3":
				return 9;
			case "mat4":
				return 16
		}
		return 0;
	}

	private static readonly shaders: Shader<any, any>[] = [];

	public static get<T extends Shader<any, any>>(type: ShaderType<T>): T
	{
		let s = this.shaders.find(s => s.constructor === type);
		if (!s)
		{
			s = new type(Editor.get().canvasRenderer.gl);
			this.shaders.push(s);
		}
		return s as T;
	}

	public readonly gl: WebGLRenderingContext;
	public readonly shaderProgram: WebGLProgram;

	private _attributes: AttributeLocations<A>;
	private _uniforms: UniformLocations<U>;

	public getAttribute(key: keyof AttributeLocations<A>)
	{
		return this._attributes[key];
	}

	public getUniform(key: keyof UniformLocations<U>)
	{
		return this._uniforms[key];
	}

	public getAttributeLocation(key: keyof AttributeLocations<A>)
	{
		return this._attributes[key]?.location || null;
	}

	public getUniformLocation(key: keyof UniformLocations<U>)
	{
		return this._uniforms[key]?.location || null;
	}

	public constructor(gl: WebGLRenderingContext)
	{
		this.gl = gl;
		this.shaderProgram = this.createProgram();
		const { attributes, uniforms } = this.getLocations();
		this._attributes = attributes as any;
		this._uniforms = uniforms as any;
	}

	private loadShader(type: number, source: string)
	{
		const gl = this.gl;
		const shader = gl.createShader(type);
		if (shader)
		{
			gl.shaderSource(shader, source);
			gl.compileShader(shader);

			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
			{
				const err = 'An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader);
				gl.deleteShader(shader);
				throw new Error(err);
			}
		}
		else
		{
			throw new Error("Could not create shader!");
		}

		return shader;
	}

	private createProgram(): WebGLProgram
	{
		const gl = this.gl;

		const vertexShader = this.loadShader(gl.VERTEX_SHADER, this.vertexSource());
		const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, this.fragmentSource());

		const shaderProgram = gl.createProgram();
		if (shaderProgram)
		{

			gl.attachShader(shaderProgram, vertexShader);
			gl.attachShader(shaderProgram, fragmentShader);
			gl.linkProgram(shaderProgram);

			if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
			{
				const err = 'Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram);
				gl.deleteProgram(shaderProgram);
				gl.deleteShader(vertexShader);
				gl.deleteShader(fragmentShader);
				throw new Error(err);
			}
		}
		else
		{
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			throw new Error("Could not create shader program");
		}

		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);

		return shaderProgram;
	}

	private getLocations(): LocationsGroup<A, U>
	{
		const s = this.vertexSource() + this.fragmentSource();

		const locations = {
			attributes: {},
			uniforms: {},
		} as LocationsGroup<A, U>;

		s.replace(/(\r|\n|\t)/g, "").split(";").forEach((str) => 
		{
			const [attributeType, type, name] = str.split(" ") as any;
			if (attributeType === "attribute" && !locations.attributes[name])
			{
				locations.attributes[name as keyof A] = {
					location: this.gl.getAttribLocation(this.shaderProgram, name),
					type
				};
			}
			else if (attributeType === "uniform" && !locations.uniforms[name])
			{
				const uniformLoc = this.gl.getUniformLocation(this.shaderProgram, name);

				if (!uniformLoc)
					console.warn(`Could not get uniform location "${name}"!`);
				else
					locations.uniforms[name as keyof U] = { location: uniformLoc, type };
			}
		});

		return locations;
	}

	public setAttributeBuffer(name: keyof AttributeLocations<A>, buffer: GLBuffer, stride: number = 0, offset: number = 0)
	{
		try 
		{

			const { location, type } = this.getAttribute(name);

			const gl = this.gl;

			buffer.use(gl);
			gl.vertexAttribPointer(location, Shader.typeToComponentNum(type), gl.FLOAT, false, stride, offset);
			gl.enableVertexAttribArray(location);
		}
		catch (e)
		{
			console.error(e);
			console.warn(name);
		}
	}

	public readonly use = () =>
	{
		this.gl.useProgram(this.shaderProgram);
	}

	protected abstract vertexSource(): string;
	protected abstract fragmentSource(): string;
}

export type ShaderType<T extends Shader<any, any>> = new (gl: WebGLRenderingContext) => T;

export type ShaderAttrType = "float" | "vec2" | "vec3" | "vec4" | "mat2" | "mat3" | "mat4";
export type ShaderUniformType = "float" | "bool" | "vec2" | "vec3" | "vec4" | "mat2" | "mat3" | "mat4" | "sampler2D";

export type Attributes = {
	[key: string]: ShaderAttrType;
};

export type Uniforms = {
	[key: string]: ShaderUniformType;
}

type AttributeLocations<T extends Attributes> = {
	[K in keyof T]: {
		location: number;
		type: ShaderAttrType;
	};
};

type UniformLocations<T extends Uniforms> = {
	[K in keyof T]: {
		location: WebGLUniformLocation;
		type: ShaderUniformType;
	};
};

type LocationsGroup<A extends Attributes, U extends Uniforms> = {
	attributes: AttributeLocations<A>;
	uniforms: UniformLocations<U>;
};
