import Material from '../Material';
import { unprojectedVertexShader } from '../defaultShaders';


export default class ShaderPass extends Material {
	constructor( fragmentShader: string ) {
		super({
			fragmentShader,
			vertexShader: unprojectedVertexShader,
		});
	}
}
