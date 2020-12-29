/* eslint-disable indent */

import type {
	MinFilterType,
	SharedTextureProps,
	Texture,
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
	private initalData: Uint8Array;
	private initialWidth: number;
	private initialHeight: number;
	private textureData = new Map<number, TexImageSource>();
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
			switch ( this.format ) {
			case WebGLRenderingContext.RGBA:
				this.initalData = new Uint8Array([0, 0, 0, 255]);
				break;
			case WebGLRenderingContext.RGB:
				this.initalData = new Uint8Array([0, 0, 0]);
				break;
			case WebGLRenderingContext.LUMINANCE_ALPHA:
				this.initalData = new Uint8Array([0, 0]);
				break;
			default:
				this.initalData = new Uint8Array([0]);
			}
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


	protected queueUpdate( data: TexImageSource, level = 0 ): void {
		this.textureData.set( level, data );
		this.needsUpdate = true;
	}


	protected update(): void {
		this.gl.bindTexture( this.gl.TEXTURE_2D, this.texture );
		this.textureData.forEach( ( data, level ) => {
			this.gl.texImage2D(
				this.gl.TEXTURE_2D,
				level,
				this.format,
				this.format,
				this.type,
				data,
			);
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
