import { vec4, vec2 } from 'gl-matrix';

import GenericHitRegion, { HitRegion } from './GenericHitRegion';
import { TraversableProps } from '../Traversable';
import { Camera } from '../camera/GenericCamera';


const vert = vec4.create();
const projected = vec2.create();
const mouse = vec2.create();


interface HitRegionSphereProps extends TraversableProps {
	radius?: number;
}


export default class HitRegionSphere extends GenericHitRegion implements HitRegion{
	public radius: number;


	constructor( props: HitRegionSphereProps ) {
		super( props );

		const {
			radius = 1,
		} = props;

		this.radius = radius;
	}


	public test( camera: Camera, coords: vec2 ): number {
		vec4.set( vert, 0, 0, 0, 1 );
		vec4.transformMat4( vert, vert, this.worldMatrix );
		vec4.transformMat4( vert, vert, camera.viewMatrix );
		vec4.transformMat4( vert, vert, camera.projectionMatrix );

		vec2.set( projected, vert[0] / vert[3] * camera.aspect, vert[1] / vert[3]);

		vec2.set( mouse, coords[0] * camera.aspect, coords[1]);

		const maxDistance = this.radius / vert[3] * camera.projectionMatrix[5];
		const distance = vec2.distance( mouse, projected );

		if ( distance < maxDistance ) {
			return 1 - ( distance / maxDistance );
		}

		return 0;
	}
}
