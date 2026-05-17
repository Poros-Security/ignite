document.addEventListener("DOMContentLoaded", () => {
  const targetInput = document.getElementById("target-input");
  const targetButtons = document.querySelectorAll(".target-btn");

  targetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!targetInput) {
        return;
      }

      targetInput.value = button.dataset.target || "";
      targetInput.focus();
    });
  });

  const forms = document.querySelectorAll(".js-loading-form");
  forms.forEach((form) => {
    form.addEventListener("submit", () => {
      const submit = form.querySelector("button[type='submit']");
      if (!submit) {
        return;
      }

      const loadingText = submit.dataset.loadingText || "EXECUTING...";
      submit.dataset.originalText = submit.textContent;
      submit.textContent = loadingText;
      submit.disabled = true;
    });
  });

  const terminalOutput = document.getElementById("terminal-output");
  const clearButton = document.getElementById("clear-output");
  const copyButton = document.getElementById("copy-output");

  if (clearButton && terminalOutput) {
    clearButton.addEventListener("click", () => {
      terminalOutput.textContent = "Output cleared.";
      terminalOutput.classList.remove("ok", "fail");
    });
  }

  if (copyButton && terminalOutput) {
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(terminalOutput.textContent || "");
        copyButton.textContent = "Copied";
        setTimeout(() => {
          copyButton.textContent = "Copy";
        }, 900);
      } catch (_err) {
        copyButton.textContent = "Failed";
        setTimeout(() => {
          copyButton.textContent = "Copy";
        }, 900);
      }
    });
  }
});
