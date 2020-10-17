/* eslint-disable camelcase */

import type Framebuffer from './post/Framebuffer';
import Scene from './Scene';
import BufferGeometry from './geometry/BufferGeometry';
import Material from './Material';


type Color = [number, number, number, number];


export interface RendererPops {
	canvas: HTMLCanvasElement;
	width?: number;
	height?: number;
	transparency?: boolean;
	clearColor?: Color;
	autoClear?: boolean;
	cullFaces?: boolean;
	antialias?: boolean;
}


export default class Renderer {
	public gl: WebGLRenderingContext;
	public ext: {
		vao: OES_vertex_array_object;
		standardDerivatives: OES_standard_derivatives;
		instancedArrays: ANGLE_instanced_arrays;
		info: WEBGL_debug_renderer_info;
	};

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
			antialias = false,
		} = props;

		this.gl = canvas.getContext( 'webgl', {
			alpha: transparency,
			stencil: true,
			antialias,
		});
		this.ext = {
			vao: this.gl.getExtension( 'OES_vertex_array_object' ),
			standardDerivatives: this.gl.getExtension( 'OES_standard_derivatives' ),
			instancedArrays: this.gl.getExtension( 'ANGLE_instanced_arrays' ),
			info: this.gl.getExtension( 'WEBGL_debug_renderer_info' ),
		};

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

		scene.render( this );
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
			this.gl.viewport( 0, 0, this.width, this.height );
		}

		material.use( this.gl );
		geometry.draw( this, material );
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
