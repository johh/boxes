import typescript from 'rollup-plugin-typescript2';

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
		typescript(),
	],
};
