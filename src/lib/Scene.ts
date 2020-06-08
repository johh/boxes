import { mat4 } from 'gl-matrix';

import Traversable from './Traversable';
import TransformNode from './TransformNode';
import Renderable from './Renderable';
import UniformProivder from './UniformProvider';
// eslint-disable-next-line import/no-cycle
import GenericHitRegion from './hitRegion/GenericHitRegion';
import { Camera } from './camera/GenericCamera';


type RenderTask = {
	task?: ( gl: WebGLRenderingContext, view: mat4, projection: mat4 ) => void;
	order: number;
	subtasks?: RenderTask[];
	layer: number;
};


export default class Scene extends Traversable {
	private worldMatrix = mat4.create();
	private renderQueue: RenderTask[] = [];
	private shouldRebuildSceneGraph = true;
	public activeCamera: Camera;
	public activeLayer: number | undefined;
	public readonly isScene = true;


	static queueRenderables(
		gl: WebGLRenderingContext,
		node: Renderable | TransformNode | UniformProivder | Traversable,
		renderQueue: RenderTask[],
		uniformProviders: UniformProivder[],
		queueMasks = false,
		parentLayer: number | undefined,
	): void {
		const processChildren = (
			_parentLayer = parentLayer,
			_uniformProviders = uniformProviders,
		): void => {
			node.children.forEach( ( child ) => {
				Scene.queueRenderables(
					gl, child, renderQueue, _uniformProviders, queueMasks, _parentLayer,
				);
			});
		};

		if ( node.visible ) {
			if (
				'isRenderable' in node
			) {
				const layer = node.layer || parentLayer;

				const renderNode = (
					view: mat4,
					projection: mat4,
				): void => {
					uniformProviders.forEach( p => p.applyUniformsToNode( node ) );
					if ( node.onBeforeRender ) node.onBeforeRender( node );
					node.render( gl, view, projection );
				};

				if ( !node.maskOnly || queueMasks ) {
					if ( node.mask ) {
						const subtasks: RenderTask[] = [
							{
								layer,
								order: -Infinity,
								task: ( _gl ): void => {
									_gl.clear( _gl.STENCIL_BUFFER_BIT );
									_gl.stencilOp( _gl.KEEP, _gl.KEEP, _gl.REPLACE );
									_gl.stencilFunc( _gl.ALWAYS, 1, 0xff );
									_gl.stencilMask( 0xff );
									_gl.colorMask( false, false, false, false );
									_gl.depthMask( false );
									_gl.enable( _gl.STENCIL_TEST );
								},
							},
							{
								layer,
								order: Infinity,
								task: ( _gl, view, projection ): void => {
									_gl.stencilFunc( _gl.EQUAL, 1, 0xff );
									_gl.stencilMask( 0x00 );
									_gl.colorMask( true, true, true, true );
									_gl.depthMask( true );

									renderNode( view, projection );

									_gl.stencilMask( -1 );
									_gl.disable( _gl.STENCIL_TEST );
								},
							},
						];
						Scene.queueRenderables(
							gl, node.mask, subtasks, uniformProviders, true, layer,
						);
						subtasks.sort( ( a, b ) => a.order - b.order );

						renderQueue.push({
							subtasks,
							layer,
							order: node.renderOrder,
						});
					} else {
						renderQueue.push({
							layer,
							order: node.renderOrder,
							task: ( _, view, projection ) => {
								renderNode( view, projection );
							},
						});
					}

					processChildren( layer );
				}
			} else if ( !node.maskOnly || queueMasks ) {
				if ( node.onBeforeRender ) {
					renderQueue.push({
						order: 0,
						layer: parentLayer,
						task: () => node.onBeforeRender( node ),
					});
				}

				if ( 'isUniformProvider' in node ) {
					const childProviders = uniformProviders.slice( 0 );
					childProviders.push( node );

					processChildren( parentLayer, childProviders );
				} else {
					processChildren();
				}
			}
		}
	}


	static runRecursive(
		task: RenderTask,
		gl: WebGLRenderingContext,
		view: mat4,
		projection: mat4,
		layer: number | undefined,
	): void {
		// eslint-disable-next-line id-blacklist
		if ( layer === undefined || task.layer === layer ) {
			if ( task.task ) task.task( gl, view, projection );
			if ( task.subtasks ) {
				task.subtasks.forEach( t => Scene.runRecursive( t, gl, view, projection, layer ) );
			}
		}
	}


	public calculateTransforms(
		node: Renderable | TransformNode | GenericHitRegion| Traversable,
		parentWorldMatrix: mat4,
	): void {
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
				// eslint-disable-next-line no-param-reassign
				node.scene = this;
			}

			node.children.forEach( ( child ) => {
				this.calculateTransforms( child, worldMatrix );
			});
		}
	}


	public invalidateSceneGraph(): void {
		this.shouldRebuildSceneGraph = true;
	}


	public render(
		gl: WebGLRenderingContext,
	): void {
		this.calculateTransforms( this, this.worldMatrix );

		if ( !this.activeCamera ) {
			// eslint-disable-next-line no-console
			console.warn( 'Scene: No active camera provided.' );

			return;
		}

		this.activeCamera.updateMatrices();

		const {
			viewMatrix,
			projectionMatrix,
		} = this.activeCamera;
		const layer = this.activeLayer;

		if ( this.shouldRebuildSceneGraph ) {
			this.renderQueue = [];
			Scene.queueRenderables( gl, this, this.renderQueue, [], false, 0 );

			this.shouldRebuildSceneGraph = false;
		}

		this.renderQueue.sort( ( a, b ) => a.order - b.order );
		this.renderQueue.forEach(
			t => Scene.runRecursive( t, gl, viewMatrix, projectionMatrix, layer ),
		);
	}
}
