import { mat4 } from 'gl-matrix';

import BufferGeometry from './BufferGeometry';
import Material from './Material';
import TransformNode from './TransformNode';

interface RenderableProps {
	geometry: BufferGeometry;
	material: Material;
	depthTest?: boolean;
	depthWrite?: boolean;
	visible?: boolean;
}

export default class Renderable extends TransformNode {
	public readonly isRenderable = true;
	public geometry: BufferGeometry;
	public material: Material;
	public depthTest: boolean;
	public depthWrite: boolean;
	public visible: boolean;

	constructor( props: RenderableProps ) {
		super();

		const {
			geometry,
			material,
			depthTest = true,
			depthWrite = true,
			visible = true,
		} = props;

		this.geometry = geometry;
		this.material = material;
		this.depthTest = depthTest;
		this.depthWrite = depthWrite;
		this.visible = visible;

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
