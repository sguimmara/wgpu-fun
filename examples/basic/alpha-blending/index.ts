import chroma from "chroma-js";
import { Context } from "hammerhead.gl/core";
import { Quad, ScreenQuad, WireQuad } from "hammerhead.gl/geometries";
import {
    BasicMaterial,
    Material,
    RenderingMode,
} from "hammerhead.gl/materials";
import { Camera, Mesh, Object3D } from "hammerhead.gl/scene";

import { load8bitImage } from "../../lib";
import { Pane } from "tweakpane";
import { BlendFactor, BlendOp } from "hammerhead.gl/materials/Material";

let canvas = document.getElementById("canvas") as HTMLCanvasElement;

async function main() {
    const checkerboard = await load8bitImage("/checkerboard.jpg");
    const explosion = await load8bitImage("/explosion.png");

    const context = await Context.create(canvas);
    const renderer = context.renderer;
    renderer.clearColor = chroma("cyan");

    const background = new Mesh({
        material: new BasicMaterial()
            .withColorTexture(checkerboard)
            .withDiffuseColor(chroma([255, 255, 255, 0.4], 'rgb')),
        geometry: new ScreenQuad(),
    });

    background.transform.setPosition(0, 0, -0.2);

    const tile = new Mesh({
        material: new BasicMaterial().withColorTexture(explosion),
        geometry: new Quad(),
    });

    const wireframe = new Mesh({
        material: new BasicMaterial({
            renderingMode: RenderingMode.LineList,
        }).withDiffuseColor(chroma("yellow")),
        geometry: new WireQuad(),
    });

    tile.add(wireframe);

    const root = new Object3D();

    root.add(background);
    root.add(tile);

    const camera = new Camera("orthographic");

    function render() {
        renderer.render(root, camera);
    }

    context.on('resized', () => render());

    render();

    const pane = new Pane();

    function createFolder(material: Material) {
        const colorFolder = pane.addFolder({
            title: 'color blending',
            expanded: true,
        });

        const alphaFolder = pane.addFolder({
            title: 'alpha blending',
            expanded: true,
        });

        colorFolder.addInput(material.colorBlending, 'op', {
            options: BlendOp,
        });
        colorFolder.addInput(material.colorBlending, 'srcFactor', {
            options: BlendFactor,
        });
        colorFolder.addInput(material.colorBlending, 'dstFactor', {
            options: BlendFactor,
        });

        alphaFolder.addInput(material.alphaBlending, 'op', {
            options: BlendOp,
        });
        alphaFolder.addInput(material.alphaBlending, 'srcFactor', {
            options: BlendFactor,
        });
        alphaFolder.addInput(material.alphaBlending, 'dstFactor', {
            options: BlendFactor,
        });
    }

    createFolder(tile.material);

    pane.on('change', () => {
        tile.material.incrementVersion();
        render();
    });
}

main();
