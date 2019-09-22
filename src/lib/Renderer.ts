import Scene from './Scene';
import { Camera } from './camera/GenericCamera';
import BufferGeometry from './BufferGeometry';
import Material from './Material';
import Framebuffer from './post/Framebuffer';


interface RendererPops {
	canvas: HTMLCanvasElement;
	width?: number;
	height?: number;
	clearColor?: [number, number, number, number];
}


export default class Renderer {
	public gl: WebGLRenderingContext;
	public canvas: HTMLCanvasElement;
	public width: number;
	public height: number;
	public clearColor: [number, number, number, number];


	constructor( props: RendererPops ) {
		const {
			canvas,
			width = 800,
			height = 600,
			clearColor = [0, 0, 0, 1],
		} = props;

		this.gl = canvas.getContext( 'webgl', { stencil: true });
		this.clearColor = <[number, number, number, number]>clearColor;

		this.setSize( width, height );
	}


	public setSize( width: number, height: number ) {
		this.width = width;
		this.height = height;
		this.gl.canvas.width = width;
		this.gl.canvas.height = height;
	}


	public render( scene: Scene, camera: Camera, frameBuffer?: Framebuffer ) {
		this.gl.clearColor( ...this.clearColor );
		this.gl.clear( this.gl.COLOR_BUFFER_BIT );
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
}
