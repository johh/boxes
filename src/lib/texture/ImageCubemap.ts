import GenericCubemap, { CubeOf, GenericCubemapProps } from './GenericCubemap';

export interface ImageCubemapProps extends GenericCubemapProps{
	src: CubeOf<string>;
}


export default class ImageCubemap extends GenericCubemap {
	private images: Partial<CubeOf<HTMLImageElement>> = {};

	constructor({ src, ...props }: ImageCubemapProps ) {
		super( props );

		Object.entries( src ).forEach( ([_key, value]) => {
			const key = _key as keyof CubeOf<string>;
			const img = new Image();
			this.images[key] = img;

			img.decoding = 'async';
			img.src = value;
			img.addEventListener( 'load', () => {
				this.queueUpdate({ [key]: this.images[key] });
			});
		});
	}
}
