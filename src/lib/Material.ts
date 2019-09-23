import { vec2, vec3, vec4, mat4, mat3, mat2 } from 'gl-matrix';

import { UniformValue } from './UniformValue';
import {
	vertexShader as defaultVertShader,
	fragmentShader as defaultFragShader,
} from './defaultShaders';
import GenericTexture, { Texture } from './texture/GenericTexture';


interface MaterialProps {
	vertexShader?: string;
	fragmentShader?: string;
	attributeNames?: string[];
	uniforms?: UniformList;
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
	value: UniformValue;
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
	private attributeNames: string[];
	private gl: WebGLRenderingContext;
	private program: WebGLProgram;
	private uniforms: UniformReferenceList = {};
	private uniformQueue: UniformList = {};
	private textures: Texture[] = [];
	public readonly isMaterial = true;


	constructor( props: MaterialProps = {}) {
		const {
			vertexShader = defaultVertShader,
			fragmentShader = defaultFragShader,
			attributeNames = ['a_vPosition', 'a_vUv'],
			uniforms,
		} = props;

		this.vertexSrc = vertexShader;
		this.fragmentSrc = fragmentShader;
		this.attributeNames = attributeNames;

		if ( uniforms ) this.setUniforms( uniforms );
	}


	private compile() {
		if ( this.program ) return this.program;

		const gl = this.gl;

		const vertexShader = createShader( gl, this.vertexSrc, false );
		const fragmentShader = createShader( gl, this.fragmentSrc, true );

		this.program = gl.createProgram();

		gl.attachShader( this.program, vertexShader );
		gl.attachShader( this.program, fragmentShader );

		this.attributeNames.forEach( ( name, i ) => {
			gl.bindAttribLocation( this.program, i, name );
		});

		gl.linkProgram( this.program );

		if ( !gl.getProgramParameter( this.program, gl.LINK_STATUS ) ) {
			console.error( '[WEBGL] Program linking failed:', gl.getProgramInfoLog( this.program ) );
		}

		return this.program;
	}


	private ingestUniforms() {
		const gl = this.gl;

		Object.keys( this.uniformQueue ).forEach( ( key ) => {
			const value = this.uniformQueue[key];

			delete this.uniformQueue[key];

			if ( !this.uniforms[key]) {
				const location = gl.getUniformLocation( this.program, key );
				let updateFunction;

				if ( typeof value === 'number' ) {
					updateFunction = ( value: number ) => {
						gl.uniform1f( location, value );
					};
				} else if ( typeof value === 'object' && ( 'isTexture' in value ) ) {
					let i: number = this.textures.indexOf( value );

					if ( i === -1 ) {
						this.textures.push( value );
						i = this.textures.length - 1;
					}

					updateFunction = ( value: Texture ) => {
						this.textures[i] = value;
						gl.uniform1i( location, i );
					};

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
				} else if ( typeof value === 'object' && ( 'type' in value ) ) {
					switch ( value.type ) {
					case 'int':
						updateFunction = ( value: { value: number}) => {
							gl.uniform1i( location, value.value );
						};
					}
				}

				const reference: UniformReference = {
					location,
					updateFunction,
					value,
				};

				this.uniforms[key] = reference;
			}

			this.uniforms[key].value = value;
		});
	}


	private prepare() {
		Object.keys( this.uniforms ).forEach( ( key ) => {
			this.uniforms[key].updateFunction( this.uniforms[key].value );
		});
	}


	private bindTextures() {
		const gl = this.gl;

		this.textures.forEach( ( texture, i ) => {
			const textureLoc = texture.prepare( gl );

			gl.activeTexture( gl.TEXTURE0 + i );
			gl.bindTexture( gl.TEXTURE_2D, textureLoc );
		});
	}


	public use( gl: WebGLRenderingContext ) {
		this.gl = gl;

		gl.useProgram( this.compile() );
		this.ingestUniforms();
		this.prepare();
		this.bindTextures();
	}


	public setUniform( key: string, value: UniformValue, force: boolean = false ) {
		this.uniformQueue[key] = value;
	}


	public setUniforms( list: UniformList ) {
		Object.keys( list ).forEach( ( key ) => {
			this.uniformQueue[key] = list[key];
		});
	}


	public updateUniform( key: string, updateFunction: UpdateFunction ) {
		if ( this.uniforms[key]) {
			this.uniformQueue[key] = updateFunction( this.uniforms[key].value );
		} else if ( this.uniformQueue[key]) {
			this.uniformQueue[key] = updateFunction( this.uniformQueue[key]);
		}
	}


	public updateUniforms( list: UniformUpdateList ) {
		Object.keys( list ).forEach( ( key ) => {
			this.updateUniform( key, list[key]);
		});
	}


	public delete() {
		if ( this.program ) this.gl.deleteProgram( this.program );
		this.program = undefined;
	}
}
