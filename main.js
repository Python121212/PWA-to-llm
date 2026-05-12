import * as webllm from "https://esm.run/@mlc-ai/web-llm";

// スマホでも比較的動きやすい軽量モデル（Gemma 2B）を指定
const selectedModel = "gemma-2b-it-q4f16_1-MLC"; 

let engine;

async function init() {
    const status = document.getElementById("status");
    
    // エンジンの作成
    engine = await webllm.CreateMLCEngine(selectedModel, {
        initProgressCallback: (report) => {
            status.innerText = `読み込み中: ${Math.round(report.progress * 100)}%`;
        }
    });
    
    status.innerText = "準備完了！";
    document.getElementById("send").disabled = false;
}

async function chat() {
    const input = document.getElementById("input");
    const output = document.getElementById("output");
    
    const messages = [{ role: "user", content: input.value }];
    input.value = "";

    const chunks = await engine.chat.completions.create({
        messages,
        stream: true,
    });

    let reply = "";
    for await (const chunk of chunks) {
        reply += chunk.choices[0]?.delta?.content || "";
        output.innerText = reply; // 本格的なストリーミング表示
    }
}

document.getElementById("send").onclick = chat;
init();
