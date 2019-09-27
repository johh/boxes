import { mat4 } from 'gl-matrix';

import Traversable from './Traversable';
import TransformNode from './TransformNode';
import Renderable from './Renderable';


type RenderFunction = ( gl: WebGLRenderingContext ) => void;
type RenderStep = Renderable | RenderFunction;


export default class Scene implements Traversable {
	public children: Traversable[] = [];
	public visible: boolean = true;


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
		node: Renderable | TransformNode | Traversable,
		renderQueue: RenderStep[],
		queueMasks: boolean = false,
	) {
		const processChildren = () => {
			node.children.forEach( ( child ) => {
				Scene.queueRenderables( gl, child, renderQueue, queueMasks );
			});
		};

		if ( node.visible ) {
			if (
				'isRenderable' in node
			) {
				if ( !node.maskOnly || queueMasks ) {
					if ( node.mask ) {
						renderQueue.push( ( gl ) => {
							gl.clear( gl.STENCIL_BUFFER_BIT );
							gl.stencilOp( gl.KEEP, gl.KEEP, gl.REPLACE );
							gl.stencilFunc( gl.ALWAYS, 1, 0xff );
							gl.stencilMask( 0xff );
							gl.colorMask( false, false, false, false );
							gl.depthMask( false );
							gl.enable( gl.STENCIL_TEST );
						});
						Scene.queueRenderables( gl, node.mask, renderQueue, true );
						renderQueue.push( ( gl ) => {
							gl.stencilFunc( gl.EQUAL, 1, 0xff );
							gl.stencilMask( 0x00 );
							gl.colorMask( true, true, true, true );
							gl.depthMask( true );

						});
						renderQueue.push( node );
						renderQueue.push( ( gl ) => {
							gl.stencilMask( -1 );
							gl.disable( gl.STENCIL_TEST );
						});
					} else {
						renderQueue.push( node );
					}

					processChildren();
				}
			}  else if (
				'isTransformNode' in node
			)  {
				if ( !node.maskOnly || queueMasks ) {
					processChildren();
				}
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
			// dirty hack: cast node into Renderable to satisfy TS
			if ( node.onBeforeRender ) node.onBeforeRender( <Renderable>node );

			let worldMatrix: mat4;

			if ( 'isTransformNode' in node ) {
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


	render(
		gl: WebGLRenderingContext,
		viewMatrix: mat4,
		projectionMatrix: mat4,
	) {
		const renderQueue: RenderStep[] = [];
		Scene.calculateTransforms( this, mat4.create() );
		Scene.queueRenderables( gl, this, renderQueue );

		renderQueue.forEach( ( step ) => {
			if ( typeof step === 'function' ) {
				step( gl );
			} else {
				step.render( gl, viewMatrix, projectionMatrix );
			}
		});
	}
}
