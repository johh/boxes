import Renderer from '../Renderer';


interface FramebufferProps {
	renderer: Renderer;
	width?: number;
	height?: number;
	depth?: boolean;
}


export default class Framebuffer {
	private gl: WebGLRenderingContext;
	private fbo: WebGLFramebuffer;
	private depthBuffer: WebGLRenderbuffer;
	public texture: WebGLTexture;
	public height: number;
	public width: number;
	public readonly isFramebuffer = true;


	constructor( props: FramebufferProps ) {
		const {
			renderer,
			width = renderer.width,
			height = renderer.height,
			depth = false,
		} = props;

		this.gl = renderer.gl;
		this.fbo = this.gl.createFramebuffer();
		this.texture = this.gl.createTexture();

		if ( depth ) this.depthBuffer = this.gl.createRenderbuffer();

		this.setSize( width, height );
	}


	public setSize( width: number, height: number ) {
		this.width = width;
		this.height = height;

		this.gl.bindTexture( this.gl.TEXTURE_2D, this.texture );
		this.gl.texImage2D(
			this.gl.TEXTURE_2D,
			0,
			this.gl.RGBA,
			width,
			height,
			0,
			this.gl.RGBA,
			this.gl.UNSIGNED_BYTE,
			null,
		);

		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR );
		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR );
		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE );
		this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE );

		this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.fbo );

		this.gl.framebufferTexture2D(
			this.gl.FRAMEBUFFER,
			this.gl.COLOR_ATTACHMENT0,
			this.gl.TEXTURE_2D,
			this.texture,
			0,
		);

		if ( this.depthBuffer ) {
			this.gl.bindRenderbuffer( this.gl.RENDERBUFFER, this.depthBuffer );
			this.gl.renderbufferStorage(
				this.gl.RENDERBUFFER,
				this.gl.DEPTH_COMPONENT16,
				this.width,
				this.width,
			);
			this.gl.framebufferRenderbuffer(
				this.gl.FRAMEBUFFER,
				this.gl.DEPTH_ATTACHMENT,
				this.gl.RENDERBUFFER,
				this.depthBuffer,
			);
		}
	}


	public use() {
		this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.fbo );
		this.gl.viewport( 0, 0, this.width, this.height );
	}


	public clear() {
		this.use();
		this.gl.clear( this.gl.COLOR_BUFFER_BIT );
	}
}
