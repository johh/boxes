type TextureFormat =
	WebGLRenderingContext['RGB'] |
	WebGLRenderingContext['RGBA'] |
	WebGLRenderingContext['ALPHA'] |
	WebGLRenderingContext['LUMINANCE'] |
	WebGLRenderingContext['LUMINANCE_ALPHA'];


type TextureType =
	WebGLRenderingContext['UNSIGNED_BYTE'] |
	WebGLRenderingContext['UNSIGNED_SHORT_5_6_5'] |
	WebGLRenderingContext['UNSIGNED_SHORT_4_4_4_4'] |
	WebGLRenderingContext['UNSIGNED_SHORT_5_5_5_1'];


export interface GenericTextureProps {
	format?: TextureFormat;
	type?: TextureType;
	mipmaps?: boolean;
}


export default class GenericTexture implements Texture {
	private texture: WebGLTexture;
	private format: TextureFormat;
	private type: TextureType;
	private mipmaps: boolean;
	private textureData: TexImageSource;
	protected needsUpdate: boolean = false;
	public readonly isTexture = true;


	constructor( props: GenericTextureProps = {}) {
		const {
			format = WebGLRenderingContext.RGBA,
			type =  WebGLRenderingContext.UNSIGNED_BYTE,
			mipmaps = false,
		} = props;

		this.format = format;
		this.type = type;
		this.mipmaps = mipmaps;
	}


	public prepare( gl: WebGLRenderingContext ) {
		if ( !this.texture ) {
			let data: Uint8Array;

			switch ( this.format ) {
			case WebGLRenderingContext.RGBA:
				data = new Uint8Array([0, 0, 0, 255]);
				break;
			case WebGLRenderingContext.RGB:
				data = new Uint8Array([0, 0, 0]);
				break;
			case WebGLRenderingContext.LUMINANCE_ALPHA:
				data = new Uint8Array([0, 0]);
				break;
			default:
				data = new Uint8Array([0]);
			}

			this.texture = gl.createTexture();
			gl.bindTexture( gl.TEXTURE_2D, this.texture );
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				this.format,
				1,
				1,
				0,
				this.format,
				this.type,
				data,
			);
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );

			if ( this.mipmaps ) {
				gl.generateMipmap( gl.TEXTURE_2D );
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
			} else {
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
			}
		}

		if ( this.needsUpdate ) {
			this.needsUpdate = false;
			this.update( gl, this.textureData );
		}

		return this.texture;
	}


	protected queueUpdate( data: TexImageSource ) {
		this.textureData = data;
		this.needsUpdate = true;
	}


	public update( gl: WebGLRenderingContext, data: TexImageSource ) {
		gl.bindTexture( gl.TEXTURE_2D, this.texture );
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			this.format,
			this.format,
			this.type,
			data,
		);
		if ( this.mipmaps ) {
			gl.generateMipmap( gl.TEXTURE_2D );
		}
	}
}

export interface Texture {
	isTexture: true;
	prepare: ( gl: WebGLRenderingContext ) => WebGLTexture;
}
