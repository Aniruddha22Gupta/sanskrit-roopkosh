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
  const word = document.getElementById("rootWord").value.trim();
  if (!word) return alert("कृपया शब्द/धातु दर्ज करें");

  const isShabd = toggleWord.checked;
  const tableContainer = document.getElementById("tableResult");
  tableContainer.innerHTML = "";

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
        const p = document.createElement("p");
        p.textContent = "कोई तालिका नहीं मिली";
        tableContainer.appendChild(p);
        return;
      }

      if (meta) {
        const h = document.createElement("h3");
      
        if (meta.type === "shabd") {
          h.textContent = `${meta.word}`;
        }
      
        if (meta.type === "dhatu") {
          h.textContent = `${meta.dhatu} — ${meta.lakara}`;
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
          td.textContent = cell.textContent.trim();
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
      sourceLink.href = url;
      sourceLink.target = "_blank";
      sourceLink.textContent = "🔗 मूल साइट पर देखें";
      sourceLink.className = "source-link";
      tableContainer.appendChild(sourceLink);

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
