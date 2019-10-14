import { vec2, vec3, vec4, mat2, mat3, mat4 } from 'gl-matrix';

import { Texture } from './texture/GenericTexture';


export type UniformValue =
	number |
	Float32Array |
	Int32Array |
	Texture |
	vec2 | vec3 | vec4 |
	mat2 | mat3 | mat4;


export type InternalUniformValue =
	Float32Array |
	Int32Array |
	vec2 | vec3 | vec4 |
	mat2 | mat3 | mat4;
