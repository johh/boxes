import typescript from 'rollup-plugin-typescript2';
import propertiesRenameTransformer from 'ts-transformer-properties-rename';
import { terser } from 'rollup-plugin-terser';


export default {
	input: './src/boxes.ts',

	output: [
		{
			file: 'dist/esm/boxes.js',
			format: 'esm',
		},
		{
			file: 'dist/cjs/boxes.js',
			format: 'cjs',
		},
	],

	plugins: [
		terser({
			format: {
				comments: false,
			},
			mangle: {
				properties: {
					regex: /^_private_/,
				},
			},
		}),
		typescript({
			tsconfigOverride: {
				compilerOptions: {
					module: 'esnext',
				},
			},
			transformers: [( service ) => ({
				before: [
					propertiesRenameTransformer(
						service.getProgram(),
						{
							privatePrefix: '_private_',
							internalPrefix: '',
							entrySourceFiles: ['./src/boxes.ts'],
						},
					),
				],
				after: [],
			})],
		}),
	],
};
