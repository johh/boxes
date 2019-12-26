import { mat4 } from 'gl-matrix';

import Traversable from './Traversable';
import TransformNode from './TransformNode';
import Renderable from './Renderable';
import UniformProivder from './UniformProvider';
import HitRegion from './hitRegion/GenericHitRegion';
import { Camera } from './camera/GenericCamera';


type RenderTask = {
	task?: ( gl: WebGLRenderingContext, view: mat4, projection: mat4 ) => void;
	order: number;
	subtasks?: RenderTask[];
};


export default class Scene extends Traversable {
	private worldMatrix = mat4.create();
	private renderQueue: RenderTask[] = [];
	private shouldRebuildSceneGraph: boolean = true;
	public activeCamera: Camera;
	public readonly isScene = true;


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
			} else if ( !node.maskOnly || queueMasks ) {
				if ( node.onBeforeRender ) {
					renderQueue.push({
						order: 0,
						task: () => node.onBeforeRender( node ),
					});
				}

				if ( 'isUniformProvider' in node ) {
					const childProviders = uniformProviders.slice( 0 );
					childProviders.push( node );

					processChildren( childProviders );
				} else {
					processChildren();
				}
			}
		}
	}


	static runRecursive( task: RenderTask, gl: WebGLRenderingContext, view: mat4, projection: mat4 ) {
		if ( task.task ) task.task( gl, view, projection );
		if ( task.subtasks ) task.subtasks.forEach( t => Scene.runRecursive( t, gl, view, projection ) );
	}


	public calculateTransforms(
			node: Renderable | TransformNode | HitRegion | Traversable,
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

			if ( 'isHitRegion' in node ) {
				node.setWorldMatrix( worldMatrix );
				node.scene = this;
			}

			node.children.forEach( ( child ) => {
				this.calculateTransforms( child, worldMatrix );
			});
		}

	}


	public invalidateSceneGraph() {
		this.shouldRebuildSceneGraph = true;
	}


	public render(
		gl: WebGLRenderingContext,
	) {
		this.calculateTransforms( this, this.worldMatrix );

		if ( !this.activeCamera ) {
			console.warn( 'Scene: No active camera provided.' );

			return;
		}

		this.activeCamera.updateMatrices();

		const {
			viewMatrix,
			projectionMatrix,
		} = this.activeCamera;

		if ( this.shouldRebuildSceneGraph ) {
			this.renderQueue = [];
			Scene.queueRenderables( gl, this, this.renderQueue, []);

			this.shouldRebuildSceneGraph = false;
		}

		this.renderQueue.sort( ( a, b ) => a.order - b.order );
		this.renderQueue.forEach( t => Scene.runRecursive( t, gl, viewMatrix, projectionMatrix ) );
	}
}
