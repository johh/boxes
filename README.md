# 🎁📦📬 boxes

boxes is a tiny WebGL library built with [`gl-matrix`](http://glmatrix.net/) and TypeScript. It only provides the most basic utilities and is very much **WORK IN PROGRESS** right now.

### Installation

```
yarn add @downpourdigital/boxes
```
```
npm i --save @downpourdigital/boxes
```

### Usage
```javascript
import {
	Renderer,
	Material,
	BufferGeometry,
	Renderable,
	ImageTexture,
	Scene,
	TransformNode,
	UniformProvider,
	OrthoCamera,
	PerspectiveCamera,
	PostFxPipeline,
	ShaderPass,
	Framebuffer,
	vec2, vec3, vec4,
	mat2, mat3,
	float, int,
	enums,
} from '@downpourdigital/boxes';

```
There'll be better documentation at some point, once the API is stable and some tests are implemented.

#### Renderer
```typescript
import { Renderer } from '@downpourdigital/boxes';

const renderer = new Renderer({
	canvas: document.querySelector( '#webgl canvas' ),
	width: 800,
	height: 600,
	clearColor: [0, 0, 0, 1],
	autoClear: true,
});

renderer.render( scene: Scene, camera: Camera, frameBuffer?: Framebuffer );
renderer.renderDirect( geometry: BufferGeometry, material: Material, frameBuffer?: Framebuffer );

renderer.clear();
renderer.clearColorBuffer();
renderer.clearDepthBuffer();
renderer.clearStencilBuffer();
```



#### Material
```typescript
import { Material, vec4, float, ImageTexture } from '@downpourdigital/boxes';

const material = new Material({
	vertexShader: '...',
	fragmentShader: '...',
	uniforms: {
		u_vYourUniform: vec4.fromValues( .5, 0, 1, 1 ),
		u_vYourTexture: new ImageTexture(...),
	}
});

// (re)initializes an uniform
material.setUniform( 'u_vAnotherUniform', vec4.create() );
material.setUniforms({
	u_vAnotherUniform: vec4.create(),
});

//updates an existing uniform
material.updateUniform( 'u_vYourUniform', ( value ) => vec4.set( value, 1, 2, 3, 4 ) );
material.updateUniforms({
	u_vYourUniform: ( value ) => vec4.set( value, 1, 2, 3, 4 ),
})

// floats and ints are specified by a TypedArray
material.setUniform( 'u_fFloat', float.fromValue( 0 ) );
// or
material.setUniform( 'u_fFloat', new Float32Array( 1 ) );
material.updateUniform( 'u_fFloat', v => float.set( v, 1 ) );

```


#### BufferGeometry
```typescript
import { BufferGeometry, enums } from '@downpourdigital/boxes';

const geometry = new BufferGeometry({
	verts: [
		-.5, .5, 0,
		-.5, -.5, 0,
		.5, -.5, 0,
		.5, .5, 0,
	],
	mode: enums.TRIANGLE_FAN,
	attributes: {
		a_vUv: [
			0, 0,
			0, 1,
			1, 1,
			1, 0,
		],
	},
	vertexName: 'a_vPosition', // attribute name for data contained in 'verts'
	indices: [], // indices for indexed geometries
	stride: 3, // number of components in each vertex
});

```


#### Renderable
```typescript
import { Renderable } from '@downpourdigital/boxes';

const obj1 = new Renderable({
	geometry: new BufferGeometry(...),
	material: new Material(...),
	depthTest: true,
	depthWrite: true,
	visible: true,
	maskOnly: false,
	mask: new Renderable(...),
});

```
Inherits the transform properties from `TransformNode` and provides the following uniforms:

* `mat4 u_mModel` – the model matrix
* `mat4 u_mView` – the view matrix (provided by the camera)
* `mat4 u_mProjection` – the projection matrix (provided by the camera)



#### TransformNode
```typescript
import { TransformNode, vec3 } from '@downpourdigital/boxes';

const group = new TransformNode({
	visible: true,
	maskOnly: false,
});
group.append( child ); // append renderable or another transform node
group.remove( child );

vec3.set( group.origin, 0, 0, 0 );
vec3.set( group.translation, 0, 0, 0 );
vec3.set( group.scale, 1, 1, 1 );
vec3.set( group.rotation, 0, 0, 0 );
```


#### UniformProvider
```typescript
import { UniformProvider, float } from '@downpourdigital/boxes';

const provider = new UniformProvider({
	uniforms: {
		u_fTest: float.fromValue( .5 ),
	},
});

provider.append( child ); // append renderable or another transform node
parent.append( provider );
```
`UniformProvider` acts like a node in the scene graph. It injects the given uniforms into all descendants. Setting/updating the uniforms works identically to `Material`.


#### Scene
```typescript
import { Scene } from '@downpourdigital/boxes';

const scene = new Scene();
scene.append( child ); // append renderable or another transform node
scene.remove( child );
```


#### OrthoCamera

```typescript
import { OrthoCamera } from '@downpourdigital/boxes';

const camera = new OrthoCamera({
	top: 1,
	left: -1,
	right: 1,
	bottom: -1,
	near: -100,
	far: 100,
});
camera.updateProjectionMatrix();
```


#### PerspectiveCamera

```typescript
import { PerspectiveCamera } from '@downpourdigital/boxes';

const camera = new PerspectiveCamera({
	fov: 90,
	aspect: 1,
	near: .1,
	far: 1000,
});
camera.updateProjectionMatrix();
```


#### ImageTexture
```typescript
import { ImageTexture, enums } from '@downpourdigital/boxes';

const texture = new ImageTexture({
	src: 'path/to/your/image.jpg',
	format: enums.RGBA,
	type: enums.UNSIGNED_BYTE,
	mipmaps: false,
});
```


#### PostFxPipeline, Shaderpass, Framebuffer
boxes provides a simple post processing pipeline.
You provide a chain of steps (Shaders, Scenes and Framebuffers)

```typescript
import {
	PostFxPipeline,
	ShaderPass,
	Framebuffer,
} from '@downpourdigital/boxes';

const postFx = new PostFxPipeline({
	renderer,
	width: 800,
	height: 600,
	depth: false,
	stencil: false,
});

const shaderPassA = new ShaderPass('frag shader here');
const shaderPassB = new ShaderPass('frag shader here');

const fboA = new Framebuffer({
	renderer,
	width: 400,
	height: 300,
	depth: false,
	stencil: false,
});


postFx.render([
	{ scene, camera },		//	first render a scene
	shaderPassA,			//	apply a shaderpass
	fboA,				//	render to fboA
]);

postFx.render([
	fboA,				//	use fboA as input
	shaderPassB,			//	apply a shaderpass
	shaderPassA,			//	apply another shaderpass
]);					//	since no fbo is provided as a last step,
					//	it will render to screen.
```
The following uniforms are provided by the ShaderPass:

* `sampler2D u_tDiffuse0` – output of previous pass
* `float u_fTime` – current time in ms

additionally, the following varyings are supplied:

* `vec2 v_vUv` – the texture coordinates


### License
© 2019 [DOWNPOUR DIGITAL](https://downpour.digital), licensed under BSD-4-Clause