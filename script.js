// --- Loader overlay for Aksharamukha warmup ---
function showGlobalLoader() {
  let loader = document.getElementById('global-aksharamukha-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'global-aksharamukha-loader';
    loader.style.position = 'fixed';
    loader.style.top = 0;
    loader.style.left = 0;
    loader.style.width = '100vw';
    loader.style.height = '100vh';
    loader.style.background = 'rgba(255,255,255,0.85)';
    loader.style.zIndex = 99999;
    loader.style.display = 'flex';
    loader.style.alignItems = 'center';
    loader.style.justifyContent = 'center';
    loader.innerHTML = '<div class="loader" style="width:48px;height:48px;border-width:6px;"></div>';
    document.body.appendChild(loader);
  }
  loader.style.display = 'flex';
}
function hideGlobalLoader() {
  const loader = document.getElementById('global-aksharamukha-loader');
  if (loader) loader.style.display = 'none';
}

showGlobalLoader();
// Warm up Aksharamukha API at startup, show loader until done
(async function warmupAksharamukha() {
  let supported = true;
  try {
    let tries = 0;
    while (typeof window.Aksharamukha === 'undefined' && tries < 100) {
      await new Promise(r => setTimeout(r, 50));
      tries++;
    }
    if (typeof window.Aksharamukha !== 'undefined') {
      try {
        window.aksharamukhaInstance = await window.Aksharamukha.new();
        window.aksharamukhaReady = true;
        const output = await window.aksharamukhaInstance.process('autodetect', 'Devanagari', 'aniruddha');
        console.log('Aksharamukha warmup:', output);
      } catch (err) {
        supported = false;
      }
    } else {
      supported = false;
    }
  } catch (e) {
    supported = false;
  }
  hideGlobalLoader();
})();

const toggleWord = document.getElementById("toggleWord");
const textboxLabel = document.getElementById("textboxLabel");
const lakaraSection = document.getElementById("lakaraSection");
const shabdTypeSection = document.getElementById("shabdTypeSection");
const scrollToTopButton = document.getElementById("top-button");
let dhatuValidated = false;

window.addEventListener('scroll', function() {
  if (window.pageYOffset > 100) {
    scrollToTopButton.style.display = 'block';
  } else {
    scrollToTopButton.style.display = 'none';
  }
});

toggleWord.addEventListener("change", () => {
  if (toggleWord.checked) {
    textboxLabel.textContent = "शब्द का मूल रूप";
    lakaraSection.classList.add("hidden");
    shabdTypeSection.classList.remove("hidden");
  } else {
    textboxLabel.textContent = "धातु का मूल रूप";
    lakaraSection.classList.remove("hidden");
    shabdTypeSection.classList.add("hidden");
  }
});

