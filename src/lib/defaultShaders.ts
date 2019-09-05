/* export const vertexShader = `
	attribute vec3 a_vPosition;
	attribute vec2 a_vUv;
	varying vec2 v_vUv;

	uniform mat4 u_mModel;
	uniform mat4 u_mView;
	uniform mat4 u_mProjection;

	void main() {
		v_vUv = a_vUv;
		gl_Position = u_mProjection * u_mView * u_mModel * vec4(a_vPosition, 1);
	}
`.replace( /\t|\n/g, '' ); */

export const vertexShader = 'attribute vec3 a_vPosition;attribute vec2 a_vUv;varying vec2 v_vUv;uniform mat4 u_mModel;uniform mat4 u_mView;uniform mat4 u_mProjection;void main(){v_vUv=a_vUv;gl_Position=u_mProjection*u_mView*u_mModel*vec4(a_vPosition,1);}';

/* export const fragmentShader = `
	precision mediump float;
	varying vec2 v_vUv;

	void main() {
		gl_FragColor = vec4(v_vUv,1,1);
	}
`.replace( /\t|\n/g, '' );
 */

export const fragmentShader = 'precision mediump float;varying vec2 v_vUv;void main(){gl_FragColor=vec4(v_vUv,1,1);}';


/* export const unprojectedVertexShader = `
	attribute vec3 a_vPosition;
	attribute vec2 a_vUv;

	varying vec2 v_vUv;

	void main() {
		v_vUv = a_vUv;
		gl_Position = vec4(a_vPosition, 1);
	}
`.replace( /\t|\n/g, '' ); */

export const unprojectedVertexShader = 'attribute vec3 a_vPosition;attribute vec2 a_vUv;varying vec2 v_vUv;void main(){v_vUv=a_vUv;gl_Position=vec4(a_vPosition,1);}';
