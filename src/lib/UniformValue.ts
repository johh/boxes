import { vec2, vec3, vec4, mat2, mat3, mat4 } from 'gl-matrix';

import { Texture } from './texture/GenericTexture';


export type UniformValue =
	number |
	{ type: 'int', value: number } |
	{ type: 'floatArray', value: Float32Array } |
	{ type: 'vec2Array', value: Float32Array } |
	{ type: 'vec3Array', value: Float32Array } |
	{ type: 'vec4Array', value: Float32Array } |
	Texture |
	vec2 | vec3 | vec4 |
	mat2 | mat3 | mat4;
