export function create() {
	return new Float32Array( 1 );
}


export function get( a: Float32Array ) {
	return a[0];
}

export function clone( a: Float32Array ) {
	const out = new Float32Array( 1 );
	out[0] = a[0];

	return out;
}


export function fromValue( x: number ) {
	const out = new Float32Array( 1 );
	out[0] = x;

	return out;
}


export function copy( out: Float32Array, a: Float32Array ) {
	out[0] = a[0];

	return out;
}


export function set( out: Float32Array, x: number ) {
	out[0] = x;

	return out;
}
