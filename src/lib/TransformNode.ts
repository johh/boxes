import Transform from './Transform';
import Traversable from './Traversable';

export interface TransformNodeProps {
	visible?: boolean;
	maskOnly?: boolean;
}

export default class TransformNode extends Transform implements Traversable {
	public children: Traversable[] = [];
	public parent: Traversable;
	public visible: boolean;
	public maskOnly: boolean;
	public onBeforeRender: ( ref: TransformNode ) => void;
	public readonly isTransformNode = true;


	constructor( props: TransformNodeProps = {}) {
		super();

		const {
			visible = true,
			maskOnly = false,
		} = props;

		this.visible = visible;
		this.maskOnly = maskOnly;
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
