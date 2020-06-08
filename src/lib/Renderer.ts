import Scene from './Scene';
import BufferGeometry from './BufferGeometry';
import Material from './Material';
// eslint-disable-next-line import/no-cycle
import Framebuffer from './post/Framebuffer';


type Color = [number, number, number, number];


interface RendererPops {
	canvas: HTMLCanvasElement;
	width?: number;
	height?: number;
	transparency?: boolean;
	clearColor?: Color;
	autoClear?: boolean;
	cullFaces?: boolean;
}


export default class Renderer {
	public gl: WebGLRenderingContext;
	public canvas: HTMLCanvasElement;
	public width: number;
	public height: number;
	public clearColor: Color;
	public autoClear: boolean;
	public cullFaces: boolean;


	constructor( props: RendererPops ) {
		const {
			canvas,
			width = 800,
			height = 600,
			transparency = false,
			clearColor = [0, 0, 0, 1] as Color,
			autoClear = true,
			cullFaces = true,
		} = props;

		this.gl = canvas.getContext( 'webgl', { alpha: transparency, stencil: true });
		this.clearColor = clearColor;
		this.autoClear = autoClear;
		this.cullFaces = cullFaces;

		this.setSize( width, height );
	}


	public setSize( width: number, height: number ): void {
		this.width = width;
		this.height = height;
		this.gl.canvas.width = width;
		this.gl.canvas.height = height;
	}


	public render( scene: Scene, frameBuffer?: Framebuffer ): void {
		if ( this.autoClear ) this.clear();

		this.gl.viewport( 0, 0, this.width, this.height );

		if ( frameBuffer ) {
			frameBuffer.use();
		} else {
			this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );
		}

		this.gl.enable( this.gl.DEPTH_TEST );
		this.gl.enable( this.gl.BLEND );

		if ( this.cullFaces ) {
			this.gl.enable( this.gl.CULL_FACE );
			this.gl.cullFace( this.gl.BACK );
		}

		scene.render( this.gl );
	}


	public renderDirect(
		geometry: BufferGeometry,
		material: Material,
		frameBuffer?: Framebuffer,
	): void {
		if ( frameBuffer ) {
			frameBuffer.use();
		} else {
			this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );
		}

		material.use( this.gl );
		geometry.draw( this.gl, material );
	}


	public clear(): void {
		this.gl.clearColor( ...this.clearColor );
		this.gl.clear(
			// eslint-disable-next-line no-bitwise
			this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT,
		);
	}


	public clearColorBuffer(): void {
		this.gl.clearColor( ...this.clearColor );
		this.gl.clear( this.gl.COLOR_BUFFER_BIT );
	}


	public clearDepthBuffer(): void {
		this.gl.clear( this.gl.DEPTH_BUFFER_BIT );
	}


	public clearStencilBuffer(): void {
		this.gl.clear( this.gl.STENCIL_BUFFER_BIT );
	}
}
