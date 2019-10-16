import { TriangleDrawMode } from './Enums';

interface BufferGeometryProps {
	verts: number[];
	mode?: TriangleDrawMode;
	attributes?: BufferAttributeList;
	indices?: number[];
	stride?: number;
	vertexName?: string;
}


type BufferAttributeList = {
	[name: string]: number[],
};


export default class BufferGeometry {
	protected verts: number[];
	protected attributes: BufferAttributeList;
	protected bufferData: Float32Array;
	protected buffer: WebGLBuffer;
	protected indices: Uint16Array;
	protected indexBuffer: WebGLBuffer;
	protected mode: TriangleDrawMode;
	protected stride: number;
	public attributeNames: string[];
	private gl: WebGLRenderingContext;
	private attributeSetupFunctions: Function[] = [];

	constructor( props: BufferGeometryProps ) {
		const {
			verts,
			attributes = {},
			mode = WebGLRenderingContext.TRIANGLES,
			indices,
			stride = 3,
			vertexName = 'a_vPosition',
		} = props;

		this.verts = verts;
		this.mode = mode;
		this.stride = stride;
		this.attributes = attributes;
		this.attributeNames = [vertexName, ...Object.keys( attributes )];

		if ( indices ) this.indices = new Uint16Array( indices );
	}


	private upload() {
		if ( this.buffer ) return this.buffer;

		const gl = this.gl;

		let data = [].concat( this.verts );
		const sizes: number[] = [this.stride];


		Object.values( this.attributes ).forEach( ( attribute, i ) => {
			let size = attribute.length / ( this.verts.length / this.stride );

			if ( size % 1 !== 0 ) {
				console.warn( `[WEBGL] Unsupported attribute size in slot ${i}, filling with zeroes` );
				size = 1;
				data = data.concat( Array( this.verts.length / this.stride ).fill( 0 ) );
			} else {
				data = data.concat( attribute );
			}

			sizes.push( size );
		});

		this.bufferData = new Float32Array( data );

		this.buffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
		gl.bufferData( gl.ARRAY_BUFFER, this.bufferData, gl.STATIC_DRAW );

		let offset = 0;

		sizes.forEach( ( size, i ) => {
			const _offset = offset;

			this.attributeSetupFunctions.push( () => {
				gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
				gl.enableVertexAttribArray( i );
				gl.vertexAttribPointer( i, size, gl.FLOAT, false, 0, _offset );
			});

			offset += ( this.verts.length / this.stride ) * size * 4;
		});


		if ( this.indices ) {
			this.indexBuffer = gl.createBuffer();
			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
			gl.bufferData(
				gl.ELEMENT_ARRAY_BUFFER,
				this.indices,
				gl.STATIC_DRAW,
			);
		}
	}


	private prepare() {
		this.attributeSetupFunctions.forEach( f => f() );
	}


	public draw( gl: WebGLRenderingContext ) {
		this.gl = gl;

		gl.bindBuffer( gl.ARRAY_BUFFER, this.upload() );
		this.prepare();

		if ( this.indices ) {
			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
			gl.drawElements( this.mode, this.indices.length, gl.UNSIGNED_SHORT, 0 );
		} else {
			gl.drawArrays( this.mode, 0, this.verts.length / this.stride );
		}
	}


	public delete() {
		if ( this.buffer ) this.gl.deleteBuffer( this.buffer );
		if ( this.indexBuffer ) this.gl.deleteBuffer( this.indexBuffer );

		this.buffer = undefined;
		this.indexBuffer = undefined;
	}
}
