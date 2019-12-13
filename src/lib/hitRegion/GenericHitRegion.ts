import { mat4, vec2 } from 'gl-matrix';

import Traversable from '../Traversable';
import { Camera } from '../camera/GenericCamera';


export default class GenericHitRegion extends Traversable {
	public readonly isHitRegion = true;
	public worldMatrix = mat4.create();

	public setWorldMatrix( worldMatrix: mat4 ) {
		mat4.copy( this.worldMatrix, worldMatrix );
	}
}


export interface HitRegion {
	isHitRegion: true;
	worldMatrix: mat4;
	setWorldMatrix: ( worldMatrix: mat4 ) => void;
	test: ( camera: Camera, coords: vec2 ) => any;
}
