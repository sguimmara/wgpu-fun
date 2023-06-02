import { Color } from "chroma-js";
import { Mat4, Vec2, Vec3, Vec4 } from "wgpu-matrix";
import Sized from "../core/Sized";
import { Visitor, Visitable } from "../core/Visitable";

/**
 * Serializes objects into buffers.
 * The serialized object must implement `Visitable` and `Sized`.
 */
class BufferWriter implements Visitor
{
    readonly buffer: GPUBuffer;
    private readonly source: Sized & Visitable;
    private offset: number;
    private data: Float32Array;

    constructor(source: Sized & Visitable, buffer: GPUBuffer) {
        this.offset = 0;
        this.source = source;
        this.buffer = buffer;
        const sourceSize = this.source.getByteSize();
        this.data = new Float32Array(sourceSize / 4);
        this.data.fill(0);
        if (buffer.size != sourceSize) {
            throw new Error(`size mismatch: source is ${sourceSize}, but buffer is ${buffer.size}`);
        }
    }

    visitNumber(number: number): void {
        this.data[this.offset++] = number;
    }

    visitVec2(v: Vec2): void {
        this.data[this.offset++] = v[0];
        this.data[this.offset++] = v[1];
    }

    visitVec3(v: Vec3): void {
        this.data[this.offset++] = v[0];
        this.data[this.offset++] = v[1];
        this.data[this.offset++] = v[2];
    }

    visitVec4(v: Vec4): void {
        this.data[this.offset++] = v[0];
        this.data[this.offset++] = v[1];
        this.data[this.offset++] = v[2];
        this.data[this.offset++] = v[3];
    }

    visitColor(color: Color): void {
        const [r, g, b, a] = color.gl();
        this.data[this.offset++] = r;
        this.data[this.offset++] = g;
        this.data[this.offset++] = b;
        this.data[this.offset++] = a;
    }

    visitMat4(value: Mat4): void {
        // TODO unroll loop
        for (let i = 0; i < value.length; i++) {
            const element = value[i];
            this.data[this.offset++] = element;
        }
    }

    upload(queue: GPUQueue) {
        this.source.visit(this);

        queue.writeBuffer(this.buffer, 0, this.data);

        this.offset = 0;
    }
}

export default BufferWriter;