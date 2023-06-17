import chroma, { Color } from "chroma-js";
import fragmentShader from "./BasicMaterial.frag.wgsl";
import triangleVertexShader from "./default.vert.wgsl";
import lineListVertexShader from "./line-list.vert.wgsl";
import pointsVertexShader from "./points.vert.wgsl";
import wireframeVertexShader from "./wireframe.vert.wgsl";
import { Texture } from "@/textures";
import Material, { RenderingMode, CullingMode, FrontFace } from "./Material";

const WHITE = chroma("white");

function selectVertexShader(params: { renderingMode?: RenderingMode }): string {
    const { renderingMode } = params;
    if (renderingMode) {
        switch (renderingMode) {
            case RenderingMode.TriangleLines:
                return wireframeVertexShader;
            case RenderingMode.LineList:
                return lineListVertexShader;
            case RenderingMode.Points:
                return pointsVertexShader;
        }
    }

    return triangleVertexShader;
}

/**
 * A simple material with no support for lighting.
 */
class BasicMaterial extends Material {
    private readonly colorBinding: number;
    private readonly colorTextureBinding: number;
    private readonly pointSizeBinding: number;

    constructor(
        params: {
            renderingMode?: RenderingMode;
            cullingMode?: CullingMode;
            frontFace?: FrontFace;
        } = {}
    ) {
        super({
            fragmentShader,
            vertexShader: selectVertexShader(params),
            ...params,
        });

        this.colorBinding = this.layout.getUniformBinding("color");
        this.colorTextureBinding =
            this.layout.getUniformBinding("colorTexture");

        if (this.renderingMode === RenderingMode.Points) {
            this.pointSizeBinding = this.layout.getUniformBinding('pointSize');
            this.withPointSize(2);
        }

        this.withDiffuseColor(WHITE);
    }

    withPointSize(size: number) {
        this.setScalar(this.pointSizeBinding, size);
        return this;
    }

    withDiffuseColor(color: Color) {
        this.setColor(this.colorBinding, color);
        return this;
    }

    withColorTexture(texture: Texture) {
        this.setTexture(this.colorTextureBinding, texture);
        return this;
    }
}

export default BasicMaterial;
