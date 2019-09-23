export default interface Traversable {
	children: Traversable[];
	visible: boolean;
	parent?: Traversable;
	onBeforeRender?: ( ref: Traversable ) => void;
	append: ( child: Traversable ) => void;
	remove: ( child: Traversable ) => void;
}
