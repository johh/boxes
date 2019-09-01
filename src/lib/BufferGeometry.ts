import { TriangleDrawMode } from './Enums';

interface BufferGeometryProps {
	verts: Float32Array;
	mode?: TriangleDrawMode;
}

export default class BufferGeometry {
	private verts: Float32Array;
	private buffer: WebGLBuffer;
	private mode: TriangleDrawMode;

	constructor( props: BufferGeometryProps ) {
		const {
			verts,
			mode = WebGLRenderingContext.TRIANGLES,
		} = props;

		this.verts = verts;
		this.mode = mode;
	}

	private upload( gl: WebGLRenderingContext ) {
		if ( this.buffer ) return this.buffer;

		this.buffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
		gl.bufferData( gl.ARRAY_BUFFER, this.verts, gl.STATIC_DRAW );

		gl.enableVertexAttribArray( 0 );
		gl.vertexAttribPointer( 0, 3, gl.FLOAT, false, 0, 0 );
	}

	draw( gl: WebGLRenderingContext ) {
		gl.bindBuffer( gl.ARRAY_BUFFER, this.upload( gl ) );
		gl.drawArrays( this.mode, 0, this.verts.length / 3 );
	}
}
