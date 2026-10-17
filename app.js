/* ProteinKompass: statische App, alle Daten bleiben im Browser. */
const STORAGE_KEY = "protein-kompass-v1";
const sourceBls = "BLS 4.0 (MRI), typischer Wert je 100 g; gerundet";
const defaultRules = {
  ages: [
    { id: "10-12", label: "10–12 Jahre", min: 10, max: 12, factor: 0.9 },
    { id: "13-14", label: "13–14 Jahre", min: 13, max: 14, factor: 0.9 },
    { id: "15-19", label: "15–19 Jahre", min: 15, max: 19, factor: 0.9 }
  ],
  activities: [
    { id: "none", label: "Kein zusätzlicher Sport", factor: 0 },
    { id: "light", label: "Leicht · 1–2× pro Woche", factor: 0.05 },
    { id: "moderate", label: "Mittel · 3–4× pro Woche", factor: 0.10 },
    { id: "intense", label: "Intensiv · 5× oder mehr", factor: 0.20 }
  ]
};
/* diet = niedrigste Ernährungsform, für die der Eintrag geeignet ist. */
const defaultFoods = [
  {id:"egg",name:"Ei",protein:12.6,portion:60,unit:"piece",category:"Einzellebensmittel",diet:"vegetarian",source:sourceBls},
  {id:"milk",name:"Milch (1,5 % Fett)",protein:3.4,portion:250,unit:"portion",category:"Einzellebensmittel",diet:"vegetarian",source:sourceBls},
  {id:"skyr",name:"Skyr natur",protein:11,portion:150,unit:"portion",category:"Einzellebensmittel",diet:"vegetarian",source:sourceBls},
  {id:"quark",name:"Magerquark",protein:12,portion:250,unit:"portion",category:"Einzellebensmittel",diet:"vegetarian",source:sourceBls},
  {id:"cottage",name:"Hüttenkäse",protein:12.5,portion:200,unit:"portion",category:"Einzellebensmittel",diet:"vegetarian",source:sourceBls},
  {id:"oats",name:"Haferflocken",protein:13.5,portion:50,unit:"g",category:"Einzellebensmittel",diet:"vegan",source:sourceBls},
  {id:"rye",name:"Vollkornbrot",protein:8.5,portion:50,unit:"piece",category:"Einzellebensmittel",diet:"vegan",source:sourceBls},
  {id:"chicken",name:"Hähnchenbrust, gegart",protein:31,portion:150,unit:"g",category:"Einzellebensmittel",diet:"omnivore",source:sourceBls},
  {id:"salmon",name:"Lachs, gegart",protein:22,portion:150,unit:"g",category:"Einzellebensmittel",diet:"omnivore",source:sourceBls},
  {id:"tofu",name:"Naturtofu",protein:15,portion:180,unit:"g",category:"Einzellebensmittel",diet:"vegan",source:sourceBls},
  {id:"lentils",name:"Linsen, gekocht",protein:9,portion:200,unit:"g",category:"Einzellebensmittel",diet:"vegan",source:sourceBls},
  {id:"chickpeas",name:"Kichererbsen, gekocht",protein:8.9,portion:200,unit:"g",category:"Einzellebensmittel",diet:"vegan",source:sourceBls},
  {id:"beans",name:"Kidneybohnen, gekocht",protein:8.4,portion:200,unit:"g",category:"Einzellebensmittel",diet:"vegan",source:sourceBls},
  {id:"seitan",name:"Seitan",protein:25,portion:150,unit:"g",category:"Einzellebensmittel",diet:"vegan",source:sourceBls},
  {id:"chicken-bowl",name:"Hähnchen-Reis-Bowl",protein:10.5,portion:450,unit:"portion",category:"Gericht",diet:"omnivore",source:"Rezeptur-Schätzung: 150 g Hähnchen, Reis, Gemüse; Proteinwert je 100 g"},
  {id:"pasta-lentil",name:"Linsen-Bolognese mit Pasta",protein:6.2,portion:450,unit:"portion",category:"Gericht",diet:"vegan",source:"Rezeptur-Schätzung mit gekochten Linsen und Pasta; Proteinwert je 100 g"},
  {id:"tofu-curry",name:"Tofu-Gemüse-Curry",protein:6.8,portion:400,unit:"portion",category:"Gericht",diet:"vegan",source:"Rezeptur-Schätzung mit Naturtofu, Reis und Gemüse; Proteinwert je 100 g"},
  {id:"omelette",name:"Gemüse-Omelett",protein:10.7,portion:300,unit:"portion",category:"Gericht",diet:"vegetarian",source:"Rezeptur-Schätzung: Eier, Milchprodukt und Gemüse; Proteinwert je 100 g"}
];
let state = loadState();
let lastCalculation = null;
const dietRank = { omnivore: 0, vegetarian: 1, vegan: 2 };
const dietText = { omnivore: "Mischkost", vegetarian: "Vegetarisch", vegan: "Vegan" };
const $ = (selector) => document.querySelector(selector);
const round = (value, digits = 1) => Number(value.toFixed(digits));

