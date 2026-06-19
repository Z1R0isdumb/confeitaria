const CONFIG = {
  whatsappNumber: "13213189311",
  instagram: "cakebreakorlando",
  eventYear: 2026,
  earlyBirdDeadline: "2026-06-20T23:59:59-04:00",
  colors: ["#ff4f93", "#08aeb5", "#ffc536", "#8c4bc6", "#ff8e31", "#ffffff"]
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function createConfetti(x = window.innerWidth / 2, y = window.innerHeight / 2, amount = 36) {
  if (prefersReducedMotion) return;

  const template = $("#confetti-piece");
  for (let i = 0; i < amount; i += 1) {
    const piece = template.content.firstElementChild.cloneNode(true);
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.setProperty("--piece-color", pick(CONFIG.colors));
    piece.style.setProperty("--x", `${random(-180, 180)}px`);
    piece.style.setProperty("--y", `${random(-80, 260)}px`);
    piece.style.setProperty("--rot", `${random(-420, 420)}deg`);
    document.body.append(piece);
    piece.addEventListener("animationend", () => piece.remove(), { once: true });
  }
}

function initMobileNav() {
  const toggle = $(".nav-toggle");
  const nav = $(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    nav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  nav.addEventListener("click", (event) => {
    if (event.target.matches("a, button")) {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    }
  });
}

function initRevealAnimations() {
  const items = $$(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    items.forEach((item) => item.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

  items.forEach((item) => observer.observe(item));
}

function initCursorSprinkles() {
  if (prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) return;

  let last = 0;
  window.addEventListener("pointermove", (event) => {
    const now = performance.now();
    if (now - last < 55) return;
    last = now;

    const dot = document.createElement("span");
    dot.className = "cursor-dot";
    dot.style.left = `${event.clientX}px`;
    dot.style.top = `${event.clientY}px`;
    dot.style.background = pick(CONFIG.colors);
    dot.style.setProperty("--x", `${random(-24, 24)}px`);
    dot.style.setProperty("--y", `${random(20, 70)}px`);
    document.body.append(dot);
    dot.addEventListener("animationend", () => dot.remove(), { once: true });
  }, { passive: true });
}

function initCupcake() {
  const cupcake = $("[data-cupcake]");
  if (!cupcake) return;

  cupcake.addEventListener("click", (event) => {
    const rect = cupcake.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;
    createConfetti(x, y, 28);

    const hint = $(".click-hint", cupcake);
    if (hint) {
      hint.textContent = pick([
        "Mais confeitos!",
        "Ficou mais doce!",
        "Cupcake desbloqueado!",
        "Chef mirim aprovado!"
      ]);
    }
  });
}

function initSprinkleGame() {
  const game = $("[data-game]");
  const start = $("[data-start-game]");
  const scoreText = $("[data-score]");
  const message = $("[data-game-message]");
  if (!game || !start || !scoreText || !message) return;

  let score = 0;
  let interval;
  let playing = false;

  function endGame() {
    playing = false;
    start.disabled = false;
    start.textContent = "Jogar de novo";
    clearInterval(interval);
    $$(".falling-sprinkle", game).forEach((item) => item.remove());
    message.textContent = "Você desbloqueou: vaga doce + memória deliciosa! 🎉";
    createConfetti(game.getBoundingClientRect().left + game.clientWidth / 2, game.getBoundingClientRect().top + 120, 70);
  }

  function spawnSprinkle() {
    if (!playing) return;
    const sprinkle = document.createElement("button");
    sprinkle.className = "falling-sprinkle";
    sprinkle.type = "button";
    sprinkle.setAttribute("aria-label", "Confeito para coletar");
    sprinkle.style.left = `${random(18, Math.max(19, game.clientWidth - 32))}px`;
    sprinkle.style.top = "0px";
    sprinkle.style.setProperty("--sprinkle-color", pick(CONFIG.colors));
    sprinkle.style.animationDuration = `${random(2.2, 3.5)}s`;
    game.append(sprinkle);

    sprinkle.addEventListener("click", () => {
      if (!playing) return;
      score += 1;
      scoreText.textContent = String(score);
      message.textContent = pick([
        "Boa! Continue coletando.",
        "Confeito capturado!",
        "Chef rápido!",
        "Mais um toque doce!"
      ]);
      createConfetti(sprinkle.getBoundingClientRect().left, sprinkle.getBoundingClientRect().top, 10);
      sprinkle.remove();
      if (score >= 10) endGame();
    });

    sprinkle.addEventListener("animationend", () => sprinkle.remove(), { once: true });
  }

  start.addEventListener("click", () => {
    score = 0;
    scoreText.textContent = "0";
    playing = true;
    start.disabled = true;
    start.textContent = "Coletando...";
    message.textContent = "Clique nos confeitos antes que eles sumam!";
    $$(".falling-sprinkle", game).forEach((item) => item.remove());
    spawnSprinkle();
    clearInterval(interval);
    interval = setInterval(spawnSprinkle, 430);
  });
}

function initCardsAndPlanSelection() {
  const dialog = $("[data-dialog]");
  const planSelect = dialog ? $("select[name='plan']", dialog) : null;

  $$(".flip-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.matches("button")) return;
      card.classList.toggle("is-selected");
    });

    const selectButton = $(".mini-select", card);
    selectButton?.addEventListener("click", () => {
      const className = card.dataset.class || "Aula escolhida";
      if (planSelect) {
        const matchingOption = [...planSelect.options].find((option) => option.textContent.includes(className.split(" ")[0]));
        if (matchingOption) planSelect.value = matchingOption.value;
      }
      openSignupDialog();
    });
  });

  $$('[data-select-plan]').forEach((button) => {
    button.addEventListener("click", () => {
      $$('[data-plan-card]').forEach((card) => card.classList.remove("is-selected"));
      button.closest("[data-plan-card]")?.classList.add("is-selected");
      if (planSelect) planSelect.value = button.dataset.selectPlan;
      openSignupDialog();
    });
  });
}

function openSignupDialog() {
  const dialog = $("[data-dialog]");
  if (!dialog) return;

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function initDialog() {
  const dialog = $("[data-dialog]");
  const form = $("[data-signup-form]");
  if (!dialog || !form) return;

  $$('[data-open-dialog]').forEach((button) => {
    button.addEventListener("click", openSignupDialog);
  });

  $$('[data-close-dialog]').forEach((button) => {
    button.addEventListener("click", () => dialog.close());
  });

  dialog.addEventListener("click", (event) => {
    const card = $(".dialog-card", dialog);
    if (card && !card.contains(event.target)) dialog.close();
  });

  const ageInput = $("input[name='age']", form);
  const ageWarning = $("[data-age-warning]", form);
  ageInput?.addEventListener("input", () => {
    const age = Number(ageInput.value);
    const invalid = ageInput.value && (age < 7 || age > 10);
    ageWarning.textContent = invalid ? "A oficina é para crianças de 7 a 10 anos." : "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const age = Number(data.get("age"));

    if (age < 7 || age > 10) {
      ageWarning.textContent = "A oficina é para crianças de 7 a 10 anos.";
      ageInput.focus();
      return;
    }

    const message = [
      "Oi, Cake Break! Quero informações para inscrição na Oficina de Confeitaria Infantil.",
      `Responsável: ${data.get("guardian")}`,
      `Criança: ${data.get("child")}`,
      `Idade: ${data.get("age")}`,
      `Interesse: ${data.get("plan")}`,
      data.get("note") ? `Observação: ${data.get("note")}` : "",
      "Pode me passar disponibilidade e próximos passos?"
    ].filter(Boolean).join("\n");

    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    dialog.close();
    createConfetti(window.innerWidth / 2, window.innerHeight / 2, 60);
  });
}

function initCountdown() {
  const output = $("[data-countdown]");
  if (!output) return;

  const deadline = new Date(CONFIG.earlyBirdDeadline);

  function update() {
    const now = new Date();
    const diff = deadline - now;

    if (Number.isNaN(deadline.getTime())) {
      output.textContent = "Promoção válida até 20 de junho.";
      return;
    }

    if (diff <= 0) {
      output.textContent = "A data do Early Bird passou. Confirme a disponibilidade pelo WhatsApp.";
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    output.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s para garantir a promoção.`;
  }

  update();
  setInterval(update, 1000);
}

function initUtilityButtons() {
  $$('[data-confetti]').forEach((button) => {
    button.addEventListener("click", (event) => createConfetti(event.clientX, event.clientY, 52));
  });

  $("[data-scroll-top]")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
}

function initHeaderEffect() {
  const header = $(".site-header");
  if (!header) return;

  function update() {
    header.toggleAttribute("data-scrolled", window.scrollY > 24);
  }

  update();
  window.addEventListener("scroll", update, { passive: true });
}

initMobileNav();
initRevealAnimations();
initCursorSprinkles();
initCupcake();
initSprinkleGame();
initDialog();
initCardsAndPlanSelection();
initCountdown();
initUtilityButtons();
initHeaderEffect();
