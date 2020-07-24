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
	InstancedAttribute,
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
	HitRegionSphere,
	HitRegionPolygon,
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

renderer.render( scene: Scene, frameBuffer?: Framebuffer );
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
		u_vYourTexture: new ImageTexture(...), // or Framebuffer
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

`BufferGeometry` also supports instanced rendering:

```typescript
import { BufferGeometry, InstancedAttribute, vec2 } from '@downpourdigital/boxes';

const vec2Attr = new InstancedAttribute({
	length: 2, // number of floats per instance
	dynamic: true, // whether values will be updated
});

const mat4Attr = new InstancedAttribute({
	length: 16,
	dynamic: true,
});

const geometry = new BufferGeometry({
	verts: [...],
	instances: 10,
	instancedAttributes: {
		a_vTest: vec2Attr,
		a_mTest: mat4Attr,
	},
});

// interacting with instances:
const i = 4;

vec2.set( vec2Attr.views[i], 1, 1 );
vec2Attr.update();
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
	layer: 0,
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
scene.activeCamera = someCamera; // set active camera to render from
scene.activeLayer = someNumber; // set layer to be rendered, undefined for all layers
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
	initial: { // initial buffer value, before the actual texture is loaded
		data: new Uint8Array([0, 0, 0, 255]),
		width: 1,
		height: 1,
	},
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
	scene,				//	first render a scene
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


#### HitRegionSphere
`HitRegionSphere ` is a spherical raycasting / hit detection target.
The `.test` method returns the proximity to the spheres center, where 1 is the exact center and 0 the outer radius. The `coords` argument describes the point to test in view space coordinates (scaled to -1 to 1).

```typescript
import {
	HitRegionSphere,
} from '@downpourdigital/boxes';

const hitregion = new HitRegionSphere({
	radius: 1,
});

someTraversable.append( hitregion );

const proximity = hitregion.test( coords: vec2 );
if( proximity > 0 ) console.log( 'hit!' );

```


#### HitRegionPolygon
`HitRegionPolygon` is a polygonal raycasting / hit detection target. The constructor accepts an array of 2D vertices to define the polygonal shape. It defaults to a 1 by 1 plane. 

```typescript
import {
	HitRegionPolygon,
} from '@downpourdigital/boxes';

const hitregion = new HitRegionPolygon({
	verts: [-.5, -.5, -.5, .5, .5, .5, .5, -.5], // 1x1 plane
});

someTraversable.append( hitregion );

if( hitregion.test( coords: vec2 ) ) console.log( 'hit!' );

```


### License
© 2020 [DOWNPOUR DIGITAL](https://downpour.digital), licensed under BSD-4-Clause
