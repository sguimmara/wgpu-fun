import chroma from 'chroma-js';
import Context from 'hammerhead.gl/core/Context';
import MathUtils from 'hammerhead.gl/core/MathUtils';
import BasicMaterial from 'hammerhead.gl/materials/BasicMaterial';
import { CullingMode, FrontFace, RenderingMode } from 'hammerhead.gl/materials/Material';
import Camera from 'hammerhead.gl/objects/Camera';
import Mesh from 'hammerhead.gl/objects/Mesh';
import Object3D from 'hammerhead.gl/objects/Object3D';

import { loadPLYModel } from '../../lib';

let canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function main() {
    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma('gray');

    const geometry = await loadPLYModel('/files/hammerhead.ply');
    const wireframe = new BasicMaterial({ renderingMode: RenderingMode.TriangleLines }).withDiffuseColor(chroma('black'));

    function createShark() {
        const solid = new BasicMaterial({
            renderingMode: RenderingMode.Triangles,
            frontFace: FrontFace.CW,
            cullingMode: CullingMode.Front,
        }).withDiffuseColor(chroma.random());

        const solidMesh = new Mesh({ geometry, material: solid});
        const wireframeMesh = new Mesh({ geometry, material: wireframe});

        solidMesh.add(wireframeMesh);

        const x = MathUtils.random(250, 2000);
        const y = MathUtils.random(-200, 200);
        const z = MathUtils.random(-500, 500);

        solidMesh.transform.setPosition(x, y, z);

        return solidMesh;
    }

    const root = new Object3D();
    const sharks: Object3D[] = [];

    for (let i = 0; i < 100; i++) {
        const shark = createShark();
        root.add(shark);
        sharks.push(shark);
    }
    const camera = new Camera('perspective');
    camera.transform.setPosition(0, 1, 500);
    camera.nearPlane = 1;
    camera.farPlane = 3000;

    function render() {
        renderer.render(root, camera);
    }

    function animate(object: Object3D, dt: number) {
        const offset = -200 * dt;
        object.transform.translateX(offset);
    }

    let now = performance.now();

    function renderLoop() {
        render();
        const current = performance.now();
        const dt = (current - now) / 1000;
        now = current;

        for (let i = 0; i < sharks.length; i++) {
            const shark = sharks[i];
            animate(shark, dt);
        }

        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on('resized', render);
}

main();