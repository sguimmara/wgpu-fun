import { Color } from "chroma-js";
import Sized from "../core/Sized";
import { Visitor, Visitable } from "../core/Visitable";
import { Vec2, Vec3, Vec4 } from "../index";

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
        this.data[this.offset++] = v.x;
        this.data[this.offset++] = v.y;
    }

    visitVec3(v: Vec3): void {
        this.data[this.offset++] = v.x;
        this.data[this.offset++] = v.y;
        this.data[this.offset++] = v.z;
    }

    visitVec4(v: Vec4): void {
        this.data[this.offset++] = v.x;
        this.data[this.offset++] = v.y;
        this.data[this.offset++] = v.z;
        this.data[this.offset++] = v.w;
    }

    visitColor(color: Color): void {
        const [r, g, b, a] = color.gl();
        this.data[this.offset++] = r;
        this.data[this.offset++] = g;
        this.data[this.offset++] = b;
        this.data[this.offset++] = a;
    }

    upload(queue: GPUQueue) {
        this.source.visit(this);

        queue.writeBuffer(this.buffer, 0, this.data);

        this.offset = 0;
    }
}

export default BufferWriter;