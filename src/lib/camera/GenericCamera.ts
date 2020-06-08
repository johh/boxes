import { mat4 } from 'gl-matrix';

import TransformNode from '../TransformNode';


export default class GenericCamera extends TransformNode {
	public projectionMatrix: mat4 = mat4.create();
	public viewMatrix: mat4 = mat4.create();


	public updateMatrices( parentWorldMatrix?: mat4 ): void {
		super.updateMatrices( parentWorldMatrix );
		this.viewMatrix = mat4.invert( this.viewMatrix, this.worldMatrix );
	}
}


export interface Camera {
	projectionMatrix: mat4;
	viewMatrix: mat4;
	aspect: number;
	updateMatrices: () => void;
	updateProjectionMatrix: () => void;
}
