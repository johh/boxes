export type TextureFormat =
	WebGLRenderingContext['RGB'] |
	WebGLRenderingContext['RGBA'] |
	WebGLRenderingContext['ALPHA'] |
	WebGLRenderingContext['LUMINANCE'] |
	WebGLRenderingContext['LUMINANCE_ALPHA'];


export type TextureType =
	WebGLRenderingContext['UNSIGNED_BYTE'] |
	WebGLRenderingContext['UNSIGNED_SHORT_5_6_5'] |
	WebGLRenderingContext['UNSIGNED_SHORT_4_4_4_4'] |
	WebGLRenderingContext['UNSIGNED_SHORT_5_5_5_1'];


export type WrappingType =
	WebGLRenderingContext['CLAMP_TO_EDGE'] |
	WebGLRenderingContext['REPEAT'] |
	WebGLRenderingContext['MIRRORED_REPEAT'];


export type MinFilterType =
	WebGLRenderingContext['NEAREST'] |
	WebGLRenderingContext['LINEAR'] |
	WebGLRenderingContext['NEAREST_MIPMAP_NEAREST'] |
	WebGLRenderingContext['LINEAR_MIPMAP_NEAREST'] |
	WebGLRenderingContext['NEAREST_MIPMAP_LINEAR'] |
	WebGLRenderingContext['LINEAR_MIPMAP_LINEAR'];


export interface SharedTextureProps {
	format?: TextureFormat;
	type?: TextureType;
	mipmaps?: boolean;
	minFilter?: MinFilterType;
}


export interface TextureWrapProps {
	wrapS?: WrappingType;
	wrapT?: WrappingType;
}


export interface Texture {
	isTexture: true;
	isCubemap: boolean;
	prepare: ( gl: WebGLRenderingContext ) => WebGLTexture;
}


export type RawTextureData = {
	data: Float32Array | Uint8Array | Uint16Array;
	width: number;
	height: number;
};


export type TextureData = TexImageSource | RawTextureData;
