import { vec2, vec3, vec4, mat4, mat3, mat2 } from 'gl-matrix';

import { UniformValue, InternalUniformValue } from './UniformValue';
import {
	vertexShader as defaultVertShader,
	fragmentShader as defaultFragShader,
} from './defaultShaders';
import { Texture } from './texture/GenericTexture';


interface MaterialProps {
	vertexShader?: string;
	fragmentShader?: string;
	uniforms?: UniformList;
}


export interface UniformList {
	[key: string]: UniformValue;
}


type UniformUpdateFunction =
	( previousValue: InternalUniformValue ) => InternalUniformValue | void;


interface UniformUpdateList {
	[key: string]: UniformUpdateFunction;
}


type UniformSetterFunction = ( value: InternalUniformValue ) => void;

interface UniformReference {
	location: WebGLUniformLocation;
	type: number;
	setterFunction: UniformSetterFunction;
	value: Float32Array | Int32Array | null;
}


const programCache = new Map<string, WebGLProgram>();


const createShader = ( gl: WebGLRenderingContext, src: string, frag: Boolean ) => {
	const shader = gl.createShader( frag ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER );
	gl.shaderSource( shader, src );
	gl.compileShader( shader );

	if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
		console.error( '[WEBGL] Shader compilation failed:', gl.getShaderInfoLog( shader ) );
	}

	return shader;
};


const getSetterFunction = (
	gl: WebGLRenderingContext,
	location: WebGLUniformLocation,
	type: number,
) => {
	switch ( type ) {
	case gl.FLOAT:
		return ( value: Float32Array ) => gl.uniform1fv( location, value );

	case gl.FLOAT_VEC2:
		return ( value: vec2 | Float32Array ) => gl.uniform2fv( location, value );

	case gl.FLOAT_VEC3:
		return ( value: vec3 | Float32Array ) => gl.uniform3fv( location, value );

	case gl.FLOAT_VEC4:
		return ( value: vec4 | Float32Array ) => gl.uniform4fv( location, value );

	case gl.INT:
	case gl.SAMPLER_2D:
	case gl.SAMPLER_CUBE:
		return ( value: Int32Array ) => gl.uniform1iv( location, value );

	case gl.INT_VEC2:
		return ( value: Int32Array ) => gl.uniform2iv( location, value );

	case gl.INT_VEC3:
		return ( value: Int32Array ) => gl.uniform3iv( location, value );

	case gl.INT_VEC4:
		return ( value: Int32Array ) => gl.uniform4iv( location, value );

	case gl.FLOAT_MAT2:
		return ( value: mat2 | Float32Array ) => gl.uniformMatrix2fv( location, false, value );

	case gl.FLOAT_MAT3:
		return ( value: mat3 | Float32Array ) => gl.uniformMatrix3fv( location, false, value );

	case gl.FLOAT_MAT4:
		return ( value: mat4 | Float32Array ) => gl.uniformMatrix4fv( location, false, value );
	}
};


export default class Material {
	private vertexSrc: string;
	private fragmentSrc: string;
	private gl: WebGLRenderingContext;
	private program: WebGLProgram;
	private uniforms = new Map<string, UniformReference>();
	private attributeLocations = new Map<string, number>();
	private queuedUniforms: UniformList = {};
	private textures: Texture[] = [];
	public readonly isMaterial = true;


	constructor( props: MaterialProps = {}) {
		const {
			vertexShader = defaultVertShader,
			fragmentShader = defaultFragShader,
			uniforms,
		} = props;

		this.vertexSrc = vertexShader;
		this.fragmentSrc = fragmentShader;

		if ( uniforms ) Object.assign( this.queuedUniforms, uniforms );
	}


