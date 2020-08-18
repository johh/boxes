/* eslint-disable indent */
import { mat4 } from 'gl-matrix';

import BufferGeometry from './geometry/BufferGeometry';
import Material from './Material';
import TransformNode, { TransformNodeProps } from './TransformNode';
import Traversable from './Traversable';
import { Renderer } from '../boxes';


type BlendType = 'normal' | 'additive';


export interface RenderableProps extends TransformNodeProps {
	geometry: BufferGeometry;
	material: Material;
	depthTest?: boolean;
	depthWrite?: boolean;
	flipFaces?: boolean;
	mask?: Traversable;
	blending?: BlendType;
	renderOrder?: number;
	layer?: number;
}


export default class Renderable extends TransformNode {
	public readonly isRenderable = true;
	public geometry: BufferGeometry;
	public material: Material;
	public depthTest: boolean;
	public depthWrite: boolean;
	public flipFaces: boolean;
	public mask: Traversable;
	public layer: number | undefined;
	public blending: BlendType;
	public renderOrder: number;
	private skipFrame = true;


	constructor( props: RenderableProps ) {
		super( props );

		const {
			geometry,
			material,
			mask,
			layer,
			depthTest = true,
			depthWrite = true,
			flipFaces = false,
			blending = 'normal',
			renderOrder = 0,
		} = props;

		this.geometry = geometry;
		this.material = material;
		this.depthTest = depthTest;
		this.depthWrite = depthWrite;
		this.flipFaces = flipFaces;
		this.mask = mask;
		this.layer = layer;
		this.blending = blending;
		this.renderOrder = renderOrder;

		this.material.setUniform( 'u_mModel', mat4.create() );
		this.material.setUniform( 'u_mView', mat4.create() );
		this.material.setUniform( 'u_mProjection', mat4.create() );
	}


	public render(
		renderer: Renderer,
		viewMatrix: mat4,
		projectionMatrix: mat4,
	): void {
		const { gl } = renderer;

		this.material.updateUniform( 'u_mModel', ( m: mat4 ) => mat4.copy( m, this.worldMatrix ) );
		this.material.updateUniform( 'u_mView', ( m: mat4 ) => mat4.copy( m, viewMatrix ) );
		this.material.updateUniform(
			'u_mProjection',
			( m: mat4 ) => mat4.copy( m, projectionMatrix ),
		);


		if ( !this.depthTest ) gl.disable( gl.DEPTH_TEST );
		if ( !this.depthWrite ) gl.depthMask( false );
		if ( this.flipFaces ) gl.cullFace( gl.FRONT );

		switch ( this.blending ) {
		case 'additive':
			gl.blendFunc( gl.ONE, gl.ONE );
			break;

		default:
			gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
			break;
		}

		const programAvailable = this.material.use( gl );

		// skip drawing on first frame of visibility.
		// this is a workaround to avoid a "FOUC" where uniforms aren't committed yet.

		if ( !this.skipFrame && programAvailable ) {
			this.geometry.draw( renderer, this.material );
		} else if ( programAvailable ) {
			this.skipFrame = false;
		}

		if ( !this.depthTest ) gl.enable( gl.DEPTH_TEST );
		if ( !this.depthWrite ) gl.depthMask( true );
		if ( this.flipFaces ) gl.cullFace( gl.BACK );
	}


	public delete(): void {
		this.geometry.delete();
		this.material.delete();
	}
}
