import { TriangleDrawMode } from './Enums';
import Material from './Material';


interface BufferGeometryProps {
	verts: number[];
	mode?: TriangleDrawMode;
	attributes?: BufferAttributeList;
	indices?: number[];
	stride?: number;
	vertexName?: string;
}


type BufferAttributeList = {
	[name: string]: number[];
};


type BufferAttributeReference = {
	name: string;
	size: number;
	offset: number;
};


export default class BufferGeometry {
	protected verts: number[];
	protected inputAttributes: BufferAttributeList;
	protected attributes: BufferAttributeReference[];
	protected bufferData: Float32Array;
	protected buffer: WebGLBuffer;
	protected indices: Uint16Array;
	protected indexBuffer: WebGLBuffer;
	protected mode: TriangleDrawMode;
	protected stride: number;
	protected vertexName: string;
	private gl: WebGLRenderingContext;

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
		this.inputAttributes = attributes;
		this.vertexName = vertexName;

		if ( indices ) this.indices = new Uint16Array( indices );
	}


	private upload(): WebGLBuffer {
		if ( this.buffer ) return this.buffer;

		const { gl } = this;

		let data = [].concat( this.verts );
		let offset = this.verts.length * 4;

		this.attributes = [];
		this.attributes.push({
			name: this.vertexName,
			size: this.stride,
			offset: 0,
		});


		Object.keys( this.inputAttributes ).forEach( ( name ) => {
			const attribute = this.inputAttributes[name];
			const currentOffset = offset;
			let size = attribute.length / ( this.verts.length / this.stride );

			if ( size % 1 !== 0 ) {
				// eslint-disable-next-line no-console
				console.warn(
					`[WEBGL] Unsupported attribute size for "${name}", filling with zeroes`,
				);
				size = 1;
				data = data.concat( Array( this.verts.length / this.stride ).fill( 0 ) );
			} else {
				data = data.concat( attribute );
			}

			this.attributes.push({
				name,
				size,
				offset: currentOffset,
			});

			offset += ( this.verts.length / this.stride ) * size * 4;
		});

		this.bufferData = new Float32Array( data );

		this.buffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
		gl.bufferData( gl.ARRAY_BUFFER, this.bufferData, gl.STATIC_DRAW );


		if ( this.indices ) {
			this.indexBuffer = gl.createBuffer();
			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
			gl.bufferData(
				gl.ELEMENT_ARRAY_BUFFER,
				this.indices,
				gl.STATIC_DRAW,
			);
		}

		return this.buffer;
	}


	private prepare( material: Material ): void {
		const { gl } = this;

		this.attributes.forEach( ( attribute ) => {
			const index = material.getAttributeLocation( attribute.name );

			gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
			gl.enableVertexAttribArray( index );
			gl.vertexAttribPointer( index, attribute.size, gl.FLOAT, false, 0, attribute.offset );
		});
	}


	public draw( gl: WebGLRenderingContext, material: Material ): void {
		this.gl = gl;

		gl.bindBuffer( gl.ARRAY_BUFFER, this.upload() );
		this.prepare( material );

		if ( this.indices ) {
			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
			gl.drawElements( this.mode, this.indices.length, gl.UNSIGNED_SHORT, 0 );
		} else {
			gl.drawArrays( this.mode, 0, this.verts.length / this.stride );
		}
	}


	public delete(): void {
		if ( this.buffer ) this.gl.deleteBuffer( this.buffer );
		if ( this.indexBuffer ) this.gl.deleteBuffer( this.indexBuffer );

		this.buffer = null;
		this.indexBuffer = null;
	}
}
