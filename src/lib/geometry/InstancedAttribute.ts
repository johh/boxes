
export interface InstancedAttributeProps {
	length: number;
	dynamic?: boolean;
}

export default class InstancedAttribute {
	public dynamic: boolean;
	public needsUpdate = true;
	public views: Float32Array[] = [];
	public data: Float32Array;
	public length: number;

	constructor({
		length,
		dynamic = false,
	}: InstancedAttributeProps ) {
		this.length = length;
		this.dynamic = dynamic;
	}


	public init( instanceCount: number ): void {
		if ( this.data ) throw new Error( 'Cannot reinitialise attribute. Use update instead' );

		this.data = new Float32Array( instanceCount * this.length );

		for ( let i = 0; i < instanceCount; i += 1 ) {
			this.views.push( new Float32Array(
				this.data.buffer,
				i * this.length * 4, // byte offset
				this.length, // floats to pull out
			) );
		}
	}


	public update(): void {
		if ( !this.dynamic && !this.needsUpdate ) {
			console.warn( '[WebGL]: You shouldn\'t update attributes not marked as dynamic.' );
		}

		this.needsUpdate = true;
	}


	public setUpdated(): void {
		this.needsUpdate = false;
	}
}
