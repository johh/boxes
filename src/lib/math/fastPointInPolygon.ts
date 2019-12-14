import { vec2, vec4 } from 'gl-matrix';


export default function fastPointInPolygon( point: vec2, polygon: vec2[] | vec4[]): boolean {
	// ray-casting algorithm based on
	// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
	// https://stackoverflow.com/a/29915728

	// THIS WILL NOT WORK RELIABLY FOR POINTS ON EDGES AND CORNERS

	const x = point[0];
	const y = point[1];

	let isInside: boolean = false;

	let p1 = polygon.length - 1;
	for ( let p0 = 0; p0 < polygon.length; p0 += 1 ) {

		const p0x = polygon[p0][0];
		const p0y = polygon[p0][1];
		const p1x = polygon[p1][0];
		const p1y = polygon[p1][1];

		const intersect = ( ( p0y > y ) !== ( p1y > y ) )
			&& ( x < ( p1x - p0x ) * ( y - p0y ) / ( p1y - p0y ) + p0x );

		if ( intersect ) isInside = !isInside;

		p1 = p0;
	}

	return isInside;
}