async function openTable() {
  const rootInput = document.getElementById("rootWord");
  let word = rootInput.value.trim();
  if (!word) return alert("कृपया शब्द/धातु दर्ज करें");

  // Loader logic
  let showTableBtn = document.querySelector('button.normal-button');
  let translitBtn = document.getElementById('transliterateBtn');
  let loader = document.querySelector('.loader-aksharamukha');
  if (!loader) {
    loader = document.createElement('div');
    loader.className = 'loader loader-aksharamukha';
    loader.style.display = 'none';
    if (showTableBtn) showTableBtn.parentNode.insertBefore(loader, showTableBtn.nextSibling);
  }

  // Only transliterate if not already Devanagari
  if (!(/[\u0900-\u097F]/.test(word))) {
    if (showTableBtn) showTableBtn.disabled = true;
    if (translitBtn) translitBtn.disabled = true;
    loader.style.display = 'inline-block';
    try {
      while (!window.aksharamukhaReady) await new Promise(r => setTimeout(r, 30));
      const output = await window.aksharamukhaInstance.process('autodetect', 'Devanagari', word);
      rootInput.value = output;
      word = output;
    } catch (err) {
      
    }
    loader.style.display = 'none';
    if (showTableBtn) showTableBtn.disabled = false;
    if (translitBtn) translitBtn.disabled = false;
  }
// Ensure transliterate button uses the same Aksharamukha instance
window.addEventListener('DOMContentLoaded', () => {
  const rootInput = document.getElementById('rootWord');
  const translitBtn = document.getElementById('transliterateBtn');
  const showTableBtn = document.querySelector('button.normal-button');
  let loader = document.querySelector('.loader-aksharamukha');
  if (!loader) {
    loader = document.createElement('div');
    loader.className = 'loader loader-aksharamukha';
    loader.style.display = 'none';
    if (showTableBtn) showTableBtn.parentNode.insertBefore(loader, showTableBtn.nextSibling);
  }
  if (translitBtn) {
    translitBtn.addEventListener('click', async () => {
      const val = rootInput.value;
      if (!val.trim() || /[\u0900-\u097F]/.test(val)) return;
      translitBtn.disabled = true;
      if (showTableBtn) showTableBtn.disabled = true;
      loader.style.display = 'inline-block';
      translitBtn.textContent = '...';
      try {
        while (!window.aksharamukhaReady) await new Promise(r => setTimeout(r, 30));
        const output = await window.aksharamukhaInstance.process('autodetect', 'Devanagari', val);
        rootInput.value = output;
      } catch (err) {
        // Fallback: do nothing
      }
      loader.style.display = 'none';
      translitBtn.disabled = false;
      if (showTableBtn) showTableBtn.disabled = false;
      translitBtn.textContent = 'लिप्यंतरण';
    });
  }
});

  word = word.replace(/ /g, "_");

  const isShabd = toggleWord.checked;
  const tableContainer = document.getElementById("tableResult");
  tableContainer.innerHTML = "";

  function renderTableFromDiv(tableDiv, meta, tableContainer, sourceUrl, isPredicted = false) {
    if (meta) {
      const h = document.createElement("h3");
      if (meta.type === "shabd") {
        h.textContent = `${meta.word.replace(/_/g, " ")}`;
      }
      if (meta.type === "dhatu") {
        h.textContent = `${meta.dhatu.replace(/_/g, " ")} — ${meta.lakara}`;
      }
      tableContainer.appendChild(h);
    }
    const table = document.createElement("table");
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);
    let sambodhanRow = null;
    const rows = [];
    tableDiv.querySelectorAll(":scope > div").forEach(rowDiv => {
      const tr = document.createElement("tr");
      Array.from(rowDiv.children).forEach(cell => {
        const td = document.createElement("td");
        td.textContent = cell.textContent.trim().replace(/_/g, " ");
        tr.appendChild(td);
      });
      if (tr.firstChild && tr.firstChild.textContent.includes('संबोधन')) {
        Array.from(tr.children).forEach((td, index) => {
          if (index > 0) {
            const text = td.textContent.trim();
            if (text) {
              td.textContent = `हे ${text}!`;
            }
          }
        });
        sambodhanRow = tr;
      } else {
        rows.push(tr);
      }
    });
    rows.forEach(tr => tbody.appendChild(tr));
    if (sambodhanRow) {
      tbody.appendChild(sambodhanRow);
    }
    tableContainer.appendChild(table);
    const sourceLink = document.createElement("a");
    sourceLink.href = sourceUrl;
    sourceLink.target = "_blank";
    sourceLink.textContent = "🔗 मूल साइट पर देखें";
    sourceLink.className = "source-link";
    tableContainer.appendChild(sourceLink);

    if (isPredicted) {
      const warn = document.createElement("div");
      warn.innerHTML = '⚠️ Predicted by <a href="https://sanskritabhyas.in/en" target="_blank">SanskritAbhyas</a>';
      warn.style.color = "orange";
      warn.style.marginTop = "8px";
      tableContainer.appendChild(warn);
    }
  }

  const fetchTable = async (url, meta = null, silentFail = false) => {
    const loader = document.createElement("div");
    loader.className = "loader";
    tableContainer.appendChild(loader);

    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      const data = await res.json();
      const doc = new DOMParser().parseFromString(data.contents, "text/html");
      const tableDiv = doc.querySelector(isShabd ? "#divFullAnswer" : ".divFullAnswerxs.col-12.d-lg-none");

      loader.remove();

      if (!tableDiv) {
        // Try prediction endpoint for shabd roop (noun/pronoun)
        if (isShabd) {
          try {
            const predUrl = `https://sanskritabhyas.in/hi/Noun/Prediction/${word}`;
            const proxyPredUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(predUrl)}`;
            const predRes = await fetch(proxyPredUrl);
            const predData = await predRes.json();
            const predDoc = new DOMParser().parseFromString(predData.contents, "text/html");
            const predTableDiv = predDoc.querySelector("#divFullAnswer");
            if (predTableDiv) {
              renderTableFromDiv(predTableDiv, meta, tableContainer, predUrl, true); // pass true for isPredicted
              return;
            }
          } catch (e) {
            // ignore and show not found below
          }
        }
        const p = document.createElement("p");
        p.textContent = "कोई तालिका नहीं मिली";
        tableContainer.appendChild(p);
        return;
      }

      renderTableFromDiv(tableDiv, meta, tableContainer, url);

    } catch (err) {
      loader.remove();

      if (!dhatuValidated && !silentFail) {
        const p = document.createElement("p");
        p.style.color = "red";
        p.textContent = "❌ डेटा प्राप्त करने में त्रुटि";
        tableContainer.appendChild(p);

        const sourceLink = document.createElement("a");
        sourceLink.href = url;
        sourceLink.target = "_blank";
        sourceLink.textContent = "🔗 मूल साइट पर देखें";
        sourceLink.className = "source-link";
        tableContainer.appendChild(sourceLink);
        console.error(err);
      }
    }
  };

  if (isShabd) {
    const shabdType = document.getElementById("shabdType").value;
    const url = shabdType === "noun"
      ? `https://sanskritabhyas.in/hi/Noun/View/${word}`
      : `https://sanskritabhyas.in/hi/Pronoun/View/${word}`;
    await fetchTable(url, {
      type: "shabd",
      word,
      shabdType
    });
  } else {
    const lakaraSelect = document.getElementById("lakara").value;
    if (lakaraSelect === "All Class 9 & 10 NCERT") {
      const mainLakara = "लट्";
      const otherLakara = ["लृट्", "लङ्", "लोट्", "विधिलिङ्"];
    
      tableContainer.innerHTML = "";
    
      let latDone = false;
      while (!latDone) {
        const before = tableContainer.children.length;
    
        await fetchTable(
          `https://sanskritabhyas.in/hi/Verb/View/${word}/All/${mainLakara}`,
          {
            type: "dhatu",
            dhatu: word,
            lakara: mainLakara
          }
        );

    
        const after = tableContainer.children.length;
        latDone = after > before;
        
        if (latDone) {
          dhatuValidated = true;
        }
      }
    
      for (const l of otherLakara) {
        let done = false;
    
        while (!done) {
          const before = tableContainer.children.length;
    
          await fetchTable(
            `https://sanskritabhyas.in/hi/Verb/View/${word}/All/${l}`,
            {
              type: "dhatu",
              dhatu: word,
              lakara: l
            },
            true
          );
    
          const after = tableContainer.children.length;
          done = after > before;
        }
      }
    } else {
      const l = lakaraSelect.split(" ")[0];
      const url = `https://sanskritabhyas.in/hi/Verb/View/${word}/All/${l}`;
      await fetchTable(url, {
        type: "dhatu",
        dhatu: word,
        lakara: l
      });
    }
  }
}
