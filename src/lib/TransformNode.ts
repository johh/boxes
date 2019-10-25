import { vec3, mat4, quat } from 'gl-matrix';
import Traversable, { TraversableProps } from './Traversable';


export interface TransformNodeProps extends TraversableProps {
	onBeforeTransform?: ( ref: TransformNode ) => void;
}


export default class TransformNode extends Traversable {
	public readonly isTransformNode = true;
	public onBeforeTransform: ( ref: TransformNode ) => void;
	public origin = vec3.create();
	public translation = vec3.create();
	public scale = vec3.fromValues( 1, 1, 1 );
	public rotation = vec3.create();
	public localMatrix = mat4.create();
	public worldMatrix = mat4.create();
	private quatRotation = quat.create();


	constructor( props: TransformNodeProps = {}) {
		super( props );

		const {
			onBeforeTransform = null,
		} = props;

		this.onBeforeTransform = onBeforeTransform;
	}


	public updateLocalMatrix() {
		quat.fromEuler( this.quatRotation, this.rotation[0], this.rotation[1], this.rotation[2]);

		mat4.fromRotationTranslationScaleOrigin(
			this.localMatrix,
			this.quatRotation,
			this.translation,
			this.scale,
			this.origin,
		);

		return this.localMatrix;
	}


	public updateWorldMatrix( parentWorldMatrix?: mat4 ) {
		if ( parentWorldMatrix ) {
			mat4.mul( this.worldMatrix, parentWorldMatrix, this.localMatrix );
		} else {
			mat4.copy( this.worldMatrix, this.localMatrix );
		}
	}


	public updateMatrices( parentWorldMatrix?: mat4 ) {
		// TODO: check if localMatrix needs update
		this.updateLocalMatrix();
		this.updateWorldMatrix( parentWorldMatrix );
	}
}
