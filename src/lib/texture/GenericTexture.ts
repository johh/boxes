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
	initial?: {
		data: Uint8Array,
		width?: number,
		height?: number,
	};
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
	private initalData: Uint8Array;
	private initialWidth: number;
	private initialHeight: number;
	protected needsUpdate: boolean = false;
	public readonly isTexture = true;


	constructor( props: GenericTextureProps = {}) {
		const {
			format = WebGLRenderingContext.RGBA,
			type =  WebGLRenderingContext.UNSIGNED_BYTE,
			mipmaps = false,
			wrapS = WebGLRenderingContext.CLAMP_TO_EDGE,
			wrapT = WebGLRenderingContext.CLAMP_TO_EDGE,
			initial: {
				data = undefined,
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


	public prepare( gl: WebGLRenderingContext ) {
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
