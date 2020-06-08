import { vec4, vec2, mat4 } from 'gl-matrix';

import { TraversableProps } from '../Traversable';
import GenericHitRegion, { HitRegion } from './GenericHitRegion';
import BufferGeometry from '../BufferGeometry';
import Renderable from '../Renderable';
import Material from '../Material';
import fastPointInPolygon from '../math/fastPointInPolygon';


const mouse = vec2.create();


interface HitRegionPolygonProps extends TraversableProps {
	verts?: number[];
}


export default class HitRegionPolygon extends GenericHitRegion implements HitRegion {
	private verts: vec4[];
	private initialVerts: number[];
	private matrix = mat4.create();


	constructor( props: HitRegionPolygonProps ) {
		super( props );

		const {
			verts = [-.5, -.5, -.5, .5, .5, .5, .5, -.5],
		} = props;

		this.initialVerts = verts.slice( 0 );

		// TODO: sanity checks
		this.verts = Array( verts.length / 2 ).fill( 0 ).map( () => vec4.create() );
	}


	private resetVerts(): void {
		this.verts.forEach( ( vert, i ) => {
			vec4.set( vert, this.initialVerts[i * 2], this.initialVerts[i * 2 + 1], 0, 1 );
		});
	}


	public test( coords: vec2 ): boolean {
		if ( !this.scene ) return false;

		const { projectionMatrix, viewMatrix } = this.scene.activeCamera;

		mat4.mul( this.matrix, projectionMatrix, viewMatrix );
		mat4.mul( this.matrix, this.matrix, this.worldMatrix );

		this.resetVerts();
		this.verts.forEach( ( vert ) => {
			vec4.transformMat4( vert, vert, this.matrix );

			// eslint-disable-next-line no-param-reassign
			vert[0] /= vert[3];
			// eslint-disable-next-line no-param-reassign
			vert[1] /= vert[3];
		});

		vec2.set( mouse, coords[0], coords[1]);


		return fastPointInPolygon( mouse, this.verts );
	}


	public debug(): void {
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
