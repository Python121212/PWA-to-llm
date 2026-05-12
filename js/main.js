import { LLMEngine } from './llm-engine.js';
import { FileHandler } from './file-utils.js';

// DOM要素の取得
const statusLabel = document.getElementById("status");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const chatLog = document.getElementById("chat-log");
const previewArea = document.getElementById("preview-area");
const fileInput = document.getElementById("file-input");

// エンジンのインスタンス化
const engine = new LLMEngine();
let attachedFile = null;

/**
 * チャット画面にメッセージを追加
 */
function addMessage(msg, role) {
    const div = document.createElement("div");
    div.className = `msg ${role}`;
    div.innerText = msg;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight; // 最下部へスクロール
}

/**
 * 初期化処理
 */
async function init() {
    try {
        await engine.load((report) => {
            statusLabel.innerText = report.text;
        });
        statusLabel.innerText = "準備完了 (GPU動作中)";
        userInput.disabled = false;
        sendBtn.disabled = false;
    } catch (e) {
        statusLabel.innerText = "エラー: WebGPUが利用できないか、モデルのロードに失敗しました。";
        console.error(e);
    }
}

/**
 * ファイル選択時の処理
 */
fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
        const base64Image = await FileHandler.processImage(file);
        attachedFile = { type: "image", data: base64Image };
        previewArea.innerHTML = `
            <div class="preview-item">
                <img src="${base64Image}">
                <span style="font-size:10px;">画像セット完了</span>
            </div>`;
    } else {
        const text = await FileHandler.processText(file);
        attachedFile = { type: "text", data: text };
        previewArea.innerHTML = `<div class="preview-item" style="padding:5px; font-size:10px;">📄 ${file.name.slice(0,10)}...</div>`;
    }
};

/**
 * 送信ボタンクリック時の処理
 */
async function handleSend() {
    const prompt = userInput.value;
    if (!prompt && !attachedFile) return;

    // UIの更新
    addMessage(prompt || "ファイルを解析中...", "user");
    userInput.value = "";
    previewArea.innerHTML = "";
    sendBtn.disabled = true;

    // プロンプトの組み立て
    let content = [];
    if (attachedFile?.type === "image") {
        content = [
            { type: "text", text: prompt || "この画像について説明してください" },
            { type: "image_url", image_url: { url: attachedFile.data } }
        ];
    } else if (attachedFile?.type === "text") {
        content = `以下の内容を読み取って回答してください:\n\n${attachedFile.data}\n\n質問: ${prompt}`;
    } else {
        content = prompt;
    }

    const currentFile = attachedFile; // リセット前にコピー
    attachedFile = null; 

    try {
        const messages = [{ role: "user", content: content }];
        const response = await engine.chat(messages);
        addMessage(response.content, "ai");
    } catch (err) {
        addMessage("エラーが発生しました。詳細はコンソールを確認してください。", "ai");
        console.error(err);
    } finally {
        sendBtn.disabled = false;
    }
}

// イベントリスナーの設定
sendBtn.onclick = handleSend;

// Enterキーでも送信可能にする
userInput.onkeypress = (e) => {
    if (e.key === "Enter" && !sendBtn.disabled) handleSend();
};

// 起動！
init();
