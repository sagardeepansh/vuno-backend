(function () {
    window.initVunoChatbot = function (mountNode, config = {}) {
        const API = "https://vuno-backend.vercel.app/api/chat";

        let API_KEY = config?.apiKey || null;
        let OR_DOMAIN = config?.domain || null;
        let isLoading = false;

        // Inject styles inside Shadow DOM
        const style = document.createElement("style");
        style.textContent = `
      #chatToggle {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 55px;
        height: 55px;
        border-radius: 50%;
        background: #111;
        color: #fff;
        border: 0;
        cursor: pointer;
        font-size: 20px;
        box-shadow: 0 4px 10px rgba(0,0,0,.2);
      }

      #chatContainer {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 320px;
        height: 420px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 10px 9px rgb(0 0 0 / 9%);
        display: none;
        flex-direction: column;
        overflow: hidden;
      }

      #header {
        background: #111;
        color: #fff;
        padding: 8px 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      #messages {
        flex: 1;
        padding: 10px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .msg {
        max-width: 75%;
        padding: 8px 12px;
        border-radius: 12px;
        font-size: 13px;
      }

      .user {
        align-self: flex-end;
        background: #111;
        color: #fff;
      }

      .bot {
        align-self: flex-start;
        background: #eee;
      }

      #inputBox {
        display: flex;
        padding: 8px;
        border-top: 1px solid #eee;
      }

      input {
        flex: 1;
        padding: 8px;
        border-radius: 20px;
        border: 1px solid #ccc;
        outline: none;
      }

      .sendBtn {
        margin-left: 6px;
        padding: 8px 12px;
        border: 0;
        background: #111;
        color: #fff;
        border-radius: 20px;
        cursor: pointer;
      }

      .minimized {
        height: 50px !important;
      }

      .minimized #messages,
      .minimized #inputBox {
        display: none;
      }

      button {
        background: none;
        color: #fff;
        border: none;
        cursor: pointer;
      }
        #minBtn{
          font-size: 18px;
        }
          #closeBtn{
          font-size: 22px;
        }
        #vunoFooter {
            font-size: 11px;
            text-align: center;
            padding: 6px;
            padding-top: 0;
        }

        #vunoFooter a {
            color: #111;
            text-decoration: none;
            font-weight: 500;
        }

        #vunoFooter a:hover {
            text-decoration: underline;
        }
    `;

        mountNode.appendChild(style);

        // Create UI
        const wrapper = document.createElement("div");

        wrapper.innerHTML = `
      <button id="chatToggle">&#128172;</button>

      <div id="chatContainer">
        <div id="header">
          <span>Chat</span>
          <div>
            <button id="minBtn">&#45;</button>
            <button id="closeBtn">&times;</button>
          </div>
        </div>

        <div id="messages"></div>

        <div id="inputBox">
          <input id="input" placeholder="Type..." />
          <button class="sendBtn" id="sendBtn">Send</button>
        </div>
        <div id="vunoFooter">
            Powered by 
            <a href="https://vunoai.vercel.app" target="_blank">Vuno</a>
        </div>
        </div>
    `;

        mountNode.appendChild(wrapper);

        // Elements
        const chat = wrapper.querySelector("#chatContainer");
        const input = wrapper.querySelector("#input");
        const sendBtn = wrapper.querySelector("#sendBtn");
        const messages = wrapper.querySelector("#messages");

        // Events
        wrapper.querySelector("#chatToggle").onclick = () => {
            chat.style.display = chat.style.display === "flex" ? "none" : "flex";
            chat.classList.remove("minimized");
        };

        wrapper.querySelector("#minBtn").onclick = () => {
            chat.classList.toggle("minimized");
        };

        wrapper.querySelector("#closeBtn").onclick = () => {
            chat.style.display = "none";
        };

        function addMessage(text, type) {
            const el = document.createElement("div");
            el.className = "msg " + type;
            el.innerText = text;
            messages.appendChild(el);
            messages.scrollTop = messages.scrollHeight;
        }

        function setLoading(state) {
            isLoading = state;
            sendBtn.disabled = state;
            sendBtn.innerText = state ? "..." : "Send";
        }

        async function send() {
            const text = input.value.trim();
            if (!text || isLoading) return;

            if (!API_KEY) {
                addMessage("API key missing", "bot");
                return;
            }

            addMessage(text, "user");
            input.value = "";
            setLoading(true);

            try {
                const res = await fetch(API, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": API_KEY,
                        "x-origin": OR_DOMAIN
                    },
                    body: JSON.stringify({ query: text })
                });

                const data = await res.json();

                addMessage(
                    res.ok ? data.answer || "No response" : data.message || "Failed",
                    "bot"
                );
            } catch {
                addMessage("Server error", "bot");
            }

            setLoading(false);
        }

        sendBtn.onclick = send;

        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") send();
        });
    };
})();