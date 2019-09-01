import BufferGeometry from './BufferGeometry';
import Material from './Material';

interface RendererPops {
	canvas: HTMLCanvasElement;
}


export default class Renderer {
	public gl: WebGLRenderingContext;
	public canvas: HTMLCanvasElement;

	constructor( props: RendererPops ) {
		this.gl = props.canvas.getContext( 'webgl' );

		this.setSize( 800, 600 );
	}


	setSize( width: number, height: number ) {
		this.gl.canvas.width = width;
		this.gl.canvas.height = height;

		this.gl.viewport( 0, 0, width, height );
	}


	render( geometry: BufferGeometry, material: Material ) {
		this.gl.clearColor( .1, 0, .1, 1 );
		this.gl.clear( this.gl.COLOR_BUFFER_BIT );

		material.use( this.gl );
		geometry.draw( this.gl );
	}
}
