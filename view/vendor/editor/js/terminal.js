let terminalCWD = "";
const rootFolderName = "htdocs";

const inputTerm = document.getElementById("terminal-input");
const outputTerm = document.getElementById("terminal-output");
const containerTerminal = document.querySelector(".terminal");

function scrollToBottom() {
  if (containerTerminal) {
    containerTerminal.scrollTop = containerTerminal.scrollHeight;
  }
}

function getRelativePath(fullPath) {
  if (!fullPath) return "/";
  const rootName = "htdoc";

  if (fullPath.includes(rootName)) {
    const parts = fullPath.split(rootName);
    let rel = parts.pop();
    return rel === "" ? "/" : rel;
  }
  return "/";
}

let display_terminal = document.querySelector(".terminal-body"),
  terminal_toggle = document.querySelector(".terminal_btn");

inputTerm.addEventListener("keydown", async (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const fullText = inputTerm.value;
    const commandSegments = fullText.split(/[&|;]/);
    const lastCommandSegment = commandSegments[commandSegments.length - 1];
    const words = lastCommandSegment.trimStart().split(" ");
    const partialName = words.pop();

    if (!partialName) return;

    const textBeforePartial = fullText.substring(
      0,
      fullText.lastIndexOf(partialName)
    );

    try {
      const response = await fetch(
        "../../../../model/terminal/autocomplete.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partial: partialName,
            cwd:
              window.terminalCWD ||
              (typeof currentProjectRoot !== "undefined"
                ? currentProjectRoot
                : ""),
          }),
        }
      );
      const suggestions = await response.json();

      if (suggestions.length === 1) {
        inputTerm.value = textBeforePartial + suggestions[0];
      } else if (suggestions.length > 1) {
        outputTerm.innerHTML += `<div style="color: #999; font-size: 0.8em;">${suggestions.join(
          "   "
        )}</div>`;
        scrollToBottom();
      }
    } catch (err) {
      console.error("Erro no autocomplete");
    }
    return;
  }

  if (e.key === "Enter") {
    const cmd = inputTerm.value.trim();
    if (!cmd) return;

    if (cmd === "clear") {
      outputTerm.innerHTML = "";
      inputTerm.value = "";
      return;
    }

    let effectiveCWD = window.terminalCWD || terminalCWD || "";

    const pathPrompt = getRelativePath(terminalCWD);
    outputTerm.innerHTML += `<div><span style="color:#56b6c2">user@android:${pathPrompt} $</span> ${cmd}</div>`;
    inputTerm.value = "";

    try {
      const response = await fetch("../../../../model/terminal/terminal.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: cmd,
          cwd: effectiveCWD,
        }),
      });

      const res = await response.json();

      if (res.newCwd) {
        terminalCWD = res.newCwd;
        window.terminalCWD = res.newCwd;
      }

      if (res.output) {
        const pre = document.createElement("pre");
        pre.style.color = "#ccc";
        pre.style.whiteSpace = "pre-wrap";
        pre.style.margin = "0";
        pre.textContent = res.output;
        outputTerm.appendChild(pre);
      }

      scrollToBottom();
      inputTerm.focus();
    } catch (err) {
      outputTerm.innerHTML += `<div style="color:red">Erro crítico: Verifique a conexão com o terminal.php</div>`;
    }
  }
});
terminal_toggle.addEventListener("click", () => {
  const isHidden = display_terminal.classList.contains("hidden");
  display_terminal.classList.toggle("hidden");
  if (isHidden) inputTerm.focus();
});
