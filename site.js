(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // 手機版場次選單
  const side = $("#side"), btn = $("#menuBtn");
  if (btn) btn.onclick = () => { const o = side.classList.toggle("open"); btn.setAttribute("aria-expanded", o); };

  // 修正詞：點一下顯示逐字稿原文
  document.addEventListener("click", e => {
    const fx = e.target.closest(".fix"); if (fx) { fx.classList.toggle("show"); return; }
    const b = e.target.closest("[data-lb]"); if (!b) return;
    $("#lbImg").src = b.dataset.lb; $("#lbImg").alt = b.dataset.cap; $("#lbCap").textContent = b.dataset.cap; $("#lb").showModal();
  });
  const lb = $("#lb"); if (lb) lb.addEventListener("click", e => { if (e.target.id !== "lbImg") lb.close(); });

  // 回到頂部
  const tt = $("#totop"); if (tt) { addEventListener("scroll", () => tt.classList.toggle("show", scrollY > 600), { passive: true }); tt.onclick = () => scrollTo({ top: 0 }); }

  // 逐字稿內搜尋
  document.querySelectorAll("[data-filter]").forEach(inp => {
    const g = inp.dataset.filter, cnt = document.querySelector(`[data-count="${g}"]`), rows = [...inp.closest(".tx-body").querySelectorAll(".para")];
    inp.oninput = () => { const v = inp.value.trim().toLowerCase(); let k = 0;
      rows.forEach(r => { const hit = v && r.dataset.t.toLowerCase().includes(v); r.classList.toggle("hit", !!hit); r.style.display = (!v || hit) ? "" : "none"; if (hit) k++; });
      cnt.textContent = v ? `${k} 段符合` : ""; };
  });

  // 段落連結：打開逐字稿並標示該段
  function jump() {
    const id = decodeURIComponent(location.hash.slice(1)); if (!id) return;
    const el = document.getElementById(id); if (!el) return;
    const d = el.closest("details"); if (d) d.open = true;
    document.querySelectorAll(".para.target").forEach(x => x.classList.remove("target"));
    if (el.classList.contains("para")) el.classList.add("target");
    setTimeout(() => el.scrollIntoView({ block: el.classList.contains("para") ? "center" : "start" }), 30);
  }
  addEventListener("hashchange", jump); jump();

  // 搜尋頁
  if (window.TSIC_INDEX) {
    const q = (new URLSearchParams(location.search).get("q") || "").trim();
    const input = document.querySelector('.search input'); if (input) input.value = q;
    if (q) {
      const k = q.toLowerCase(), hits = [];
      for (const it of window.TSIC_INDEX) { const i = it.text.toLowerCase().indexOf(k); if (i < 0) continue;
        const a = Math.max(0, i - 40); hits.push({ ...it, html: esc((a ? "…" : "") + it.text.slice(a, i)) + "<mark>" + esc(it.text.substr(i, q.length)) + "</mark>" + esc(it.text.slice(i + q.length, i + q.length + 60)) + "…" }); }
      $("#sq").textContent = `「${q}」`;
      $("#results").innerHTML = `<p class="src">${hits.length} 筆結果，含講者、公司、講題、摘要與逐字稿全文。原始逐字稿為自動轉寫，專有名詞可能被辨識成其他字。</p>` +
        (hits.length ? `<ul class="res">${hits.slice(0, 300).map(h => `<li><div class="w">${esc(h.t)} · ${esc(h.w)} · ${esc(h.where)}</div><a href="${esc(h.href)}">${esc(h.title)}</a><div class="s">${h.html}</div></li>`).join("")}</ul>` : `<div class="empty">找不到符合的內容。可以試試公司英文名、講者姓名，或較短的關鍵字。</div>`);
    }
  }
})();
