(() => {
  const AUTH_SALT = "d+05E5pBKJKmKKQ30tHEzQ==";
  const AUTH_HASH = "3a1d12cfb615f90d6c00c6d495988fc9a835e46c266a5100a6e2353d71027b56";
  const AUTH_KEY = "banyaCertificateGeneratorAuth";

  const authView = document.querySelector("#authView");
  const generatorView = document.querySelector("#generatorView");
  const authForm = document.querySelector("#authForm");
  const authMessage = document.querySelector("#authMessage");
  const passwordInput = document.querySelector("#passwordInput");
  const togglePassword = document.querySelector("#togglePassword");
  const logoutButton = document.querySelector("#logoutButton");
  const recipientInput = document.querySelector("#recipientInput");
  const amountInput = document.querySelector("#amountInput");
  const previewRecipient = document.querySelector("#previewRecipient");
  const previewAmount = document.querySelector("#previewAmount");
  const templateImage = document.querySelector("#templateImage");
  const canvas = document.querySelector("#certificateCanvas");
  const downloadButton = document.querySelector("#downloadButton");
  const printButton = document.querySelector("#printButton");
  const clearButton = document.querySelector("#clearButton");
  const CERTIFICATE_FONT = '"Monotype Corsiva", "Segoe Script", "Palatino Linotype", Georgia, serif';

  const textLayout = {
    recipient: {
      x: 155,
      y: 570,
      maxWidth: 625,
      fontSize: 70,
      minSize: 38,
    },
    amount: {
      x: 145,
      y: 721,
      maxWidth: 570,
      fontSize: 62,
      minSize: 34,
    },
  };

  const defaultValues = {
    recipient: "Имя получателя",
    amount: "10 000 руб.",
  };

  const toHex = (buffer) => {
    return [...new Uint8Array(buffer)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  const hashPassword = async (password) => {
    const payload = new TextEncoder().encode(`${AUTH_SALT}:${password}`);
    const digest = await crypto.subtle.digest("SHA-256", payload);
    return toHex(digest);
  };

  const setAuthenticated = (isAuthenticated) => {
    sessionStorage.setItem(AUTH_KEY, isAuthenticated ? "1" : "0");
    authView.hidden = isAuthenticated;
    generatorView.hidden = !isAuthenticated;

    if (isAuthenticated) {
      recipientInput.focus();
      updatePreview();
      return;
    }

    passwordInput.value = "";
    passwordInput.focus();
  };

  const normalizeAmount = (value) => {
    const cleanValue = value.trim();

    if (!cleanValue) {
      return defaultValues.amount;
    }

    if (/[a-zа-яё₽]/i.test(cleanValue)) {
      return cleanValue;
    }

    return `${cleanValue} руб.`;
  };

  const updatePreview = () => {
    const recipient = recipientInput.value.trim() || defaultValues.recipient;
    const amount = normalizeAmount(amountInput.value);

    previewRecipient.textContent = recipient;
    previewAmount.textContent = amount;
    fitPreviewText(previewRecipient);
    fitPreviewText(previewAmount);
  };

  const fitPreviewText = (element) => {
    const width = element.getBoundingClientRect().width;
    element.style.setProperty("--fit-scale", "1");

    if (!width || element.scrollWidth <= width) {
      return;
    }

    const scale = Math.max(0.72, width / element.scrollWidth);
    element.style.setProperty("--fit-scale", scale);
  };

  const setCanvasFont = (ctx, layout, text) => {
    let fontSize = layout.fontSize;

    do {
      ctx.font = `${fontSize}px ${CERTIFICATE_FONT}`;
      fontSize -= 2;
    } while (ctx.measureText(text).width > layout.maxWidth && fontSize >= layout.minSize);
  };

  const drawText = (ctx, text, layout) => {
    ctx.save();
    ctx.fillStyle = "#5b4632";
    ctx.textBaseline = "alphabetic";
    ctx.shadowColor = "rgba(255, 255, 255, 0.34)";
    ctx.shadowBlur = 1;
    ctx.shadowOffsetY = 1;
    setCanvasFont(ctx, layout, text);
    ctx.fillText(text, layout.x, layout.y, layout.maxWidth);
    ctx.restore();
  };

  const renderCertificate = () => {
    const ctx = canvas.getContext("2d");
    const recipient = recipientInput.value.trim() || defaultValues.recipient;
    const amount = normalizeAmount(amountInput.value);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
    drawText(ctx, recipient, textLayout.recipient);
    drawText(ctx, amount, textLayout.amount);
  };

  const downloadCertificate = () => {
    const fontsReady = document.fonts?.ready || Promise.resolve();

    fontsReady.then(() => {
      renderCertificate();

      const recipient = (recipientInput.value.trim() || "sertifikat")
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();
      const link = document.createElement("a");

      link.href = canvas.toDataURL("image/png");
      link.download = `podarochnyi-sertifikat-${recipient || "banya"}.png`;
      link.click();
    });
  };

  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    authMessage.textContent = "";
    const enteredPassword = passwordInput.value;
    const enteredHash = await hashPassword(enteredPassword);

    if (enteredHash === AUTH_HASH) {
      setAuthenticated(true);
      return;
    }

    authMessage.textContent = "Пароль не подошел.";
    passwordInput.select();
  });

  togglePassword.addEventListener("click", () => {
    const isPasswordVisible = passwordInput.type === "text";
    passwordInput.type = isPasswordVisible ? "password" : "text";
    togglePassword.textContent = isPasswordVisible ? "Показать" : "Скрыть";
    togglePassword.setAttribute("aria-label", isPasswordVisible ? "Показать пароль" : "Скрыть пароль");
  });

  logoutButton.addEventListener("click", () => {
    setAuthenticated(false);
  });

  recipientInput.addEventListener("input", updatePreview);
  amountInput.addEventListener("input", updatePreview);
  downloadButton.addEventListener("click", downloadCertificate);
  printButton.addEventListener("click", () => window.print());
  clearButton.addEventListener("click", () => {
    recipientInput.value = "";
    amountInput.value = "";
    updatePreview();
    recipientInput.focus();
  });

  templateImage.addEventListener("load", updatePreview);
  window.addEventListener("resize", updatePreview);

  setAuthenticated(sessionStorage.getItem(AUTH_KEY) === "1");
})();
