import * as webllm from "https://esm.run/@mlc-ai/web-llm";

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const status = document.getElementById("status");
const progressBar = document.getElementById("progress-bar");

// 使用するモデルの指定（Llama-3など）
const selectedModel = "Llama-3-8B-Instruct-v0.1-q4f16_1-MLC";

let engine;

async function init() {
    status.innerText = "モデルを初期化中（数GBのDLが発生します）...";
    
    try {
        engine = await webllm.CreateMLCEngine(selectedModel, {
            initProgressCallback: (report) => {
                const progress = Math.round(report.progress * 100);
                progressBar.style.width = progress + "%";
                status.innerText = `読み込み中: ${progress}%`;
            }
        });
        
        status.innerText = "準備完了！";
        userInput.disabled = false;
        sendBtn.disabled = false;
    } catch (e) {
        status.innerText = "エラー: WebGPU非対応ブラウザかもしれません。";
        console.error(e);
    }
}

async function sendMessage() {
    const text = userInput.value;
    if (!text) return;

    // 自分のメッセージを表示
    appendMessage("user", text);
    userInput.value = "";

    // AIの返答エリアを作成
    const aiMsgDiv = appendMessage("assistant", "...");
    let fullReply = "";

    const chunks = await engine.chat.completions.create({
        messages: [{ role: "user", content: text }],
        stream: true, // ストリーミングを有効に
    });

    for await (const chunk of chunks) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullReply += content;
        aiMsgDiv.innerText = fullReply; // リアルタイム更新
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function appendMessage(role, text) {
    const div = document.createElement("div");
    div.className = `message ${role}`;
    div.innerText = text;
    chatBox.appendChild(div);
    return div;
}

sendBtn.onclick = sendMessage;
init();
