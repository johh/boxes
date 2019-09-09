# 🎁📦📬 boxes

Boxes is a tiny WebGL library built with `gl-matrix` and TypeScript. It only provides the most basic utilities and is very much **WORK IN PROGRESS** right now.

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
	OrthoCamera,
	PerspectiveCamera,
	PostFxPipeline,
	ShaderPass,
	Framebuffer,
	vec2, vec3, vec4,
	mat2, mat3,
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
});

renderer.render( scene: Scene, camera: Camera, frameBuffer?: Framebuffer );
```



#### Material
```typescript
import { Material, vec4, ImageTexture } from '@downpourdigital/boxes';

const material = new Material({
	vertexShader: '...',
	fragmentShader: '...',
	attributeNames: [
		'a_vPosition',
		'a_vUv',
	],
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
	attributes: [
		[
			0, 0,
			0, 1,
			1, 1,
			1, 0,
		],
	],
});

```


#### Renderable
```typescript
import { Renderable } from '@downpourdigital/boxes';

const obj1 = new Renderable({
	geometry: new BufferGeometry(...),
	material: new Material(...),
	depthTest: true,
});

```
Inherits the transform properties from `TransformNode` and provides the following uniforms:

* `u_mModel` mat4 – the model matrix
* `u_mView` mat4 – the view matrix
* `u_mProjection` mat4 – the projection matrix (provided by the camera)



#### TransformNode
```typescript
import { TransformNode, vec3 } from '@downpourdigital/boxes';

const group = new TransformNode();
group.append( child ); // append renderable or another transform node
group.remove( child );

vec3.set(group.origin, 0, 0, 0 );
vec3.set(group.translation, 0, 0, 0 );
vec3.set(group.scale, 1, 1, 1 );
vec3.set(group.rotation, 0, 0, 0 );
```


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
});

const shaderPassA = new ShaderPass('frag shader here');
const shaderPassB = new ShaderPass('frag shader here');

const fboA = new Framebuffer({
	renderer,
	width: 400,
	height: 300,
	depth: false,
});


postFx.render([
	{ scene, camera },		//	first render a scene
	shaderPassA,			//	apply a shaderpass
	fboA,					//	render to fboA
]);

postFx.render([
	fboA,					//	use fboA as input
	shaderPassB,			//	apply a shaderpass
	shaderPassA,			//	apply another shaderpass
]);							//	since no fbo is provided as a last step,
								it will render to screen.
```
