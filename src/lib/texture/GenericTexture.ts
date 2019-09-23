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


type WrappingType =
	WebGLRenderingContext['CLAMP_TO_EDGE'] |
	WebGLRenderingContext['REPEAT'] |
	WebGLRenderingContext['MIRRORED_REPEAT'];


export interface GenericTextureProps {
	format?: TextureFormat;
	type?: TextureType;
	mipmaps?: boolean;
	wrapS?: WrappingType;
	wrapT?: WrappingType;
}


export interface Texture {
	isTexture: true;
	prepare: ( gl: WebGLRenderingContext ) => WebGLTexture;
}


export default class GenericTexture implements Texture {
	private gl: WebGLRenderingContext;
	private texture: WebGLTexture;
	private format: TextureFormat;
	private type: TextureType;
	private mipmaps: boolean;
	private wrapS: WrappingType;
	private wrapT: WrappingType;
	private textureData: TexImageSource;
	protected needsUpdate: boolean = false;
	public readonly isTexture = true;


	constructor( props: GenericTextureProps = {}) {
		const {
			format = WebGLRenderingContext.RGBA,
			type =  WebGLRenderingContext.UNSIGNED_BYTE,
			mipmaps = false,
			wrapS = WebGLRenderingContext.CLAMP_TO_EDGE,
			wrapT = WebGLRenderingContext.CLAMP_TO_EDGE,
		} = props;

		this.format = format;
		this.type = type;
		this.mipmaps = mipmaps;
		this.wrapS = wrapS;
		this.wrapT = wrapT;
	}


	public prepare( gl: WebGLRenderingContext ) {
		if ( !this.texture ) {
			this.gl = gl;

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
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT );

			if ( this.mipmaps ) {
				gl.generateMipmap( gl.TEXTURE_2D );
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
			} else {
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
			}
		}

		if ( this.needsUpdate ) {
			this.needsUpdate = false;
			this.update( this.textureData );
		}

		return this.texture;
	}


	protected queueUpdate( data: TexImageSource ) {
		this.textureData = data;
		this.needsUpdate = true;
	}


	public update( data: TexImageSource ) {
		this.gl.bindTexture( this.gl.TEXTURE_2D, this.texture );
		this.gl.texImage2D(
			this.gl.TEXTURE_2D,
			0,
			this.format,
			this.format,
			this.type,
			data,
		);
		if ( this.mipmaps ) {
			this.gl.generateMipmap( this.gl.TEXTURE_2D );
		}
	}


	public delete() {
		if ( this.texture ) this.gl.deleteTexture( this.texture );

		this.texture = undefined;
	}
}
