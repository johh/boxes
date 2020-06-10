import GenericTexture, { GenericTextureProps } from './GenericTexture';


export interface ImageTextureProps extends GenericTextureProps {
	src: string;
}


export default class ImageTexture extends GenericTexture {
	private image: HTMLImageElement;

	constructor( props: ImageTextureProps ) {
		super( props );

		this.image = document.createElement( 'img' );
		this.image.src = props.src;
		this.image.addEventListener( 'load', () => {
			this.queueUpdate( this.image );
		});
	}
}
