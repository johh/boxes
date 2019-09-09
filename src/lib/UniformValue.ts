import { vec2, vec3, vec4, mat2, mat3, mat4 } from 'gl-matrix';

import { Texture } from './texture/GenericTexture';


export type UniformValue =
	number |
	{ type: 'int', value: number } |
	Texture |
	vec2 | vec3 | vec4 |
	mat2 | mat3 | mat4;
