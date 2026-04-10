(function (w, d) {
  // ✅ DOM-based guard (reliable)
  const EXISTING = d.getElementById("vuno-chatbot-host");

  if (EXISTING) {
    console.warn("Chatbot already mounted");
    EXISTING.style.zIndex = "2147483647"; // bring to front
    return;
  }

  const config = w.ChatBotConfig || {};
  config.domain = w.location.href;

  // ✅ Create host
  const host = d.createElement("div");
  host.id = "vuno-chatbot-host";

  host.style.position = "fixed";
  host.style.bottom = "20px";
  host.style.right = "20px";
  host.style.zIndex = "2147483647";

  d.body.appendChild(host);

  // ✅ Shadow DOM
  const shadow = host.attachShadow({ mode: "open" });

  // Container
  const container = d.createElement("div");
  container.id = "vuno-chatbot-root";

  // Scoped styles
  const style = d.createElement("style");
  style.textContent = `
    :host {
      all: initial;
    }

    * {
      box-sizing: border-box;
      font-family: sans-serif;
    }
  `;

  shadow.appendChild(style);
  shadow.appendChild(container);

  // ✅ Load bundle (MUST be URL, not local path)
  const script = d.createElement("script");
  script.src = "https://vuno-backend.vercel.app/widget/chatbot.bundle.js";
  script.async = true;

  script.onload = () => {
    if (typeof w.initVunoChatbot === "function") {
      w.initVunoChatbot(container, config);
    } else {
      console.error("Chatbot init function not found");
    }
  };

  script.onerror = () => {
    console.error("Failed to load chatbot bundle");
  };

  d.head.appendChild(script); // better than body
})(window, document);