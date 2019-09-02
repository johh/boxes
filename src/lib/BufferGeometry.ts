import { TriangleDrawMode } from './Enums';

interface BufferGeometryProps {
	verts: number[];
	mode?: TriangleDrawMode;
	attributes?: number[][];
}


export default class BufferGeometry {
	private verts: number[];
	private attributes: number[][];
	private bufferData: Float32Array;
	private buffer: WebGLBuffer;
	private mode: TriangleDrawMode;
	private attributeSetupFunctions: Function[] = [];

	constructor( props: BufferGeometryProps ) {
		const {
			verts,
			attributes = [],
			mode = WebGLRenderingContext.TRIANGLES,
		} = props;

		this.verts = verts;
		this.mode = mode;
		this.attributes = attributes;
	}


	private upload( gl: WebGLRenderingContext ) {
		if ( this.buffer ) return this.buffer;


		let data = [].concat( this.verts );
		const sizes: number[] = [3];

		this.attributes.forEach( ( attribute, i ) => {
			let size = attribute.length / ( this.verts.length / 3 );

			if ( size % 1 !== 0 ) {
				console.warn( `[WEBGL] Unsupported attribute size in slot ${i}, filling with zeroes` );
				size = 1;
				data = data.concat( Array( this.verts.length / 3 ).fill( 0 ) );
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

			offset += ( this.verts.length / 3 ) * size * 4;
		});
	}


	private prepare() {
		this.attributeSetupFunctions.forEach( f => f() );
	}


	draw( gl: WebGLRenderingContext ) {
		gl.bindBuffer( gl.ARRAY_BUFFER, this.upload( gl ) );
		this.prepare();
		gl.drawArrays( this.mode, 0, this.verts.length / 3 );
	}
}
