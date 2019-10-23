import { mat4 } from 'gl-matrix';

import Traversable from './Traversable';
import TransformNode from './TransformNode';
import Renderable from './Renderable';
import UniformProivder from './UniformProvider';


type RenderTask = {
	task?: ( gl: WebGLRenderingContext, view: mat4, projection: mat4 ) => void;
	order: number;
	subtasks?: RenderTask[];
};

const renderNode = (
	node: Renderable,
	gl: WebGLRenderingContext,
	view: mat4,
	projection: mat4,
) => {
	if ( node.onBeforeRender ) node.onBeforeRender( node );
	node.render( gl, view, projection );
};

export default class Scene implements Traversable {
	public children: Traversable[] = [];
	public visible: boolean = true;
	private worldMatrix = mat4.create();


	public append( child: Traversable ) {
		if ( child.parent && child.parent !== this ) child.parent.remove( child );
		if ( !this.children.includes( child ) ) {
			this.children.push( child );
			child.parent = this;
		}
	}


	public remove( child: Traversable ) {
		if ( this.children.includes( child ) ) {
			this.children.splice( this.children.findIndex( c => c === child ), 1 );
			child.parent = null;
		}
	}


	static queueRenderables(
		gl: WebGLRenderingContext,
		node: Renderable | TransformNode | UniformProivder | Traversable,
		renderQueue: RenderTask[],
		uniformProviders: UniformProivder[],
		queueMasks: boolean = false,
	) {
		const processChildren = ( _uniformProviders = uniformProviders ) => {
			node.children.forEach( ( child ) => {
				Scene.queueRenderables( gl, child, renderQueue, _uniformProviders, queueMasks );
			});
		};

		if ( node.visible ) {
			if (
				'isRenderable' in node
			) {
				const renderNode = (
					view: mat4,
					projection: mat4,
				) => {
					uniformProviders.forEach( p => p.applyUniformsToNode( node ) );
					if ( node.onBeforeRender ) node.onBeforeRender( node );
					node.render( gl, view, projection );
				};

				if ( !node.maskOnly || queueMasks ) {
					if ( node.mask ) {
						const subtasks: RenderTask[] = [
							{
								order: -Infinity,
								task: ( gl ) => {
									gl.clear( gl.STENCIL_BUFFER_BIT );
									gl.stencilOp( gl.KEEP, gl.KEEP, gl.REPLACE );
									gl.stencilFunc( gl.ALWAYS, 1, 0xff );
									gl.stencilMask( 0xff );
									gl.colorMask( false, false, false, false );
									gl.depthMask( false );
									gl.enable( gl.STENCIL_TEST );
								},
							},
							{
								order: Infinity,
								task: ( gl, view, projection ) => {
									gl.stencilFunc( gl.EQUAL, 1, 0xff );
									gl.stencilMask( 0x00 );
									gl.colorMask( true, true, true, true );
									gl.depthMask( true );

									renderNode( view, projection );

									gl.stencilMask( -1 );
									gl.disable( gl.STENCIL_TEST );
								},
							},
						];
						Scene.queueRenderables( gl, node.mask, subtasks, uniformProviders, true );
						subtasks.sort( ( a, b ) => a.order - b.order );

						renderQueue.push({
							subtasks,
							order: node.renderOrder,
						});
					} else {
						renderQueue.push({
							order: node.renderOrder,
							task: ( gl, view, projection ) => {
								renderNode( view, projection );
							},
						});
					}

					processChildren();
				}
			} else if (
				'isTransformNode' in node
			) {
				if ( !node.maskOnly || queueMasks ) {
					if ( node.onBeforeRender ) {
						renderQueue.push({
							order: 0,
							task: () => node.onBeforeRender( node ),
						});
					}

					processChildren();
				}
			} else if ( 'isUniformProvider' in node ) {
				const childProviders = uniformProviders.slice( 0 );
				childProviders.push( node );

				processChildren( childProviders );
			} else {
				processChildren();
			}
		}
	}


	static calculateTransforms(
		node: Renderable | TransformNode | Traversable,
		parentWorldMatrix: mat4,
	) {
		if ( node.visible ) {
			let worldMatrix: mat4;

			if ( 'isTransformNode' in node ) {
				if ( node.onBeforeTransform ) node.onBeforeTransform( node );

				node.updateMatrices( parentWorldMatrix );
				worldMatrix = node.worldMatrix;
			} else {
				worldMatrix = parentWorldMatrix;
			}

			node.children.forEach( ( child ) => {
				Scene.calculateTransforms( child, worldMatrix );
			});
		}

	}


	static runRecursive( task: RenderTask, gl: WebGLRenderingContext, view: mat4, projection: mat4 ) {
		if ( task.task ) task.task( gl, view, projection );
		if ( task.subtasks ) task.subtasks.forEach( t => Scene.runRecursive( t, gl, view, projection ) );
	}


	render(
		gl: WebGLRenderingContext,
		viewMatrix: mat4,
		projectionMatrix: mat4,
	) {
		const renderQueue: RenderTask[] = [];
		Scene.calculateTransforms( this, this.worldMatrix );
		Scene.queueRenderables( gl, this, renderQueue, []);

		renderQueue.sort( ( a, b ) => a.order - b.order );
		renderQueue.forEach( t => Scene.runRecursive( t, gl, viewMatrix, projectionMatrix ) );
	}
}
