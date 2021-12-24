import { Shader } from "../Shader";

export class DefaultShader extends Shader<A, U>
{
	protected vertexSource(): string
	{
		return `
			precision highp float;

			attribute vec2 aVertexPosition;
			attribute vec2 aUVPosition;
		
			uniform vec2 uCanvasSize;
			uniform vec2 uPosition;
			uniform vec4 uColor;
			uniform vec2 uMapOffset;
			uniform float uSelectionRender;
			
			uniform float uZoom;
			uniform float uPixelRatio;

			varying vec4 color;
			varying vec2 uvCoord;

			void main() {
				float zoom = (uZoom == 0.0 ? 1.0 : uZoom) * (uPixelRatio == 0.0 ? 1.0 : uPixelRatio);
				
				color = uColor;
				uvCoord = aUVPosition;

				vec2 pos = ((aVertexPosition + uPosition + uMapOffset) / (uCanvasSize / 2.0)) * zoom;

				gl_Position = vec4(pos.xy, 0.0, 1.0);
			}
		`;
	}

	protected fragmentSource(): string
	{
		return `
			precision highp float;
			
			uniform sampler2D uSampler;
			uniform float uRenderTexture;
			uniform float uSelectionRender;
			uniform vec4 uSelectionColor;

			varying vec4 color;
			varying vec2 uvCoord;

			void main() {
				if(uSelectionRender == 1.0)
				{
					gl_FragColor = uSelectionColor;
				}
				else if(uRenderTexture == 0.0)
				{
					gl_FragColor = color;
				}
				else
				{
					vec4 c = texture2D(uSampler, uvCoord);
					
					// if(c.w == 0.0)
					// 	c = vec4(0.2, 0.2, 0.0, 1.0);
					
					gl_FragColor = c;
				}
			}
		`;
	}
}

type A = {
	aVertexPosition: "vec2";
	aUVPosition: "vec2";
};

type U = {
	uCanvasSize: "vec2";
	uPosition: "vec2";
	uColor: "vec4";
	uSampler: "sampler2D";
	uRenderTexture: "float";
	uZoom: "float";
	uPixelRatio: "float";
	uMapOffset: "vec2";
	uSelectionRender: "float";
	uSelectionColor: "vec4";
};
