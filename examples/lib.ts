import chroma from "chroma-js";
import BufferGeometry from "../src/geometries/BufferGeometry";
import Texture from "../src/textures/Texture";

import { parse } from "@loaders.gl/core";
import * as ply from '@loaders.gl/ply';
import Object3D from '../src/objects/Object3D';
import Mesh from "../src/objects/Mesh";
import Camera from "../src/objects/Camera";
import Box3 from "../src/core/Box3";

export function bindSlider(elementId: string, fn: Function) {
    const slider = document.getElementById(elementId) as HTMLInputElement;
    if (slider) {
        slider.oninput = () => fn(Number.parseFloat(slider.value));
    }
}

export function bindToggle(elementId: string, fn: Function) {
    const toggle = document.getElementById(elementId) as HTMLInputElement;
    if (toggle) {
        toggle.oninput = () => fn(toggle.checked);
    }
}

export async function wait(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export function frameBounds(bounds: Box3, camera: Camera) {
    const [x, y, z] = bounds.center;
    const [mx, my, mz] = bounds.max;
    camera.transform.setPosition(mx * 3, my * 3, mz * 3);
    camera.transform.lookAt(x, y, z);
}

export function frameObject(obj: Mesh, camera: Camera) {
    const geometry = obj.geometry;
    const bounds = geometry.getBounds();
    frameBounds(bounds, camera);
}

export async function loadPLYModel(uri: string): Promise<BufferGeometry> {
    const res = await fetch(uri);
    const text = await res.text();
    const data = await parse(text, ply.PLYLoader);

    const vertices = data.attributes.POSITION.value as Float32Array;
    const indices = data.indices.value as Uint32Array;

    const geometry = new BufferGeometry({
        vertexCount: vertices.length,
        indexCount: indices.length,
        indexBuffer: indices,
        vertices,
    });

    geometry.getBounds();
    geometry.setColors(chroma('white'));
    geometry.setTexCoords();

    return geometry;
}

export function load8bitImage(img: HTMLImageElement, url: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
        img.crossOrigin = 'anonymous';
        img.src = url;
        img.onerror = reject;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('could not acquire 2d context');
            }
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const texture = new Texture({
                width: img.width,
                height: img.height,
                data: data.data
            });
            resolve(texture);
        }
    });
}