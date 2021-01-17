/* eslint-disable @typescript-eslint/indent  */

import arrayFromTextureProps from '../utils/ArrayFromTextureProps';
import type {
	MinFilterType,
	SharedTextureProps,
	Texture,
	TextureData,
	TextureFormat,
	TextureType,
	TextureWrapProps,
	WrappingType,
} from './TextureTypes';


export interface GenericTextureProps extends SharedTextureProps, TextureWrapProps {
	initial?: {
		data: Uint8Array;
		width?: number;
		height?: number;
	};
}


export default class GenericTexture implements Texture {
	private gl: WebGLRenderingContext;
	private texture: WebGLTexture;
	private format: TextureFormat;
	private type: TextureType;
	private mipmaps: boolean;
	private wrapS: WrappingType;
	private wrapT: WrappingType;
	private minFilter: MinFilterType;
	private initalData: Uint8Array | Uint16Array | Float32Array;
	private initialWidth: number;
	private initialHeight: number;
	private textureData = new Map<number, TextureData>();
	protected needsUpdate = false;
	public readonly isTexture = true;
	public readonly isCubemap = false;


	constructor( props: GenericTextureProps = {}) {
		const {
			format = WebGLRenderingContext.RGBA,
			type = WebGLRenderingContext.UNSIGNED_BYTE,
			mipmaps = false,
			wrapS = WebGLRenderingContext.CLAMP_TO_EDGE,
			wrapT = WebGLRenderingContext.CLAMP_TO_EDGE,
			minFilter,
			initial: {
				data,
				width = 1,
				height = 1,
			} = {},
		} = props;

		this.format = format;
		this.type = type;
		this.mipmaps = mipmaps;
		this.wrapS = wrapS;
		this.wrapT = wrapT;
		this.initialWidth = width;
		this.initialHeight = height;

		this.minFilter = minFilter || ( mipmaps
			? WebGLRenderingContext.LINEAR_MIPMAP_LINEAR
			: WebGLRenderingContext.LINEAR );

		if ( data ) {
			this.initalData = data;
		} else {
			this.initalData = arrayFromTextureProps( this.type, this.format );
		}
	}


	public prepare( gl: WebGLRenderingContext ): WebGLTexture {
		if ( !this.texture ) {
			this.gl = gl;

			this.texture = gl.createTexture();
			gl.bindTexture( gl.TEXTURE_2D, this.texture );
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				this.format,
				this.initialWidth,
				this.initialHeight,
				0,
				this.format,
				this.type,
				this.initalData,
			);
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT );

			if ( this.mipmaps ) {
				gl.generateMipmap( gl.TEXTURE_2D );
			}

			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter );
		}

		if ( this.needsUpdate ) {
			this.needsUpdate = false;
			this.update();
		}

		return this.texture;
	}


	protected queueUpdate( data: TextureData, level = 0 ): void {
		this.textureData.set( level, data );
		this.needsUpdate = true;
	}


	protected update(): void {
		this.gl.bindTexture( this.gl.TEXTURE_2D, this.texture );
		this.textureData.forEach( ( data, level ) => {
			if ( 'data' in data ) {
				const { width, height, data: textureData } = data;

				this.gl.texImage2D(
					this.gl.TEXTURE_2D,
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
					this.gl.TEXTURE_2D,
					level,
					this.format,
					this.format,
					this.type,
					data as TexImageSource,
				);
			}
			if ( this.mipmaps && level === 0 ) {
				this.gl.generateMipmap( this.gl.TEXTURE_2D );
			}
		});
		this.textureData.clear();
	}


	public delete(): void {
		if ( this.texture ) this.gl.deleteTexture( this.texture );

		this.texture = null;
	}
}
