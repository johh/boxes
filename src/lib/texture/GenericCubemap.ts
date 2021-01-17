/* eslint-disable @typescript-eslint/indent */

import arrayFromTextureProps from '../utils/ArrayFromTextureProps';
import type {
	MinFilterType,
	RawTextureData,
	SharedTextureProps,
	Texture,
	TextureData,
	TextureFormat,
	TextureType,
} from './TextureTypes';


export type CubeOf<T> = {
	px: T;
	nx: T;
	py: T;
	ny: T;
	pz: T;
	nz: T;
};


function makeCubeOf<T>( data: T ):CubeOf<T> {
	return {
		px: data,
		nx: data,
		py: data,
		ny: data,
		pz: data,
		nz: data,
	};
}


const faces = new Map<keyof CubeOf<number>, number>([
	['px', WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X],
	['nx', WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X],
	['py', WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y],
	['ny', WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y],
	['pz', WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z],
	['nz', WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z],
]);


export interface GenericCubemapProps extends SharedTextureProps {
	initial?: {
		data: CubeOf<Uint8Array | Uint16Array | Float32Array>;
		width?: number;
	};
}

export default class GenericCubemap implements Texture {
	private gl: WebGLRenderingContext;
	private texture: WebGLTexture;
	private format: TextureFormat;
	private type: TextureType;
	private mipmaps: boolean;
	private minFilter: MinFilterType;
	private textureData = new Map<number, Partial<CubeOf<TextureData>>>();
	private initialWidth: number;
	private initalData: CubeOf<Uint8Array | Uint16Array | Float32Array>;
	protected needsUpdate = false;
	public readonly isTexture = true;
	public readonly isCubemap = true;


	constructor( props: GenericCubemapProps ) {
		const {
			format = WebGLRenderingContext.RGBA,
			type = WebGLRenderingContext.UNSIGNED_BYTE,
			mipmaps = true,
			minFilter,
			initial: {
				data,
				width = 1,
			} = {},
		} = props;

		this.format = format;
		this.type = type;
		this.mipmaps = mipmaps;
		this.initialWidth = width;

		this.minFilter = minFilter || ( mipmaps
			? WebGLRenderingContext.LINEAR_MIPMAP_LINEAR
			: WebGLRenderingContext.LINEAR );

		if ( data ) {
			this.initalData = data;
		} else {
			this.initalData = makeCubeOf( arrayFromTextureProps( this.type, this.format ) );
		}
	}


	public prepare( gl: WebGLRenderingContext ): WebGLTexture {
		if ( !this.texture ) {
			this.gl = gl;

			this.texture = gl.createTexture();
			gl.bindTexture( gl.TEXTURE_CUBE_MAP, this.texture );

			faces.forEach( ( target, key ) => {
				gl.texImage2D(
					target,
					0,
					this.format,
					this.initialWidth,
					this.initialWidth,
					0,
					this.format,
					this.type,
					this.initalData[key],
				);
			});

			gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
		}

		if ( this.needsUpdate ) {
			this.needsUpdate = false;
			this.update();

			// TODO: only update faces that have changed
		}

		return this.texture;
	}


	protected update(): void {
		const { gl } = this;
		this.textureData.forEach( ( data, level ) => {
			const {
				px, nx, py, ny, pz, nz,
			} = data;

			if ( px && nx && py && ny && pz && nz ) {
				faces.forEach( ( target, key ) => {
					if ( data[key]) {
						if ( 'data' in data[key]) {
							const {
								width, height, data: textureData,
							} = data[key] as RawTextureData;

							this.gl.texImage2D(
								target,
								level,
								this.format,
								width,
								height,
								0,
								this.format,
								this.type,
								textureData,
							);
						} else {
							this.gl.texImage2D(
								target,
								level,
								this.format,
								this.format,
								this.type,
								data[key] as TexImageSource,
							);
						}
					}
				});
				if ( this.mipmaps && level === 0 ) {
					gl.generateMipmap( gl.TEXTURE_CUBE_MAP );
				}
				this.textureData.delete( level );
			}
		});

		gl.texParameteri(
			gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, this.minFilter,
		);
	}


	protected queueUpdate( data: Partial<CubeOf<TextureData>>, level = 0 ): void {
		this.textureData.set( level, Object.assign( this.textureData.get( level ) || {}, data ) );
		this.needsUpdate = true;
	}


	public delete(): void {
		if ( this.texture ) this.gl.deleteTexture( this.texture );

		this.texture = null;
	}
}