	private compile() {
		if ( this.program ) return this.program;

		const cacheKey = this.vertexSrc + this.fragmentSrc;

		if ( programCache.has( cacheKey ) ) {
			this.program = programCache.get( cacheKey );
		} else {
			const gl = this.gl;

			const vertexShader = createShader( gl, this.vertexSrc, false );
			const fragmentShader = createShader( gl, this.fragmentSrc, true );

			this.program = gl.createProgram();

			gl.attachShader( this.program, vertexShader );
			gl.attachShader( this.program, fragmentShader );

			gl.linkProgram( this.program );

			if ( !gl.getProgramParameter( this.program, gl.LINK_STATUS ) ) {
				console.error( '[WEBGL] Program linking failed:', gl.getProgramInfoLog( this.program ) );
			}

			gl.deleteShader( vertexShader );
			gl.deleteShader( fragmentShader );

			programCache.set( cacheKey, this.program );
		}

		this.createUniformReferences();
		if ( this.queuedUniforms ) this.setUniforms( this.queuedUniforms );

		return this.program;
	}


	public getAttributeLocation( name: string ) {
		const gl = this.gl;

		if ( this.attributeLocations.has( name ) ) return this.attributeLocations.get( name );

		const loc = gl.getAttribLocation( this.program, name );
		this.attributeLocations.set( name, loc );

		return loc;
	}


	private createUniformReferences() {
		const gl = this.gl;

		this.textures = [];

		const num = gl.getProgramParameter( this.program, gl.ACTIVE_UNIFORMS );
		for ( let i = 0; i < num; i += 1 ) {
			const uniform = gl.getActiveUniform( this.program, i );
			const location = gl.getUniformLocation( this.program, uniform.name );
			const name = uniform.name.match( /(\w+)/g )[0];

			let value = null;

			if ( uniform.type === gl.SAMPLER_2D || uniform.type === gl.SAMPLER_CUBE ) {
				value = new Int32Array( 1 );
				value[0] = this.textures.push( null ) - 1;
			}

			this.uniforms.set( name, {
				location,
				value,
				type: uniform.type,
				setterFunction: getSetterFunction( gl, location, uniform.type ),
			});
		}
	}


	private commitUniforms() {
		this.uniforms.forEach( ( ref, key ) => {
			if ( ref.value ) ref.setterFunction( ref.value );
		});
	}


	private bindTextures() {
		const gl = this.gl;

		this.textures.forEach( ( texture, i ) => {
			gl.activeTexture( gl.TEXTURE0 + i );

			if ( texture !== null ) {
				const textureLoc = texture.prepare( gl );
				gl.bindTexture( gl.TEXTURE_2D, textureLoc );
			}
		});
	}


	public use( gl: WebGLRenderingContext ) {
		this.gl = gl;

		gl.useProgram( this.compile() );
		this.commitUniforms();
		this.bindTextures();
	}


	public setUniform( key: string, value: UniformValue ) {
		if ( !this.gl ) {
			this.queuedUniforms[key] = value;
			return;
		}

		if ( this.uniforms.has( key ) ) {
			const ref = this.uniforms.get( key );

			switch ( ref.type ) {
			case WebGLRenderingContext.SAMPLER_2D:
			case WebGLRenderingContext.SAMPLER_CUBE:
				if ( typeof value === 'object' && 'isTexture' in ( value as any ) ) {
					this.textures[ref.value[0]] = value as Texture;
				} else {
					ref.value = value as Int32Array;
				}

				break;

			default:
				ref.value = value as Float32Array | Int32Array;

				break;
			}
		} else {
			/* console.warn( `[WebGL] Uniform ${key} is not being used.` ); */
		}
	}


	public setUniforms( list: UniformList ) {
		Object.keys( list ).forEach( ( key ) => {
			this.setUniform( key, list[key]);
		});
	}


	public updateUniform( key: string, func: UniformUpdateFunction ) {
		if ( this.uniforms.has( key ) ) {
			const ref = this.uniforms.get( key );

			if ( ref.value !== null ) {
				ref.value = func( ref.value ) || ref.value;
			} else {
				console.warn( `cannot update uninitialized uniform ${key} – call setUniform first.` );
			}
		}
	}


	public updateUniforms( list: UniformUpdateList ) {
		Object.keys( list ).forEach( ( key ) => {
			this.updateUniform( key, list[key]);
		});
	}


	public getUniform( key: string ) {
		if ( this.uniforms.has( key ) ) return this.uniforms.get( key ).value;
		return undefined;
	}


	public delete() {
		if ( this.program ) this.gl.deleteProgram( this.program );
		this.program = undefined;
	}
}
