const WEBHOOK = "https://discord.com/api/webhooks/1505318315524882564/_r2IpoHMAl-AuG02qMR5I49s_kX0jX3KEjREhUJ0te-Z_QPYy8j9oXjgpfdrgm5t8L3-";
const ROLE_ID = "1502066402545238077";
const WHITELIST_IP = "";

// PROGRESS BAR
function updateProgress(step) {
  const bar = document.getElementById("progressBar");
  const l1  = document.getElementById("labelStep1");
  const l2  = document.getElementById("labelStep2");
  if (step === 1) {
    bar.style.width = "50%";
    l1.classList.add("active");
    l2.classList.remove("active");
  } else {
    bar.style.width = "100%";
    l1.classList.remove("active");
    l2.classList.add("active");
  }
}

// STEP NAVIGATION
function nextStep() {
  document.getElementById("step1").style.display = "none";
  const s2 = document.getElementById("step2");
  s2.style.display = "block";
  s2.style.animation = "none";
  requestAnimationFrame(() => { s2.style.animation = ""; });
  updateProgress(2);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function prevStep() {
  document.getElementById("step2").style.display = "none";
  const s1 = document.getElementById("step1");
  s1.style.display = "block";
  s1.style.animation = "none";
  requestAnimationFrame(() => { s1.style.animation = ""; });
  updateProgress(1);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// GET IP
async function getIP() {
  try {
    return await fetch("https://api.ipify.org").then(r => r.text());
  } catch { return "unknown"; }
}

// SEND FORM
async function sendForm() {
  const statusEl = document.getElementById("status");
  const sendBtn  = document.querySelector(".btn-send");

  statusEl.innerHTML = "⏳ Envoi en cours…";
  sendBtn.disabled = true;

  const ip = await getIP();

  // 24H CHECK
  if (ip !== WHITELIST_IP) {
    const last = localStorage.getItem("lastSubmit");
    if (last && Date.now() - Number(last) < 86400000) {
      statusEl.innerHTML = "⛔ Vous devez attendre 24h avant de refaire une candidature.";
      sendBtn.disabled = false;
      return;
    }
  }

  const posteFinal =
    document.getElementById("poste").value === "Autre" &&
    document.getElementById("autrePoste").value.trim() !== ""
      ? document.getElementById("autrePoste").value
      : document.getElementById("poste").value;

  const data = {
    irl:        document.getElementById("irl").value,
    discord:    document.getElementById("discord").value,
    discordId:  document.getElementById("discordId").value,
    prenom:     document.getElementById("prenom").value,
    age:        document.getElementById("age").value,
    dispos:     document.getElementById("dispos").value,
    poste:      posteFinal,
    motivations:document.getElementById("motivations").value,
    why:        document.getElementById("why").value,
    qualites:   document.getElementById("qualites").value,
    definition: document.getElementById("definition").value,
    experience: document.getElementById("experience").value,
    extra:      document.getElementById("extra").value
  };

  const payload = {
    content: `<@&${ROLE_ID}>`,
    embeds: [{
      title: "📥 Nouvelle Candidature Staff",
      color: 0xe879a6,
      description: `Une nouvelle candidature vient d'être envoyée pour le poste **${data.poste}**.`,
      fields: [
        { name: "👤 Pseudo Discord",       value: data.discord   || "Non renseigné", inline: true },
        { name: "🆔 ID Discord",            value: data.discordId || "Non renseigné", inline: true },
        { name: "📌 Poste demandé",         value: data.poste     || "Non renseigné", inline: true },
        {
          name: "📄 Présentation IRL",
          value: `**Prénom :** ${data.prenom}\n**Âge :** ${data.age}\n\n**Présentation :**\n${data.irl || "Non renseignée"}`
        },
        { name: "🕒 Disponibilités",                      value: data.dispos      || "Non renseigné" },
        { name: "🔥 Motivations",                          value: data.motivations || "Non renseigné" },
        { name: "❓ Pourquoi lui ?",                       value: data.why         || "Non renseigné" },
        { name: "⭐ Qualités",                              value: data.qualites    || "Non renseigné" },
        { name: "🛡 Définition Modérateur / CM",           value: data.definition  || "Non renseigné" },
        { name: "📚 Expérience",                           value: data.experience  || "Aucune" },
        { name: "➕ Informations supplémentaires",         value: data.extra       || "Aucune" }
      ],
      footer: { text: "💼 Système de candidature — ViceNew" },
      timestamp: new Date().toISOString()
    }]
  };

  try {
    await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (ip !== WHITELIST_IP) {
      localStorage.setItem("lastSubmit", Date.now());
    }

    statusEl.innerHTML = "✅ Candidature envoyée avec succès !";
    setTimeout(() => location.reload(), 2000);
  } catch (e) {
    statusEl.innerHTML = "❌ Une erreur est survenue. Réessaie.";
    sendBtn.disabled = false;
  }
}

// TOGGLE AUTRE POSTE
function toggleAutrePoste() {
  const select = document.getElementById("poste");
  const box    = document.getElementById("autrePosteBox");
  if (!select || !box) return;
  box.style.display = select.value === "Autre" ? "flex" : "none";
}
