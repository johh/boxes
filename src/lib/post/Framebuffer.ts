// eslint-disable-next-line import/no-cycle
import Renderer from '../Renderer';
import { Texture } from '../texture/TextureTypes';


export interface FramebufferProps {
	renderer: Renderer;
	width?: number;
	height?: number;
	depth?: boolean;
	stencil?: boolean;
}


export default class Framebuffer implements Texture {
	private gl: WebGLRenderingContext;
	private fbo: WebGLFramebuffer;
	private depthBuffer: WebGLRenderbuffer;
	private stencilBuffer: WebGLRenderbuffer;
	private depthStencilBuffer: WebGLRenderbuffer;
	public texture: WebGLTexture;
	public height: number;
	public width: number;
	public readonly isFramebuffer = true;
	public readonly isTexture = true;
	public readonly isCubemap = false;


	constructor( props: FramebufferProps ) {
		const {
			renderer,
			width = renderer.width,
			height = renderer.height,
			depth = false,
			stencil = false,
		} = props;

		this.gl = renderer.gl;
		this.fbo = this.gl.createFramebuffer();
		this.texture = this.gl.createTexture();

		if ( depth && stencil ) {
			this.depthStencilBuffer = this.gl.createRenderbuffer();
		} else {
			if ( depth ) this.depthBuffer = this.gl.createRenderbuffer();
			if ( stencil ) this.stencilBuffer = this.gl.createRenderbuffer();
		}

		this.setSize( width, height );
	}


	public setSize( width: number, height: number ): void {
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
				this.height,
			);
			this.gl.framebufferRenderbuffer(
				this.gl.FRAMEBUFFER,
				this.gl.DEPTH_ATTACHMENT,
				this.gl.RENDERBUFFER,
				this.depthBuffer,
			);
		}

		if ( this.stencilBuffer ) {
			this.gl.bindRenderbuffer( this.gl.RENDERBUFFER, this.stencilBuffer );
			this.gl.renderbufferStorage(
				this.gl.RENDERBUFFER,
				this.gl.STENCIL_INDEX8,
				this.width,
				this.height,
			);
			this.gl.framebufferRenderbuffer(
				this.gl.FRAMEBUFFER,
				this.gl.STENCIL_ATTACHMENT,
				this.gl.RENDERBUFFER,
				this.stencilBuffer,
			);
		}

		if ( this.depthStencilBuffer ) {
			this.gl.bindRenderbuffer( this.gl.RENDERBUFFER, this.depthStencilBuffer );
			this.gl.renderbufferStorage(
				this.gl.RENDERBUFFER,
				this.gl.DEPTH_STENCIL,
				this.width,
				this.height,
			);
			this.gl.framebufferRenderbuffer(
				this.gl.FRAMEBUFFER,
				this.gl.DEPTH_STENCIL_ATTACHMENT,
				this.gl.RENDERBUFFER,
				this.depthStencilBuffer,
			);
		}
	}


	public use(): void {
		this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.fbo );
		this.gl.viewport( 0, 0, this.width, this.height );
	}


	public prepare(): WebGLTexture {
		return this.texture;
	}


	public clear(): void {
		this.use();

		let bitMask = this.gl.COLOR_BUFFER_BIT;
		// eslint-disable-next-line no-bitwise
		if ( this.depthBuffer || this.depthStencilBuffer ) bitMask |= this.gl.DEPTH_BUFFER_BIT;
		// eslint-disable-next-line no-bitwise
		if ( this.stencilBuffer || this.depthStencilBuffer ) bitMask |= this.gl.STENCIL_BUFFER_BIT;

		this.gl.clear( bitMask );
	}


	public clearColor(): void {
		this.use();
		this.gl.clear( this.gl.COLOR_BUFFER_BIT );
	}


	public clearStencil(): void {
		this.use();
		this.gl.clear( this.gl.STENCIL_BUFFER_BIT );
	}


	public clearDepth(): void {
		this.use();
		this.gl.clear( this.gl.DEPTH_BUFFER_BIT );
	}


	public delete(): void {
		this.gl.deleteFramebuffer( this.fbo );
		this.gl.deleteTexture( this.texture );
		if ( this.depthBuffer ) this.gl.deleteRenderbuffer( this.depthBuffer );
		if ( this.stencilBuffer ) this.gl.deleteRenderbuffer( this.stencilBuffer );
		if ( this.depthStencilBuffer ) this.gl.deleteRenderbuffer( this.depthStencilBuffer );
	}
}
