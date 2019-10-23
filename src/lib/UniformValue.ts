import { vec2, vec3, vec4, mat2, mat3, mat4 } from 'gl-matrix';

import { Texture } from './texture/GenericTexture';


export type UniformValue =
	Texture | InternalUniformValue;


export type InternalUniformValue =
	Float32Array |
	Int32Array |
	vec2 | vec3 | vec4 |
	mat2 | mat3 | mat4;
