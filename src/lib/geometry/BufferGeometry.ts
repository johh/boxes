import { TriangleDrawMode } from '../Enums';
import Material from '../Material';
import { Renderer } from '../../boxes'; // avoid dependency cycle
import InstancedAttribute from './InstancedAttribute';


export interface BufferGeometryProps {
	verts: number[];
	mode?: TriangleDrawMode;
	attributes?: BufferAttributeList;
	indices?: number[];
	stride?: number;
	vertexName?: string;
	instances?: number;
	instancedAttributes?: {
		[name: string]: InstancedAttribute;
	};
}


type BufferAttributeList = {
	[name: string]: number[];
};


type BufferAttributeReference = {
	name: string;
	size: number;
	offset: number;
};


type InstancedAttributeReference = {
	instancedAttribute: InstancedAttribute;
	buffer: WebGLBuffer;
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
	protected vaos = new Map<Material, WebGLVertexArrayObjectOES>();
	protected instancedAttributes: Map<string, InstancedAttributeReference>;
	protected instances: number;
	private renderer: Renderer;

	constructor( props: BufferGeometryProps ) {
		const {
			verts,
			attributes = {},
			mode = WebGLRenderingContext.TRIANGLES,
			indices,
			stride = 3,
			vertexName = 'a_vPosition',
			instances = 0,
			instancedAttributes,
		} = props;

		this.verts = verts;
		this.mode = mode;
		this.stride = stride;
		this.inputAttributes = attributes;
		this.vertexName = vertexName;
		this.instances = instances;

		if ( indices ) this.indices = new Uint16Array( indices );
		if ( instances > 0 && instancedAttributes ) {
			this.instancedAttributes = new Map();
			Object.entries( instancedAttributes ).forEach( ([key, attr]) => {
				attr.init( instances );
				this.instancedAttributes.set( key, {
					instancedAttribute: attr,
					buffer: null,
				});
			});
		}
	}


	private getBuffer(): WebGLBuffer {
		if ( this.buffer ) return this.buffer;

		const { gl } = this.renderer;

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

		if ( this.instancedAttributes ) {
			this.instancedAttributes.forEach( ( ref, key ) => {
				const buffer = gl.createBuffer();
				gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
				gl.bufferData(
					gl.ARRAY_BUFFER,
					ref.instancedAttribute.data,
					ref.instancedAttribute.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW,
				);

				ref.instancedAttribute.setUpdated();

				this.instancedAttributes.set(
					key,
					Object.assign( ref, { buffer }),
				);
			});
		}

		return this.buffer;
	}


	private getVao( material: Material ): WebGLVertexArrayObjectOES {
		const currentVao = this.vaos.get( material );

		if ( currentVao ) {
			return currentVao;
		}

		const {
			gl, ext: {
				vao,
				instancedArrays,
			},
		} = this.renderer;

		const newVao = vao.createVertexArrayOES();
		vao.bindVertexArrayOES( newVao );

		if ( this.indices ) {
			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
		}

		gl.bindBuffer( gl.ARRAY_BUFFER, this.getBuffer() );

		this.attributes.forEach( ( attribute ) => {
			const index = material.getAttributeLocation( attribute.name );

			gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
			gl.enableVertexAttribArray( index );
			gl.vertexAttribPointer( index, attribute.size, gl.FLOAT, false, 0, attribute.offset );
		});

		if ( this.instancedAttributes ) {
			this.instancedAttributes.forEach( ( ref, name ) => {
				const index = material.getAttributeLocation( name );
				gl.bindBuffer( gl.ARRAY_BUFFER, ref.buffer );

				const bytesPerInstance = ref.instancedAttribute.length * 4;
				const slots = ref.instancedAttribute.length / 4;

				for ( let i = 0; i < slots; i += 1 ) {
					const location = index + i;
					const offset = i * 16; // 16 bytes per slot

					gl.enableVertexAttribArray( location );
					gl.vertexAttribPointer(
						location,
						Math.min( 4, ref.instancedAttribute.length ),
						gl.FLOAT,
						false,
						bytesPerInstance,
						offset,
					);
					instancedArrays.vertexAttribDivisorANGLE( location, 1 );
				}
			});
		}

		vao.bindVertexArrayOES( null );

		this.vaos.set( material, newVao );
		return newVao;
	}


	public draw( renderer: Renderer, material: Material ): void {
		const { gl, ext: { vao, instancedArrays } } = renderer;
		this.renderer = renderer;

		vao.bindVertexArrayOES( this.getVao( material ) );

		if ( this.instancedAttributes ) {
			this.instancedAttributes.forEach( ref => {
				if ( ref.instancedAttribute.needsUpdate ) {
					gl.bindBuffer( gl.ARRAY_BUFFER, ref.buffer );
					gl.bufferSubData( gl.ARRAY_BUFFER, 0, ref.instancedAttribute.data );
				}
			});

			if ( this.indices ) {
				instancedArrays.drawElementsInstancedANGLE(
					this.mode, this.indices.length, gl.UNSIGNED_SHORT, 0, this.instances,
				);
			} else {
				instancedArrays.drawArraysInstancedANGLE(
					this.mode, 0, this.verts.length / this.stride, this.instances,
				);
			}
		} else if ( this.indices ) {
			gl.drawElements( this.mode, this.indices.length, gl.UNSIGNED_SHORT, 0 );
		} else {
			gl.drawArrays( this.mode, 0, this.verts.length / this.stride );
		}
	}


	public delete(): void {
		const { gl, ext: { vao } } = this.renderer;

		if ( this.buffer ) gl.deleteBuffer( this.buffer );
		if ( this.indexBuffer ) gl.deleteBuffer( this.indexBuffer );

		this.vaos.forEach( v => vao.deleteVertexArrayOES( v ) );
		this.vaos.clear();

		this.buffer = null;
		this.indexBuffer = null;
	}
}