function loadState() {
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (saved?.foods && saved?.rules) return saved; } catch (_) { /* Startwerte verwenden */ }
  return { foods: structuredClone(defaultFoods), rules: structuredClone(defaultRules) };
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function proteinFor(food, grams = food.portion) { return round(food.protein * grams / 100); }
function foodAllowed(food, diet) { return dietRank[food.diet] >= dietRank[diet]; }
function formatNumber(value) { return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value); }

function calculate(event) {
  event?.preventDefault();
  const age = Number($("#age").value), weight = Number($("#weight").value), diet = $("#diet").value, activity = $("#activity").value;
  const error = $("#form-error"); error.textContent = "";
  if (!Number.isFinite(age) || age < 10 || age > 19 || !Number.isFinite(weight) || weight < 25 || weight > 200) {
    error.textContent = "Bitte gib ein Alter von 10–19 Jahren und ein Gewicht von 25–200 kg ein."; return;
  }
  const ageRule = state.rules.ages.find(rule => age >= rule.min && age <= rule.max);
  const activityRule = state.rules.activities.find(rule => rule.id === activity);
  const base = round(weight * ageRule.factor); const sport = round(weight * activityRule.factor); const total = round(base + sport);
  lastCalculation = { age, weight, diet, activity, base, sport, total, ageRule, activityRule };
  $("#total-protein").textContent = formatNumber(total); $("#base-protein").textContent = `${formatNumber(base)} g`;
  $("#sport-protein").textContent = `${formatNumber(sport)} g`;
  $("#base-detail").textContent = `${formatNumber(ageRule.factor)} g/kg × ${formatNumber(weight)} kg`;
  $("#sport-detail").textContent = `${formatNumber(activityRule.factor)} g/kg × ${formatNumber(weight)} kg`;
  $("#result-summary").textContent = `${formatNumber(total / weight)} g Protein je kg Körpergewicht`;
  $("#formula").textContent = `Rechenweg: (${formatNumber(weight)} kg × ${formatNumber(ageRule.factor)} g/kg) + (${formatNumber(weight)} kg × ${formatNumber(activityRule.factor)} g/kg) = ${formatNumber(total)} g/Tag.`;
  $("#suggestion-diet-label").textContent = dietText[diet]; renderSuggestions();
}

function amountForTarget(food, target) {
  const perPortion = proteinFor(food);
  if (food.unit === "portion") { const count = Math.max(1, Math.ceil(target / perPortion)); return { amount: count, grams: count * food.portion, text: `${count} ${count === 1 ? "Portion" : "Portionen"}`, protein: round(count * perPortion) }; }
  if (food.unit === "piece") { const count = Math.max(1, Math.ceil(target / perPortion)); return { amount: count, grams: count * food.portion, text: `${count} ${count === 1 ? "Stück" : "Stück"}`, protein: round(count * perPortion) }; }
  const grams = Math.max(5, Math.ceil((target / food.protein * 100) / 5) * 5); return { amount: grams, grams, text: `${formatNumber(grams)} g`, protein: proteinFor(food, grams) };
}
function renderSuggestions() {
  const target = lastCalculation?.total; const holder = $("#suggestions");
  if (!target) { holder.innerHTML = '<p class="empty-state">Berechne zuerst deinen Bedarf.</p>'; return; }
  const allowed = state.foods.filter(food => foodAllowed(food, lastCalculation.diet));
  const picks = [
    allowed.filter(f => f.category === "Gericht").sort((a,b) => proteinFor(b)-proteinFor(a))[0],
    allowed.filter(f => f.category === "Einzellebensmittel" && f.unit === "portion").sort((a,b) => proteinFor(b)-proteinFor(a))[0],
    allowed.filter(f => f.category === "Einzellebensmittel" && f.unit !== "portion").sort((a,b) => b.protein-a.protein)[0]
  ].filter(Boolean);
  holder.innerHTML = picks.map(food => { const proposed = amountForTarget(food, target); return `<article class="suggestion-card"><span class="type">${escapeHtml(food.category)}</span><h3>${escapeHtml(food.name)}</h3><span class="amount">${proposed.text} · ${formatNumber(proposed.grams)} g insgesamt</span><strong class="protein">${formatNumber(proposed.protein)} g Protein</strong><small>${formatNumber(food.protein)} g je 100 g · ${escapeHtml(food.source)}</small></article>`; }).join("") || '<p class="empty-state">Für diese Auswahl gibt es noch keine passenden Einträge.</p>';
}
function escapeHtml(text) { return String(text).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c])); }

