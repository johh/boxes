export function create() {
	return new Int32Array( 1 );
}


export function get( a: Int32Array ) {
	return a[0];
}


export function clone( a: Int32Array ) {
	const out = new Int32Array( 1 );
	out[0] = a[0];

	return out;
}


export function fromValue( x: number ) {
	const out = new Int32Array( 1 );
	out[0] = x;

	return out;
}


export function copy( out: Int32Array, a: Int32Array ) {
	out[0] = a[0];

	return out;
}


export function set( out: Int32Array, x: number ) {
	out[0] = x;

	return out;
}
