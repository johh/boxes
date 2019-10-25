export interface TraversableProps {
	visible?: boolean;
	maskOnly?: boolean;
	onBeforeRender?: ( ref: Traversable ) => void;
}


export default class Traversable {
	public readonly isTraversable = true;
	public children: Traversable[] = [];
	public parent: Traversable;
	public visible: boolean;
	public maskOnly: boolean;
	public onBeforeRender: ( ref: Traversable ) => void;


	constructor( props: TraversableProps = {}) {
		const {
			visible = true,
			maskOnly = false,
			onBeforeRender = null,
		} = props;

		this.visible = visible;
		this.maskOnly = maskOnly;
		this.onBeforeRender = onBeforeRender;
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
