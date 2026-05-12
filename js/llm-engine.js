import * as webllm from "https://esm.run/@mlc-ai/web-llm";

export class LLMEngine {
    constructor() {
        this.engine = new webllm.MLCEngine();
        // 推奨: 性能と精度のバランスが良いLlama-3.2-Vision
        this.modelId = "Llama-3.2-11B-Vision-Instruct-q4f16_1-MLC";
    }

    async load(onProgress) {
        this.engine.setInitProgressCallback(onProgress);
        await this.engine.reload(this.modelId);
    }

    async chat(messages) {
        const reply = await this.engine.chat.completions.create({ messages });
        return reply.choices[0].message;
    }
}
