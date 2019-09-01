import { UniformValue } from './UniformValue';
import { vec2, vec3, vec4, mat4, mat3, mat2 } from 'gl-matrix';

interface MaterialProps {
	vertexShader: string;
	fragmentShader: string;
}

interface UniformList {
	[key: string]: UniformValue;
}

interface UniformUpdateList {
	[key: string]: UpdateFunction;
}

interface UniformReference {
	location: WebGLUniformLocation;
	updateFunction: Function;
	lastValue: UniformValue;
}

interface UniformReferenceList {
	[key: string]: UniformReference;
}

type UpdateFunction = ( previousValue: UniformValue ) => UniformValue;


const createShader = ( gl: WebGLRenderingContext, src: string, frag: Boolean ) => {
	const shader = gl.createShader( frag ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER );
	gl.shaderSource( shader, src );
	gl.compileShader( shader );

	if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
		console.error( '[WEBGL] Shader compilation failed:', gl.getShaderInfoLog( shader ) );
	}

	return shader;
};


export default class Material {
	private vertexSrc: string;
	private fragmentSrc: string;
	private program: WebGLProgram;
	private uniforms: UniformReferenceList = {};
	private uniformQueue: UniformList = {};


	constructor( props: MaterialProps ) {
		this.vertexSrc = props.vertexShader;
		this.fragmentSrc = props.fragmentShader;
	}


	private compile( gl: WebGLRenderingContext ) {
		if ( this.program ) return this.program;

		const vertexShader = createShader( gl, this.vertexSrc, false );
		const fragmentShader = createShader( gl, this.fragmentSrc, true );

		this.program = gl.createProgram();

		gl.attachShader( this.program, vertexShader );
		gl.attachShader( this.program, fragmentShader );

		gl.linkProgram( this.program );

		if ( !gl.getProgramParameter( this.program, gl.LINK_STATUS ) ) {
			console.error( '[WEBGL] Program linking failed:', gl.getProgramInfoLog( this.program ) );
		}

		return this.program;
	}


	private commitUniforms( gl: WebGLRenderingContext ) {
		Object.keys( this.uniformQueue ).forEach( ( key ) => {
			const value = this.uniformQueue[key];

			delete this.uniformQueue[key];

			if ( !this.uniforms[key]) {
				const location = gl.getUniformLocation( this.program, key );
				let updateFunction;

				if ( typeof value === 'number' ) {
					updateFunction = gl.uniform1f;
				} else if ( typeof value === 'object' && !( 'type' in value ) ) {
					switch ( value.length ) {
					case 2:
						updateFunction = ( value: vec2 ) => {
							gl.uniform2fv( location, value );
						};
						break;

					case 3:
						updateFunction = ( value: vec3 ) => {
							gl.uniform3fv( location, value );
						};
						break;

					case 4:
						updateFunction = ( value: vec4 ) => {
							gl.uniform4fv( location, value );
						};
						break;

					case 16:
						updateFunction = ( value: mat4 ) => {
							gl.uniformMatrix4fv( location, false, value );
						};
						break;

					case 9:
						updateFunction = ( value: mat3 ) => {
							gl.uniformMatrix3fv( location, false, value );
						};
						break;
					}
				}

				const reference: UniformReference = {
					location,
					updateFunction,
					lastValue: value,
				};

				this.uniforms[key] = reference;
			}

			this.uniforms[key].updateFunction( value );
			this.uniforms[key].lastValue = value;
		});
	}


	use( gl: WebGLRenderingContext ) {
		const program = this.compile( gl );
		gl.useProgram( program );
		this.commitUniforms( gl );
	}


	setUniform( key: string, value: UniformValue, force: boolean = false ) {
		this.uniformQueue[key] = value;
	}


	setUniforms( list: UniformList ) {
		Object.keys( list ).forEach( ( key ) => {
			this.uniformQueue[key] = list[key];
		});
	}


	updateUniform( key: string, updateFunction: UpdateFunction ) {
		if ( this.uniforms[key]) {
			this.uniformQueue[key] = updateFunction( this.uniforms[key].lastValue );
		} else if ( this.uniformQueue[key]) {
			this.uniformQueue[key] = updateFunction( this.uniformQueue[key]);
		}
	}


	updateUniforms( list: UniformUpdateList ) {
		Object.keys( list ).forEach( ( key ) => {
			this.updateUniform( key, list[key]);
		});
	}
}
