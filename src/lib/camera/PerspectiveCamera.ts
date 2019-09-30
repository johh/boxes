import { mat4 } from 'gl-matrix';

import GenericCamera, { Camera } from './GenericCamera';


interface PerspectiveCameraProps {
	fov?: number;
	aspect?: number;
	near?: number;
	far?: number;
}

export default class PerspectiveCamera extends GenericCamera implements Camera {
	public fov: number;
	public aspect: number;
	public near: number;
	public far: number;


	constructor( props: PerspectiveCameraProps = {}) {
		super();

		const {
			fov = 90,
			aspect = 1,
			near = .1,
			far = 1000,
		} = props;

		// TODO: some sanity checks

		this.fov = fov;
		this.aspect = aspect;
		this.near = near;
		this.far = far;

		this.updateProjectionMatrix();
	}


	public updateProjectionMatrix() {
		mat4.perspective(
			this.projectionMatrix,
			this.fov * Math.PI / 180,
			this.aspect,
			this.near,
			this.far,
		);
	}
}
