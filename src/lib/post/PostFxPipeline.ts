import BufferGeometry from '../BufferGeometry';
import Renderer from '../Renderer';
import Framebuffer from './Framebuffer';
import Material from '../Material';
import Scene from '../Scene';


interface PostFxPipelineProps {
	renderer: Renderer;
	width?: number;
	height?: number;
	depth?: boolean;
	stencil?: boolean;
	skipFboGeneration?: boolean;
}

type StepFunction = (
	src: Framebuffer,
	dest: Framebuffer,
) => void;

type PostFxPipelineStep =
	Material |
	Framebuffer |
	Framebuffer[] |
	Scene |
	StepFunction;


const getFramebufferFromPipelineStep = (
	step: PostFxPipelineStep,
	multiple = false,
): Framebuffer | Framebuffer[] => {
	if ( 'isFramebuffer' in step ) {
		return multiple ? [step] : step;
	}

	if (
		Array.isArray( step )
		&& step.length > 0
	) {
		if ( multiple ) {
			return step;
		}

		if ( 'isFramebuffer' in step[0]) {
			return step[0];
		}
	}

	return null;
};


export default class PostFxPipeline {
	private readonly tri = new BufferGeometry({
		verts: [
			-1, -1, 0,
			3, -1, 0,
			-1, 3, 0,
		],
		attributes: {
			a_vUv: [
				0, 0,
				2, 0,
				0, 2,
			],
		},
	});

	private renderer: Renderer;
	private fboA: Framebuffer;
	private fboB: Framebuffer;


	constructor( props: PostFxPipelineProps ) {
		const {
			renderer,
			width = renderer.width,
			height = renderer.height,
			depth = false,
			stencil = false,
			skipFboGeneration = false,
		} = props;

		this.renderer = renderer;

		if ( !skipFboGeneration ) {
			const opts = {
				renderer,
				width,
				height,
				depth,
				stencil,
			};

			this.fboA = new Framebuffer( opts );
			this.fboB = new Framebuffer( opts );
		}
	}


	public swapBuffers(): void {
		this.fboA.clear();

		const temp = this.fboA;
		this.fboA = this.fboB;
		this.fboB = temp;
	}


	public render( list: PostFxPipelineStep[]): void {
		// reset blend mode before rendering
		this.renderer.gl.blendFunc(
			this.renderer.gl.SRC_ALPHA,
			this.renderer.gl.ONE_MINUS_SRC_ALPHA,
		);

		list.forEach( ( step, i ) => {
			let readBuffers: Framebuffer[] = [this.fboA];

			if ( list[i - 1]) {
				const candidate = getFramebufferFromPipelineStep( list[i - 1], true );
				if ( candidate ) {
					readBuffers = candidate as Framebuffer[];
				}
			}

			let writeBuffer: Framebuffer = null;

			if ( list[i + 1]) {
				const candidate = getFramebufferFromPipelineStep( list[i + 1]);
				writeBuffer = candidate as Framebuffer || this.fboB;
			}

			if ( 'isMaterial' in step ) {
				readBuffers.forEach( ( buffer, j ) => {
					step.setUniform( `u_tDiffuse${j}`, buffer );
				});

				// eslint-disable-next-line no-param-reassign
				step.updateUniform( 'u_fTime', ( v ) => { v[0] = performance.now(); });

				this.renderer.renderDirect( this.tri, step, writeBuffer );

				this.swapBuffers();
			} else if ( 'isScene' in step ) {
				this.renderer.render( step, writeBuffer );
				this.swapBuffers();
			} else if ( typeof step === 'function' ) {
				step( readBuffers[0], writeBuffer );
			}
		});
	}


	public setSize( width: number, height: number ): void {
		this.fboA.setSize( width, height );
		this.fboB.setSize( width, height );
	}


	public delete(): void {
		this.fboA.delete();
		this.fboB.delete();
	}
}
