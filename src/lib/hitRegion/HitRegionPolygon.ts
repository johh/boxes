import { vec4, vec2, mat4 } from 'gl-matrix';

import { TraversableProps } from '../Traversable';
import GenericHitRegion, { HitRegion } from './GenericHitRegion';
import { Camera } from '../camera/GenericCamera';
import BufferGeometry from '../BufferGeometry';
import Renderable from '../Renderable';
import Material from '../Material';
import fastPointInPolygon from '../math/fastPointInPolygon';


const mouse = vec2.create();


interface HitRegionPolygonProps extends TraversableProps {
	listener?: () => void;
	verts?: number[];
}


export default class HitRegionPolygon extends GenericHitRegion implements HitRegion {
	public listener: () => void;
	private verts: vec4[];
	private initialVerts: number[];
	private matrix = mat4.create();

	constructor( props: HitRegionPolygonProps ) {
		super( props );


		const {
			listener,
			verts = [-.5, -.5, -.5, .5, .5, .5, .5, -.5],
		} = props;

		this.listener = listener;
		this.initialVerts = verts.slice( 0 );


		// TODO: sanity checks
		this.verts = Array( verts.length / 2 ).fill( 0 ).map( () => vec4.create() );
	}


	private resetVerts() {
		this.verts.forEach( ( vert, i ) => {
			vec4.set( vert, this.initialVerts[i * 2], this.initialVerts[i * 2 + 1], 0, 1 );
		});
	}


	public test( camera: Camera, coords: vec2 ) {
		mat4.mul( this.matrix, camera.projectionMatrix, camera.viewMatrix );
		mat4.mul( this.matrix, this.matrix, this.worldMatrix );

		this.resetVerts();
		this.verts.forEach( ( vert ) => {
			vec4.transformMat4( vert, vert, this.matrix );

			vert[0] = vert[0] / vert[3];
			vert[1] = vert[1] / vert[3];
		});

		vec2.set( mouse, coords[0], coords[1]);


		if ( fastPointInPolygon( mouse, this.verts ) ) {
			console.log( 'IN POLY!' );
		}
	}

	public debug() {
		const geometry = new BufferGeometry({
			verts: this.initialVerts,
			stride: 2,
			mode: WebGLRenderingContext.LINE_LOOP,
		});

		this.append(
			new Renderable({
				geometry,
				material: new Material(),
			}),
		);
	}
}
