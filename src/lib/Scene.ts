import Traversable from './Traversable';
import TransformNode from './TransformNode';
import { mat4 } from 'gl-matrix';
import Renderable from './Renderable';

export default class Scene implements Traversable {
	public children: Traversable[] = [];

	append( child: Traversable ) {
		if ( !this.children.includes( child ) ) {
			this.children.push( child );
			child.parent = this;
		}
	}

	remove( child: Traversable ) {
		if ( this.children.includes( child ) ) {
			this.children.splice( this.children.findIndex( c => c === child ), 1 );
			child.parent = null;
		}
	}


	static processNode(
		gl: WebGLRenderingContext,
		node: Renderable | TransformNode | Traversable,
		parentWorldMatrix: mat4,
		viewMatrix: mat4,
		projectiondMatrix: mat4,
	) {
		let worldMatrix: mat4;

		if ( 'isTransformNode' in node ) {
			node.updateMatrices( parentWorldMatrix );
			worldMatrix = node.worldMatrix;
		} else {
			worldMatrix = parentWorldMatrix;
		}

		if ( 'isRenderable' in node ) {
			node.render( gl, viewMatrix, projectiondMatrix );
		}

		node.children.forEach( ( child ) => {
			Scene.processNode( gl, child, worldMatrix, viewMatrix, projectiondMatrix );
		});
	}


	render(
		gl: WebGLRenderingContext,
		viewMatrix: mat4,
		projectiondMatrix: mat4,
	) {
		Scene.processNode( gl, this, mat4.create(), viewMatrix, projectiondMatrix );
	}
}
