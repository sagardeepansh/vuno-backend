(function () {
  // Prevent multiple loads
  if (window.__CHATBOT_LOADED__) return;
  window.__CHATBOT_LOADED__ = true;

  const config = window.ChatBotConfig || {};

  const iframe = document.createElement("iframe");

  iframe.src = "http://127.0.0.1:5500/public/widget/index.html";

  iframe.style.position = "fixed";
  iframe.style.bottom = "20px";
  iframe.style.right = "20px";
  iframe.style.width = "350px";
  iframe.style.height = "500px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "10px";
  iframe.style.zIndex = "999999";

  iframe.onload = () => {
    iframe.contentWindow.postMessage(
      {
        type: "CHATBOT_CONFIG",
        payload: config
      },
      "*"
    );
  };

  document.body.appendChild(iframe);
})();