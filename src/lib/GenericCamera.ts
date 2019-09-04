import { mat4, vec3 } from 'gl-matrix';

import Transform from './Transform';


export default class GenericCamera extends Transform {
	public projectionMatrix: mat4 = mat4.create();
	public viewMatrix: mat4 = mat4.create();


	constructor() {
		super();
	}


	public updateMatrices() {
		this.updateLocalMatrix();
		this.viewMatrix = mat4.invert( this.viewMatrix, this.localMatrix );
	}
}


export interface Camera {
	projectionMatrix: mat4;
	viewMatrix: mat4;
	updateMatrices: () => void;
	updateProjectionMatrix: () => void;
}
