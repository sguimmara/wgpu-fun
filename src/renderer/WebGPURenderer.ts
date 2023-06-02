import chroma from "chroma-js";
import Mesh from "../objects/Mesh";
import RenderPipeline from "./RenderPipeline";
import Container from "../core/Container";
import PostProcessingMaterial from "../materials/postprocessing/PostProcessingMaterial";
import { Object3D } from "../index";

const DEFAULT_CLEAR_COLOR = chroma('black');

class WebGPURenderer {
    private readonly device: GPUDevice;
    private readonly context: GPUCanvasContext;

    private renderPipeline: RenderPipeline;

    clearColor: chroma.Color = DEFAULT_CLEAR_COLOR;

    constructor(device: GPUDevice, context: GPUCanvasContext, container: Container) {
        this.device = device;
        this.context = context;

        this.renderPipeline = new RenderPipeline(this.device, container);
    }

    private getMeshes(graph: Object3D): Mesh[] {
        const meshes: Mesh[] = [];

        if (graph) {
            graph.traverse(obj => {
                if (obj.type === 'Mesh') {
                    meshes.push(obj as Mesh);
                }
            });
        }

        return meshes;
    }

    /**
     * Renders a scene graph.
     * @param root The root of the object graph to render. If unspecified, the rendered result is
     * simply the clear color and optional post-processing effects.
     */
    render(root?: Object3D) {
        this.renderPipeline.setClearColor(this.clearColor);
        const renderList = this.getMeshes(root);
        this.renderPipeline.render(renderList, this.context.getCurrentTexture());
    }

    setRenderStages(stages: PostProcessingMaterial[]) {
        this.renderPipeline.clear();
        for (const material of stages) {
            this.renderPipeline.addStage(material);
        }
    }

    destroy() {
        this.renderPipeline.destroy();
    }
}

export default WebGPURenderer;