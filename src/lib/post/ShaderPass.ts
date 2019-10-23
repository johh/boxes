import Material from '../Material';
import { unprojectedVertexShader } from '../defaultShaders';
import * as float from '../math/float';


export default class ShaderPass extends Material {
	constructor( fragmentShader: string ) {
		super({
			fragmentShader,
			vertexShader: unprojectedVertexShader,
			uniforms: {
				u_fTime: float.create(),
			},
		});
	}
}
