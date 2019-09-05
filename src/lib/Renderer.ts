import Scene from './Scene';
import { Camera } from './GenericCamera';
import BufferGeometry from './BufferGeometry';
import Material from './Material';
import Framebuffer from './Framebuffer';


interface RendererPops {
	canvas: HTMLCanvasElement;
	width?: number;
	height?: number;
}


export default class Renderer {
	public gl: WebGLRenderingContext;
	public canvas: HTMLCanvasElement;
	public width: number;
	public height: number;


	constructor( props: RendererPops ) {
		const {
			canvas,
			width = 800,
			height = 600,
		} = props;

		this.gl = canvas.getContext( 'webgl' );

		this.createDebugTexture();
		this.setSize( width, height );
	}


	public setSize( width: number, height: number ) {
		this.width = width;
		this.height = height;
		this.gl.canvas.width = width;
		this.gl.canvas.height = height;
	}


	public render( scene: Scene, camera: Camera, frameBuffer?: Framebuffer ) {
	/* 	this.gl.clearColor( .1, 0, .1, 1 );
		this.gl.clear( this.gl.COLOR_BUFFER_BIT ); */
		camera.updateMatrices();

		this.gl.viewport( 0, 0, this.width, this.height );

		if ( frameBuffer ) {
			frameBuffer.use();
		} else {
			this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );
		}

		this.gl.enable( this.gl.DEPTH_TEST );
		this.gl.enable( this.gl.BLEND );

		scene.render( this.gl, camera.viewMatrix, camera.projectionMatrix );
	}


	public renderDirect( geometry: BufferGeometry, material: Material, frameBuffer?: Framebuffer ) {

		if ( frameBuffer ) {
			frameBuffer.use();
		} else {
			this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );
		}


		material.use( this.gl );
		geometry.draw( this.gl );
	}


	private createDebugTexture() {
		const texture = this.gl.createTexture();
		this.gl.bindTexture( this.gl.TEXTURE_2D, texture );

		this.gl.texImage2D(
			this.gl.TEXTURE_2D,
			0,
			this.gl.RGBA,
			2,
			2,
			0,
			this.gl.RGBA,
			this.gl.UNSIGNED_BYTE,
			new Uint8Array([
				1, 0, 1, 1,
				0, 0, 0, 1,
				0, 0, 0, 1,
				1, 0, 1, 1,
			].map( v => v * 255 ) ),
		);

		this.gl.texParameteri(
			this.gl.TEXTURE_2D,
			this.gl.TEXTURE_MIN_FILTER,
			this.gl.NEAREST,
		);
		this.gl.texParameteri(
			this.gl.TEXTURE_2D,
			this.gl.TEXTURE_MAG_FILTER,
			this.gl.NEAREST,
		);
	}
}
