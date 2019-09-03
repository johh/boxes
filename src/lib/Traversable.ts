export default interface Traversable {
	children: Traversable[];
	parent?: Traversable;
	append: ( child: Traversable ) => void;
	remove: ( child: Traversable ) => void;
}