function renderFoods() {
  const query = $("#food-search").value.trim().toLowerCase(), diet = $("#database-diet-filter").value, category = $("#category-filter").value;
  const filtered = state.foods.filter(f => (!query || `${f.name} ${f.category}`.toLowerCase().includes(query)) && (diet === "all" || foodAllowed(f, diet)) && (category === "all" || f.category === category));
  $("#food-count").textContent = `${filtered.length} Einträge`;
  $("#food-list").innerHTML = filtered.map(foodRow).join("") || '<p class="empty-state">Keine passenden Einträge.</p>';
  $("#admin-food-list").innerHTML = state.foods.map(food => foodRow(food, true)).join("");
}
function foodRow(food, admin = false) {
  const servingLabel = food.unit === "piece" ? `${food.portion} g / Stück` : food.unit === "portion" ? `${food.portion} g / Portion` : `${food.portion} g Richtportion`;
  return `<article class="food-row"><div><h3>${escapeHtml(food.name)}</h3><p>${escapeHtml(food.source)}</p></div><div class="food-metric"><strong>${formatNumber(food.protein)} g</strong>je 100 g</div><div class="food-metric"><strong>${formatNumber(proteinFor(food))} g</strong>${servingLabel}</div><span class="diet-badge">${dietText[food.diet]}</span>${admin ? `<div class="row-actions"><button class="icon-button" data-edit="${escapeHtml(food.id)}" type="button">Bearbeiten</button><button class="icon-button delete-button" data-delete="${escapeHtml(food.id)}" type="button">Löschen</button></div>` : ""}</article>`;
}
function renderSettings() {
  $("#age-settings").innerHTML = state.rules.ages.map(rule => `<label class="setting-line"><span>${rule.label}</span><input data-age-rule="${rule.id}" type="number" min="0.1" max="3" step="0.01" value="${rule.factor}"><span class="sr-only">g/kg</span></label>`).join("");
  $("#activity-settings").innerHTML = state.rules.activities.map(rule => `<label class="setting-line"><span>${rule.label}</span><input data-activity-rule="${rule.id}" type="number" min="0" max="2" step="0.01" value="${rule.factor}"><span class="sr-only">g/kg</span></label>`).join("");
}
function submitFood(event) {
  event.preventDefault();
  const id = $("#food-id").value || `custom-${Date.now()}`;
  const record = { id, name: $("#food-name").value.trim(), protein: Number($("#food-protein").value), portion: Number($("#food-portion").value), unit: $("#food-unit").value, category: $("#food-category").value, diet: $("#food-diet").value, source: $("#food-source").value.trim() };
  if (!record.name || !Number.isFinite(record.protein) || record.protein <= 0 || !Number.isFinite(record.portion) || record.portion <= 0 || !record.source) return;
  const existing = state.foods.findIndex(f => f.id === id); if (existing >= 0) state.foods[existing] = record; else state.foods.push(record);
  saveState(); resetFoodForm(); renderFoods(); if (lastCalculation) renderSuggestions();
}
function editFood(id) { const food = state.foods.find(f => f.id === id); if (!food) return; $("#food-id").value=food.id; $("#food-name").value=food.name; $("#food-protein").value=food.protein; $("#food-portion").value=food.portion; $("#food-unit").value=food.unit; $("#food-category").value=food.category; $("#food-diet").value=food.diet; $("#food-source").value=food.source; $("#food-form-title").textContent=`„${food.name}“ bearbeiten`; $("#cancel-edit").hidden=false; $("#food-form").scrollIntoView({behavior:"smooth",block:"center"}); }
function resetFoodForm() { $("#food-form").reset(); $("#food-id").value=""; $("#food-form-title").textContent="Lebensmittel hinzufügen"; $("#cancel-edit").hidden=true; }
function deleteFood(id) { const food=state.foods.find(f=>f.id===id); if (!food || !confirm(`„${food.name}“ wirklich löschen?`)) return; state.foods=state.foods.filter(f=>f.id!==id); saveState(); renderFoods(); if(lastCalculation) renderSuggestions(); }
function submitRules(event) { event.preventDefault(); state.rules.ages.forEach(rule=>rule.factor=Number(document.querySelector(`[data-age-rule="${rule.id}"]`).value)); state.rules.activities.forEach(rule=>rule.factor=Number(document.querySelector(`[data-activity-rule="${rule.id}"]`).value)); if ([...state.rules.ages,...state.rules.activities].some(r=>!Number.isFinite(r.factor)||r.factor<0)) return; saveState(); if(lastCalculation) calculate(); }

document.querySelectorAll(".tab").forEach(button => button.addEventListener("click", () => { document.querySelectorAll(".tab,.tab-panel").forEach(el=>el.classList.remove("active")); button.classList.add("active"); $(`#${button.dataset.tab}`).classList.add("active"); }));
$("#calculator-form").addEventListener("submit", calculate); $("#food-form").addEventListener("submit", submitFood); $("#settings-form").addEventListener("submit", submitRules); $("#cancel-edit").addEventListener("click", resetFoodForm);
$("#reset-data").addEventListener("click", () => { if(confirm("Alle lokalen Änderungen zurücksetzen?")){ localStorage.removeItem(STORAGE_KEY); state=loadState(); resetFoodForm(); renderSettings(); renderFoods(); if(lastCalculation) calculate(); } });
$("#food-search").addEventListener("input", renderFoods); $("#database-diet-filter").addEventListener("change", renderFoods); $("#category-filter").addEventListener("change", renderFoods);
$("#admin-food-list").addEventListener("click", event => { const edit=event.target.dataset.edit, del=event.target.dataset.delete; if(edit) editFood(edit); if(del) deleteFood(del); });
renderSettings(); renderFoods(); calculate();
