import { mat4 } from 'gl-matrix';

import BufferGeometry from './BufferGeometry';
import Material from './Material';
import TransformNode, { TransformNodeProps } from './TransformNode';
import Traversable from './Traversable';

interface RenderableProps extends TransformNodeProps {
	geometry: BufferGeometry;
	material: Material;
	depthTest?: boolean;
	depthWrite?: boolean;
	mask?: Traversable;
}

export default class Renderable extends TransformNode {
	public readonly isRenderable = true;
	public geometry: BufferGeometry;
	public material: Material;
	public depthTest: boolean;
	public depthWrite: boolean;
	public mask: Traversable;

	constructor( props: RenderableProps ) {
		super( props );

		const {
			geometry,
			material,
			mask,
			depthTest = true,
			depthWrite = true,
		} = props;

		this.geometry = geometry;
		this.material = material;
		this.depthTest = depthTest;
		this.depthWrite = depthWrite;
		this.mask = mask;

		this.material.setUniform( 'u_mModel', mat4.create() );
		this.material.setUniform( 'u_mView', mat4.create() );
		this.material.setUniform( 'u_mProjection', mat4.create() );
	}


	render( gl: WebGLRenderingContext, viewMatrix: mat4, projectionMatrix: mat4 ) {
		// compute model matrix

		this.material.updateUniform( 'u_mModel', ( m: mat4 ) => mat4.copy( m, this.worldMatrix ) );
		this.material.updateUniform( 'u_mView', ( m: mat4 ) => mat4.copy( m, viewMatrix ) );
		this.material.updateUniform( 'u_mProjection', ( m: mat4 ) => mat4.copy( m, projectionMatrix ) );


		if ( !this.depthTest ) gl.disable( gl.DEPTH_TEST );
		if ( !this.depthWrite ) gl.depthMask( false );
		this.material.use( gl );
		this.geometry.draw( gl );
		if ( !this.depthTest ) gl.enable( gl.DEPTH_TEST );
		if ( !this.depthWrite ) gl.depthMask( true );
	}
}
