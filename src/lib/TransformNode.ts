import Transform from './Transform';
import Traversable from './Traversable';

export interface TransformNodeProps {
	visible?: boolean;
}

export default class TransformNode extends Transform implements Traversable {
	public children: Traversable[] = [];
	public parent: Traversable;
	public visible: boolean;
	public readonly isTransformNode = true;

	constructor( props: TransformNodeProps = {}) {
		super();

		const {
			visible = true,
		} = props;

		this.visible = visible;
	}

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
}
