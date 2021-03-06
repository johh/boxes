/* eslint-disable import/no-cycle */

import * as float from './lib/math/float';
import * as int from './lib/math/int';

export const enums = typeof WebGLRenderingContext !== 'undefined'
	? WebGLRenderingContext
	: {} as typeof WebGLRenderingContext;


export { default as Renderer } from './lib/Renderer';
export { default as Material } from './lib/Material';
export { default as UniformProvider } from './lib/UniformProvider';
export { default as BufferGeometry } from './lib/geometry/BufferGeometry';
export { default as InstancedAttribute } from './lib/geometry/InstancedAttribute';
export { default as Renderable } from './lib/Renderable';
export { default as Scene } from './lib/Scene';
export { default as TransformNode } from './lib/TransformNode';
export { default as OrthoCamera } from './lib/camera/OrthoCamera';
export { default as PerspectiveCamera } from './lib/camera/PerspectiveCamera';
export { default as PostFxPipeline } from './lib/post/PostFxPipeline';
export { default as ShaderPass } from './lib/post/ShaderPass';
export { default as Framebuffer } from './lib/post/Framebuffer';

export { default as HitRegionSphere } from './lib/hitRegion/HitRegionSphere';
export { default as HitRegionPolygon } from './lib/hitRegion/HitRegionPolygon';

export { default as ImageTexture } from './lib/texture/ImageTexture';
export { default as GenericTexture } from './lib/texture/GenericTexture';
export { default as ImageCubemap } from './lib/texture/ImageCubemap';
export { default as GenericCubemap } from './lib/texture/GenericCubemap';

export { int, float };
export {
	vec2, vec3, vec4, mat3, mat4, quat,
} from 'gl-matrix';
