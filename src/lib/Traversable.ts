export default interface Traversable {
	children: Traversable[];
	visible: boolean;
	parent?: Traversable;
	append: ( child: Traversable ) => void;
	remove: ( child: Traversable ) => void;
}
