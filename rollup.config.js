import typescript from 'rollup-plugin-typescript2';

export default {
	input: './src/boxes.ts',

	output: {
		file: 'dist/boxes.js',
		format: 'esm'
	},

	plugins: [
		typescript(),
	],
}
