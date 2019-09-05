import BufferGeometry from './BufferGeometry';
import Renderer from './Renderer';
import Framebuffer from './Framebuffer';
import Material from './Material';
import Scene from './Scene';
import { Camera } from './GenericCamera';


interface PostFxPipelineProps {
	renderer: Renderer;
	width?: number;
	height?: number;
}


type PostFxPipelineStep = Material | Framebuffer | { scene: Scene, camera: Camera };


export default class PostFxPipeline {
	private readonly tri = new BufferGeometry({
		verts: [
			-1, 1, 0,
			3, 1, 0,
			-1, -3, 0,
		],
		attributes: [
			[
				0, 0,
				2, 0,
				0, 2,
			],
		],
	});
	private renderer: Renderer;
	private fboA: Framebuffer;
	private fboB: Framebuffer;


	constructor( props: PostFxPipelineProps ) {
		const {
			renderer,
			width = renderer.width,
			height = renderer.height,
		} = props;

		this.renderer = renderer;

		this.fboA = new Framebuffer({
			renderer,
			width,
			height,
			depth: false,
		});

		this.fboB = new Framebuffer({
			renderer,
			width,
			height,
			depth: false,
		});
	}


	private swapBuffers() {
		this.fboA.clear();

		const temp = this.fboA;
		this.fboA = this.fboB;
		this.fboB = temp;
	}


	public render( list: PostFxPipelineStep[]) {
		list.forEach( ( step, i ) => {
			const readBuffer = ( list[i - 1] && 'isFramebuffer' in list[i - 1])
				? <Framebuffer>list[i - 1]
				: this.fboA;

			const writeBuffer = ( list[i + 1])
				? ( 'isFramebuffer' in list[i + 1]) ? <Framebuffer>list[i + 1] : this.fboB
				: undefined;

			if ( 'isMaterial' in step ) {
				this.renderer.gl.activeTexture( this.renderer.gl.TEXTURE1 );
				this.renderer.gl.bindTexture( this.renderer.gl.TEXTURE_2D, readBuffer.texture );
				step.setUniform( 'u_tDiffuse0', { type: 'int', value: 1 });
				step.setUniform( 'u_fTime', performance.now() );

				this.renderer.renderDirect( this.tri, step, writeBuffer );

				this.swapBuffers();
			} else if ( 'scene' in step ) {
				this.renderer.render( step.scene, step.camera, writeBuffer );
				this.swapBuffers();
			}
		});
	}
}
