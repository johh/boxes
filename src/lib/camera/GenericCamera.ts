import { mat4 } from 'gl-matrix';

import TransformNode from '../TransformNode';


export default class GenericCamera extends TransformNode {
	public projectionMatrix: mat4 = mat4.create();
	public viewMatrix: mat4 = mat4.create();


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
