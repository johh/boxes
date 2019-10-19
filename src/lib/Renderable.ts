import { mat4 } from 'gl-matrix';

import BufferGeometry from './BufferGeometry';
import Material from './Material';
import TransformNode, { TransformNodeProps } from './TransformNode';
import Traversable from './Traversable';


type BlendType = 'normal' | 'additive';


interface RenderableProps extends TransformNodeProps {
	geometry: BufferGeometry;
	material: Material;
	depthTest?: boolean;
	depthWrite?: boolean;
	mask?: Traversable;
	blending?: BlendType;
	renderOrder?: number;
}


export default class Renderable extends TransformNode {
	public readonly isRenderable = true;
	public geometry: BufferGeometry;
	public material: Material;
	public depthTest: boolean;
	public depthWrite: boolean;
	public mask: Traversable;
	public blending: BlendType;
	public renderOrder: number;


	constructor( props: RenderableProps ) {
		super( props );

		const {
			geometry,
			material,
			mask,
			depthTest = true,
			depthWrite = true,
			blending = 'normal',
			renderOrder = 0,
		} = props;

		this.geometry = geometry;
		this.material = material;
		this.depthTest = depthTest;
		this.depthWrite = depthWrite;
		this.mask = mask;
		this.blending = blending;
		this.renderOrder = renderOrder;

		this.material.setUniform( 'u_mModel', mat4.create() );
		this.material.setUniform( 'u_mView', mat4.create() );
		this.material.setUniform( 'u_mProjection', mat4.create() );
	}


	public render( gl: WebGLRenderingContext, viewMatrix: mat4, projectionMatrix: mat4 ) {
		this.material.updateUniform( 'u_mModel', ( m: mat4 ) => mat4.copy( m, this.worldMatrix ) );
		this.material.updateUniform( 'u_mView', ( m: mat4 ) => mat4.copy( m, viewMatrix ) );
		this.material.updateUniform( 'u_mProjection', ( m: mat4 ) => mat4.copy( m, projectionMatrix ) );


		if ( !this.depthTest ) gl.disable( gl.DEPTH_TEST );
		if ( !this.depthWrite ) gl.depthMask( false );

		switch ( this.blending ) {
		case 'additive':
			gl.blendFunc( gl.ONE, gl.ONE );
			break;

		default:
			gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
			break;
		}

		this.material.use( gl, this.geometry.attributeNames );
		this.geometry.draw( gl );

		if ( !this.depthTest ) gl.enable( gl.DEPTH_TEST );
		if ( !this.depthWrite ) gl.depthMask( true );
	}


	public delete() {
		this.geometry.delete();
		this.material.delete();
	}
}
