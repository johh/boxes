import { vec2, vec3, vec4, mat2, mat3, mat4 } from 'gl-matrix';

export type UniformValue =
	number |
	{ type: 'int', value: number } |
	vec2 | vec3 | vec4 |
	mat2 | mat3 | mat4;
