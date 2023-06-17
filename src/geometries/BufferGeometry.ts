import {
    Box3,
    Clone,
    Destroy,
    EventDispatcher,
    EventHandler,
    Observable,
    Version,
    Versioned,
    VertexBufferSlot,
} from '@/core';
import { Color } from 'chroma-js';

let BUFFER_GEOMETRY_ID = 0;

export type GeometryEvents = "destroy";

type IndexSize = 'uint16' | 'uint32';

/**
 * Base class for all geometries.
 */
export default class BufferGeometry implements Observable<GeometryEvents>, Destroy, Clone {
    private readonly dispatcher: EventDispatcher<
        BufferGeometry,
        GeometryEvents
    >;
    readonly id: number;

    readonly vertexBuffers: Map<VertexBufferSlot, Versioned<Float32Array>>;
    // Note the absence of Uin16Array: this cannot be used with
    // the vertex pulling technique in vertex shaders
    readonly indexBuffer: Versioned<Uint32Array | Uint16Array>;
    readonly vertexCount: number;
    readonly indexCount: number;
    private cachedBounds: Box3;
    readonly indexSize: IndexSize;

    constructor(options: {
        vertexCount: number;
        indexCount: number;
        indexBuffer?: Uint32Array | Uint16Array;
        vertices?: Float32Array;
        texcoordBuffer?: Float32Array;
        colorBuffer?: Float32Array;
    }) {
        this.id = BUFFER_GEOMETRY_ID++;
        this.vertexBuffers = new Map();
        this.vertexBuffers.set(
            VertexBufferSlot.Position,
            options.vertices
                ? new Versioned(options.vertices)
                : new Versioned(new Float32Array(options.vertexCount * 3))
        );
        this.indexBuffer = new Versioned(
            options.indexBuffer ?? (options.indexCount <= 65536
                ? new Uint16Array(options.indexCount)
                : new Uint32Array(options.indexCount))
                );
        this.indexSize = this.indexBuffer.value instanceof Uint16Array ? 'uint16' : 'uint32';
        if (options.texcoordBuffer) {
            if (!this.vertexBuffers.has(VertexBufferSlot.TexCoord)) {
                this.vertexBuffers.set(
                    VertexBufferSlot.TexCoord,
                    new Versioned(options.texcoordBuffer)
                );
            }
        }
        if (options.colorBuffer) {
            if (!this.vertexBuffers.has(VertexBufferSlot.Color)) {
                this.vertexBuffers.set(
                    VertexBufferSlot.Color,
                    new Versioned<Float32Array>(options.colorBuffer)
                );
            }
        }
        this.vertexCount = options.vertexCount;
        this.indexCount = options.indexCount;
        this.dispatcher = new EventDispatcher<BufferGeometry, GeometryEvents>(
            this
        );
    }

    clone(): BufferGeometry {
        return new BufferGeometry({
            vertexCount: this.vertexCount,
            indexCount: this.indexCount,
            vertices: this.getVertexBuffer(VertexBufferSlot.Position)?.value,
            colorBuffer: this.getVertexBuffer(VertexBufferSlot.Color)?.value,
            texcoordBuffer: this.getVertexBuffer(VertexBufferSlot.TexCoord)
                ?.value,
            indexBuffer: this.indexBuffer.value,
        });
    }

    getLocalBounds() {
        if (!this.cachedBounds) {
            this.cachedBounds = Box3.fromPoints(
                this.vertexBuffers.get(VertexBufferSlot.Position).value
            );
        }
        return this.cachedBounds;
    }

    on(type: GeometryEvents, handler: EventHandler): void {
        this.dispatcher.on(type, handler);
    }

    destroy() {
        this.dispatcher.dispatch("destroy");
    }

    getVertexBuffer(slot: VertexBufferSlot): Versioned<Float32Array> | null {
        return this.vertexBuffers.get(slot);
    }

    setPositions(positions: ArrayLike<number>) {
        const item = this.vertexBuffers.get(VertexBufferSlot.Position);
        if (item.value !== positions) {
            item.value.set(positions, 0);
        }
        this.invalidate(item);
    }

    setColors(colors?: Color[] | Color) {
        if (!this.vertexBuffers.has(VertexBufferSlot.Color)) {
            this.vertexBuffers.set(
                VertexBufferSlot.Color,
                new Versioned(new Float32Array(this.vertexCount * 4))
            );
        }

        const item = this.vertexBuffers.get(VertexBufferSlot.Color);
        if (Array.isArray(colors)) {
            const values = colors.flatMap((c) => c.gl());
            item.value.set(values);
        } else if (colors) {
            const gl = colors.gl();
            const buf = item.value;
            for (let i = 0; i < this.vertexCount; i++) {
                buf.set(gl, i * 4);
            }
        }
        this.invalidate(item);
    }

    private invalidate(item: Version) {
        item.incrementVersion();
        this.cachedBounds = null;
    }

    setTexCoords(coords?: ArrayLike<number>) {
        if (!this.vertexBuffers.has(VertexBufferSlot.TexCoord)) {
            this.vertexBuffers.set(
                VertexBufferSlot.TexCoord,
                new Versioned(new Float32Array(this.vertexCount * 2))
            );
        }

        if (coords) {
            const item = this.vertexBuffers.get(VertexBufferSlot.TexCoord);
            item.value.set(coords, 0);
            this.invalidate(item);
        }
    }

    setIndices(indices: ArrayLike<number>) {
        this.indexBuffer.value.set(indices, 0);
        this.invalidate(this.indexBuffer);
    }
}
