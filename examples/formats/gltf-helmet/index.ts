import { Context, MathUtils } from "hammerhead.gl/core";
import { Camera, Node } from "hammerhead.gl/scene";
import GLTFLoader from "./gltf";
import { frameBounds } from "../../lib";
import Inspector from "../../Inspector";
import { Renderer } from "hammerhead.gl/renderer";
import { Colorimetry } from "hammerhead.gl/materials/postprocessing";
import { BoundsHelper } from "hammerhead.gl/helpers";

let canvas = document.getElementById("canvas") as HTMLCanvasElement;

async function main() {
    const model = 'DamagedHelmet';
    const uri = `https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/${model}/glTF/${model}.gltf`;
    const baseUri = `https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/${model}/glTF/`;
    const loader = new GLTFLoader();
    const gltf = await loader.loadGltfScene(uri, baseUri);
    const context = await Context.create(canvas);
    const renderer = context.renderer as Renderer;

    const scene = gltf[0];

    const root = new Node();
    const boundsHelper = new BoundsHelper({ source: scene });
    root.add(scene);
    root.add(boundsHelper);

    const camera = new Camera("perspective");
    frameBounds(root.getWorldBounds(), camera);

    function render() {
        renderer.render(root, camera);
    }

    let now = performance.now();
    let rotation = 0;

    function renderLoop() {
        render();
        const current = performance.now();
        const dt = (current - now) / 1000;
        const degrees = 40 * dt;
        rotation += degrees;
        now = current;
        scene.transform.rotateY(MathUtils.deg2rad(degrees));
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    context.on("resized", render);

    const inspector = new Inspector(context);
}

main();
