import { mat4 } from 'gl-matrix';

import GenericCamera, { Camera } from './GenericCamera';


interface OrthoCameraProps {
	top?: number;
	left?: number;
	right?: number;
	bottom?: number;
	near?: number;
	far?: number;
}


export default class OrthoCamera extends GenericCamera implements Camera {
	public top: number;
	public left: number;
	public right: number;
	public bottom: number;
	public near: number;
	public far: number;
	public aspect: number;


	constructor( props: OrthoCameraProps = {}) {
		super();

		const {
			top = 1,
			left = -1,
			right = 1,
			bottom = -1,
			near = -100,
			far = 100,
		} = props;

		this.top = top;
		this.left = left;
		this.right = right;
		this.bottom = bottom;
		this.near = near;
		this.far = far;

		this.updateProjectionMatrix();
	}


	public updateProjectionMatrix(): void {
		this.aspect = Math.abs( this.right - this.left ) / Math.abs( this.top - this.bottom );

		mat4.ortho(
			this.projectionMatrix,
			this.left,
			this.right,
			this.bottom,
			this.top,
			this.near,
			this.far,
		);
	}
}
