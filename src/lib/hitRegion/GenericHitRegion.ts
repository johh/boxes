import { mat4, vec2 } from 'gl-matrix';

import Traversable from '../Traversable';
// eslint-disable-next-line import/no-cycle
import Scene from '../Scene';


export default class GenericHitRegion extends Traversable {
	public readonly isHitRegion = true;
	public worldMatrix = mat4.create();
	public scene: Scene;

	public setWorldMatrix( worldMatrix: mat4 ): void {
		mat4.copy( this.worldMatrix, worldMatrix );
	}
}


export interface HitRegion {
	isHitRegion: true;
	worldMatrix: mat4;
	scene: Scene;
	setWorldMatrix: ( worldMatrix: mat4 ) => void;
	test: ( coords: vec2 ) => unknown;
}
