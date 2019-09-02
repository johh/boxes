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

		this.createDebugTexture();
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
