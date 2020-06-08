/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */

export function create(): Float32Array {
	return new Float32Array( 1 );
}


export function get( a: Float32Array ): number {
	return a[0];
}

export function clone( a: Float32Array ): Float32Array {
	const out = new Float32Array( 1 );
	out[0] = a[0];

	return out;
}


export function fromValue( x: number ): Float32Array {
	const out = new Float32Array( 1 );
	out[0] = x;

	return out;
}


export function copy( out: Float32Array, a: Float32Array ): Float32Array {
	out[0] = a[0];

	return out;
}


export function set( out: Float32Array, x: number ): Float32Array {
	out[0] = x;

	return out;
}
