/* eslint-disable @typescript-eslint/indent */
import type { TextureFormat, TextureType } from '../texture/TextureTypes';


export default function arrayFromTextureProps(
	type: TextureType,
	format: TextureFormat,
): Uint8Array | Uint16Array | Float32Array {
	let ArrayCtor: Float32ArrayConstructor | Uint16ArrayConstructor | Uint8ArrayConstructor;

	switch ( type ) {
		case WebGLRenderingContext.FLOAT:
			ArrayCtor = Float32Array;
			break;

		case 0x8d61: // OES_half_float
			ArrayCtor = Uint16Array;
			break;

		default:
			ArrayCtor = Uint8Array;
	}

	switch ( format ) {
		case WebGLRenderingContext.RGBA:
			return new ArrayCtor([0, 0, 0, 0]);

		case WebGLRenderingContext.RGB:
			return new ArrayCtor([0, 0, 0]);

		case WebGLRenderingContext.LUMINANCE_ALPHA:
			return new ArrayCtor([0, 0]);

		default:
			return new ArrayCtor([0]);
	}
}
