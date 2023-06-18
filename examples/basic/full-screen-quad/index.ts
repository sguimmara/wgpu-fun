import { Context } from "hammerhead.gl/core";
import { ScreenQuad } from "hammerhead.gl/geometries";
import { BasicMaterial } from "hammerhead.gl/materials";
import { Camera, Mesh } from "hammerhead.gl/scene";

import { load8bitImage } from "../../lib";

let canvas = document.getElementById("canvas") as HTMLCanvasElement;

async function main() {
    const logo = await load8bitImage("/webgpu.png");

    const context = await Context.create(canvas);
    const renderer = context.renderer;

    const material = new BasicMaterial().withColorTexture(logo);

    const mesh = new Mesh({
        material,
        geometry: new ScreenQuad(),
    });

    const camera = new Camera("orthographic");

    function render() {
        renderer.render(mesh, camera);
    }

    render();

    context.on("resized", render);
}

main();
