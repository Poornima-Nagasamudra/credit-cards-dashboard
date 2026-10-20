console.log("hello world")(() => {
  "use strict";

  const globalSearch = document.querySelector("#globalSearch");
  const cardGrid = document.querySelector("#creditCardGrid");
  const cardList = document.querySelector("#cardList");
  const cardsEmpty = document.querySelector("#cardsEmpty");
  const listEmpty = document.querySelector("#listEmpty");
  const addCardForm = document.querySelector("#addCardForm");
  const formMessage = document.querySelector("#formMessage");
  const settingsMessage = document.querySelector("#settingsMessage");
  const detailsModal = document.querySelector("#detailsModal");
  const detailsContent = document.querySelector("#detailsContent");
  const toast = document.querySelector("#toast");
  const sidebar = document.querySelector("#sidebar");
  const menuToggle = document.querySelector("#menuToggle");
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.textContent = "";
    }, 3200);
  }

  function filterCards() {
    const query = globalSearch.value.trim().toLowerCase();
    let visiblePreviewCards = 0;
    let visibleListCards = 0;

    cardGrid.querySelectorAll(".credit-card").forEach((card) => {
      const matches =
        !query ||
        `${card.dataset.search} ${card.textContent}`
          .toLowerCase()
          .includes(query);
      card.hidden = !matches;
      if (matches) visiblePreviewCards += 1;
    });

    cardList.querySelectorAll(".bank-card-row").forEach((card) => {
      const matches =
        !query ||
        `${card.dataset.search} ${card.textContent}`
          .toLowerCase()
          .includes(query);
      card.hidden = !matches;
      if (matches) visibleListCards += 1;
    });

    cardsEmpty.hidden = visiblePreviewCards > 0;
    listEmpty.hidden = visibleListCards > 0;
  }

  globalSearch.addEventListener("input", filterCards);

  document.querySelector("#showAllCards").addEventListener("click", () => {
    globalSearch.value = "";
    filterCards();
    showToast("Showing all available cards.");
  });

  function openDetails(data) {
    const [bank, type, number, name] = data.split("|");
    const details = [
      ["Bank", bank],
      ["Card type", type],
      ["Card number", number],
      ["Card holder", name],
    ];
    detailsContent.replaceChildren();
    details.forEach(([label, value]) => {
      const wrapper = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = label;
      dd.textContent = value;
      wrapper.append(dt, dd);
      detailsContent.append(wrapper);
    });
    detailsModal.hidden = false;
    document.querySelector("#closeModal").focus();
  }

  cardList.addEventListener("click", (event) => {
    const button = event.target.closest(".details-button");
    if (button) openDetails(button.dataset.card);
  });

  function closeDetails() {
    detailsModal.hidden = true;
  }
  document.querySelector("#closeModal").addEventListener("click", closeDetails);
  document.querySelector("#doneModal").addEventListener("click", closeDetails);
  detailsModal.addEventListener("click", (event) => {
    if (event.target === detailsModal) closeDetails();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !detailsModal.hidden) closeDetails();
  });

  const cardNumberInput = document.querySelector("#cardNumber");
  cardNumberInput.addEventListener("input", () => {
    const digits = cardNumberInput.value.replace(/\D/g, "").slice(0, 16);
    cardNumberInput.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  });

  addCardForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formMessage.textContent = "";

    const name = document.querySelector("#cardName").value.trim();
    const digits = cardNumberInput.value.replace(/\D/g, "");
    const expiry = document.querySelector("#expiryDate").value;
    const cardType = document.querySelector("#cardType").value;

    if (name.length < 2) {
      formMessage.textContent =
        "Please enter the name that should appear on the card.";
      document.querySelector("#cardName").focus();
      return;
    }
    if (!/^\d{16}$/.test(digits)) {
      formMessage.textContent = "Please enter a valid 16-digit card number.";
      cardNumberInput.focus();
      return;
    }
    if (!expiry) {
      formMessage.textContent = "Please select an expiration date.";
      document.querySelector("#expiryDate").focus();
      return;
    }
    const [year, month] = expiry.split("-").map(Number);
    const selectedExpiry = new Date(year, month - 1, 1);
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    if (selectedExpiry < currentMonth) {
      formMessage.textContent =
        "The expiration date must be this month or later.";
      document.querySelector("#expiryDate").focus();
      return;
    }

    const lastFour = digits.slice(-4);
    const card = document.createElement("article");
    card.className = "credit-card card-blue";
    card.dataset.search = `${name} ${lastFour} ${cardType}`.toLowerCase();

    const top = document.createElement("div");
    top.className = "credit-card-top";
    const balance = document.createElement("div");
    const balanceLabel = document.createElement("span");
    balanceLabel.className = "card-label";
    balanceLabel.textContent = "Balance";
    const balanceValue = document.createElement("strong");
    balanceValue.className = "card-balance";
    balanceValue.textContent = "$0.00";
    balance.append(balanceLabel, balanceValue);
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.setAttribute("aria-hidden", "true");
    chip.textContent = "▦";
    top.append(balance, chip);

    const meta = document.createElement("div");
    meta.className = "card-meta";
    const holder = document.createElement("div");
    const holderLabel = document.createElement("span");
    holderLabel.className = "card-label";
    holderLabel.textContent = "CARD HOLDER";
    const holderValue = document.createElement("strong");
    holderValue.textContent = name;
    holder.append(holderLabel, holderValue);
    const valid = document.createElement("div");
    const validLabel = document.createElement("span");
    validLabel.className = "card-label";
    validLabel.textContent = "VALID THRU";
    const validValue = document.createElement("strong");
    validValue.textContent = `${month.toString().padStart(2, "0")}/${String(year).slice(-2)}`;
    valid.append(validLabel, validValue);
    meta.append(holder, valid);

    const numberRow = document.createElement("div");
    numberRow.className = "card-number-row";
    numberRow.append(document.createTextNode(`••••  ••••  ••••  ${lastFour}`));
    const network = document.createElement("span");
    network.className = "mastercard";
    network.setAttribute("aria-label", "Card network");
    network.innerHTML = "<i></i><b></b>";
    numberRow.append(network);
    card.append(top, meta, numberRow);
    cardGrid.append(card);

    const row = document.createElement("article");
    row.className = "bank-card-row";
    row.dataset.search =
      `${name} ${lastFour} ${cardType} personal`.toLowerCase();
    const icon = document.createElement("span");
    icon.className = "bank-icon bank-blue";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "▣";
    row.append(icon);
    [
      ["Card Type", cardType],
      ["Bank", "Personal"],
      ["Card Number", `**** **** ${lastFour}`],
      ["Card Holder", name],
    ].forEach(([label, value]) => {
      const field = document.createElement("div");
      field.className = "bank-field";
      const fieldLabel = document.createElement("span");
      const fieldValue = document.createElement("strong");
      fieldLabel.textContent = label;
      fieldValue.textContent = value;
      field.append(fieldLabel, fieldValue);
      row.append(field);
    });
    const detailsButton = document.createElement("button");
    detailsButton.className = "details-button";
    detailsButton.type = "button";
    detailsButton.textContent = "View Details";
    detailsButton.dataset.card = `Personal|${cardType}|**** **** ${lastFour}|${name}`;
    row.append(detailsButton);
    cardList.append(row);

    addCardForm.reset();
    formMessage.style.color = "#16835d";
    formMessage.textContent = "Card added successfully (demo only).";
    filterCards();
    showToast("Your new card was added to this demo.");
  });

  document.querySelectorAll(".setting-item").forEach((button) => {
    button.addEventListener("click", () => {
      const setting = button.dataset.setting;
      settingsMessage.textContent = `${setting}: ${button.dataset.description}`;
      showToast(`${setting} selected.`);
    });
  });

  menuToggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Toggle navigation",
    );
  });

  document.addEventListener("click", (event) => {
    if (
      window.matchMedia("(max-width: 52rem)").matches &&
      sidebar.classList.contains("is-open") &&
      !sidebar.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      sidebar.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
})();
