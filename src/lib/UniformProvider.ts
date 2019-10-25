import Traversable, { TraversableProps } from './Traversable';
import Renderable from './Renderable';
import { UniformList } from './Material';
import { UniformValue } from './UniformValue';


type UniformProivderUpdateFunction =
	( previousValue: UniformValue ) => UniformValue | void;

interface UniformProivderUpdateList {
	[key: string]: UniformProivderUpdateFunction;
}


interface UniformProivderProps extends TraversableProps {
	uniforms: UniformList;
}


export default class UniformProivder extends Traversable {
	public readonly isUniformProvider = true;
	public uniforms: UniformList;


	constructor( props: UniformProivderProps ) {
		super( props );

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


	public updateUniform( key: string, func: UniformProivderUpdateFunction ) {
		this.uniforms[key] = func( this.uniforms[key]) || this.uniforms[key];
	}


	public updateUniforms( list: UniformProivderUpdateList ) {
		Object.keys( list ).forEach( ( key ) => {
			this.updateUniform( key, list[key]);
		});
	}


	public applyUniformsToNode( node: Renderable ) {
		if ( 'isRenderable' in node ) {
			node.material.setUniforms( this.uniforms );
		}
	}
}
