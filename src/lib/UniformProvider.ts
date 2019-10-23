import Traversable from './Traversable';
import { UniformList } from './Material';
import Renderable from './Renderable';
import { UniformValue } from './UniformValue';

interface UniformProivderProps {
	uniforms: UniformList;
}

export default class UniformProivder implements Traversable {
	public readonly isUniformProvider = true;
	public children: Traversable[] = [];
	public parent: Traversable;
	public visible: boolean = true;
	public uniforms: UniformList;


	constructor( props: UniformProivderProps ) {
		const {
			uniforms,
		} = props;

		this.uniforms = uniforms;
	}


	public setUniform( key: string, value: UniformValue ) {
		this.uniforms[key] = value;
	}


	public setUniforms( list: UniformList ) {
		Object.keys( list ).forEach( ( key ) => {
			this.setUniform( key, list[key]);
		});
	}


	public applyUniformsToNode( node: Renderable ) {
		if ( 'isRenderable' in node ) {
			node.material.setUniforms( this.uniforms );
		}
	}


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
}
