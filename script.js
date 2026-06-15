/* =========================================================
   قفّاز · Quffaz — interactions & media rendering
   ========================================================= */

/* ---- Google Drive media (replace IDs later if needed) ---- */
const IMG_IDS = [
  "17uRfuU9D7ZM4zWqo3b9t5u6KBJsItRb_",
  "14zp3QNHa_ObxTJfIofyPyqfzh-Aum1tG",
  "142SeMsEnpPyoNtucsSAwhLtYBZ38o9bm",
  "1jmHhhtGw6MWyX2A9nymN8w0K0FI4KJZS",
  "1uh6mABucf_ZJmLy29iCJEH2POHRVsv4D",
  "1IDlNk_-eAF_PaiydDAovwr0DnbfT5NUG",
  "1VRDBefgd8ibgVXTngCsQPpCUIH9IcOER",
  "1_GpEhl8wgLP33sjZyltkYNvxKHAIcmIp",
  "1OohQKS4qSUZfdUkWirWdrnhfIkEZtq7V",
  "166qNurql8VVVQD9Nl7G_k_6__0JAkKko",
  "1l8s3Pq2yCGODET2lGoPM0LF4wvVQ-xjZ",
  "1Iee4aJ4tpgtE_3CRY-bAXtIOb1WGRn_a",
  "1hGw11wBQghsLxwHqqHfLlvLhK-bLBeyS",
  "1se1g1YutCsoKbMm0q_fChiGsK0WJSdGX"
];
const VIDEO_IDS = [
  "14zpiizgvRZmzwU5Eo_l_RE5givmHI3ph",
  "1wTORQKa_vDFSGAK6KAmlzOeGnzXID7PV",
  "1fxAvD-PmKJ8OyP0u2qsZ-R_R84qwrVjx",
  "11TsYmsOg-Ir5YXsznHsqfxcRyMpQbWYx"
];

const imgUrl   = id => `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
const thumbUrl = id => `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
const altUrl   = id => `https://lh3.googleusercontent.com/d/${id}=w1600`; // fallback host
const embedUrl = id => `https://drive.google.com/file/d/${id}/preview`;

const img  = i => IMG_IDS[i % IMG_IDS.length];
const vid  = i => VIDEO_IDS[i % VIDEO_IDS.length];

/* graceful fallback gradients when Drive blocks hotlinking */
const FALLBACKS = [
  "linear-gradient(135deg,#2a1410,#0e0e12)",
  "linear-gradient(135deg,#221a10,#0e0e12)",
  "linear-gradient(135deg,#101820,#0e0e12)",
  "linear-gradient(135deg,#1c1320,#0e0e12)",
  "linear-gradient(135deg,#101c16,#0e0e12)"
];
function withFallback(el, idx){
  el.dataset.try = "0";
  el.addEventListener("error", () => {
    const id = el.dataset.gid;
    const step = +el.dataset.try;
    if (step === 0 && id){                 // first failure → try alternate Drive host
      el.dataset.try = "1";
      el.src = altUrl(id);
      return;
    }
    const host = el.closest(".work-card,.pf-card,figure") || el.parentElement;
    if (host) host.style.background = FALLBACKS[idx % FALLBACKS.length];
    el.style.visibility = "hidden";
  });
}

/* ---------- icons ---------- */
const ICON = {
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  expand:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>'
};

/* =========================================================
   HOME — visual production reel (4 categories × 4 videos)
   ========================================================= */
const REEL = [
  { key:"ad",    cat:"إعلانات تجارية", titles:["رائحة المكان","قيادة الطموح","نكهة الديار","بريق العود"] },
  { key:"doc",   cat:"أفلام وثائقية",  titles:["بين الأيدي","ألوان الصحراء","صيّادو البحر الأحمر","إرث البنيان"] },
  { key:"event", cat:"معارض وفعاليات", titles:["موسم الرياض","ليالي التأسيس","قمة المستقبل","نبض الحدث"] },
  { key:"occ",   cat:"مناسبات خاصة",   titles:["ليلة العمر","فرحٌ وذكرى","لمسة وفاء","ضيافة الكرام"] }
];

function renderReel(){
  const grid = document.getElementById("worksGrid");
  if (!grid) return;
  let html = "", n = 0;
  REEL.forEach((group, g) => {
    group.titles.forEach((title, t) => {
      const vId = vid(n);
      html += `
        <article class="work-card reveal" data-cat="${group.key}" data-video="${vId}" tabindex="0" role="button" aria-label="تشغيل ${title}">
          <img src="${thumbUrl(vId)}" alt="${title}" loading="lazy" data-gid="${vId}" data-fb="${n}">
          <span class="play-badge">${ICON.play}</span>
          <div class="work-meta">
            <span class="cat">${group.cat}</span>
            <h4>${title}</h4>
          </div>
        </article>`;
      n++;
    });
  });
  grid.innerHTML = html;
  grid.querySelectorAll("img[data-fb]").forEach(el => withFallback(el, +el.dataset.fb));
}

/* filters for the reel */
function initReelFilters(){
  const btns = document.querySelectorAll("#worksFilters .filter-btn");
  if (!btns.length) return;
  btns.forEach(btn => btn.addEventListener("click", () => {
    btns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;
    document.querySelectorAll("#worksGrid .work-card").forEach(c => {
      const show = f === "all" || c.dataset.cat === f;
      c.style.display = show ? "" : "none";
    });
  }));
}

/* =========================================================
   HOME — photo gallery (masonry, 14 images repeated)
   ========================================================= */
function renderPhotos(){
  const m = document.getElementById("photoMasonry");
  if (!m) return;
  const order = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,2,5];
  m.innerHTML = order.map((i, k) => `
    <figure data-img="${img(i)}" tabindex="0" role="button" aria-label="عرض الصورة">
      <img src="${imgUrl(img(i))}" alt="من أعمال قفّاز" loading="lazy" data-gid="${img(i)}" data-fb="${k}">
      <span class="ph-ico">${ICON.expand}</span>
    </figure>`).join("");
  m.querySelectorAll("img[data-fb]").forEach(el => withFallback(el, +el.dataset.fb));
}

/* =========================================================
   PORTFOLIO PAGE — works grid
   ========================================================= */
const PORTFOLIO = [
  { t:"بين الأيدي",        type:"فيلم وثائقي · وزارة الثقافة",   dur:"٤٢ دقيقة", cat:"doc",   badge:"وثائقي",   b:"b-doc",  id:"bayn-alaydi", client:"وزارة الثقافة", desc:"وثائقيٌّ يرصد الحِرف اليدوية السعودية بين أنامل صنّاعها، ويوثّق إرثاً يُنقل من جيلٍ إلى جيل." },
  { t:"ألوان الصحراء",     type:"فيلم وثائقي · أرامكو السعودية",  dur:"٢٨ دقيقة", cat:"doc",   badge:"وثائقي",   b:"b-doc",  wide:true, id:"alwan-alsahra", client:"أرامكو السعودية", desc:"رحلةٌ بصرية في تضاريس الجزيرة وألوانها، تُبرز التنوّع الطبيعي بعينٍ سينمائية متأنّية." },
  { t:"أفق",               type:"فيلم قصير · إنتاج مستقل",        dur:"١٨ دقيقة", cat:"short", badge:"فيلم قصير", b:"b-short", id:"ufuq", client:"إنتاج مستقل", desc:"فيلمٌ قصير يتأمّل الحلم والمسافة، بلغةٍ بصرية شاعرية ومونتاجٍ هادئ." },
  { t:"رؤية تتشكّل",       type:"فيلم مؤسسي · نيوم",             dur:"٦ دقائق",  cat:"corp",  badge:"شركات",    b:"b-corp", id:"ruya", client:"نيوم", desc:"فيلمٌ مؤسسي يحكي تحوّل الرؤية إلى عمران، عبر تصويرٍ معماري وجوّي يُبرز ضخامة المشروع." },
  { t:"رائحة المكان",      type:"إعلان تجاري · دار العود",        dur:"٦٠ ثانية", cat:"ad",    badge:"إعلان",    b:"b-ad",   id:"raehat-almakan", client:"دار العود", desc:"إعلانٌ حسّي يترجم عبق العود إلى صورة، بإضاءةٍ دافئة وإيقاعٍ أنيق." },
  { t:"صيّادو البحر الأحمر", type:"فيلم وثائقي · وزارة البيئة",   dur:"٣٥ دقيقة", cat:"doc",   badge:"وثائقي",   b:"b-doc",  id:"sayyadu", client:"وزارة البيئة", desc:"وثائقيٌّ يلازم صيّادي البحر الأحمر في يومهم، ويكشف علاقتهم العميقة بالماء." },
  { t:"موسم الرياض",       type:"تغطية فعالية · هيئة الترفيه",    dur:"١٢ دقيقة", cat:"event", badge:"فعالية",   b:"b-event", id:"mawsim", client:"هيئة الترفيه", desc:"تغطيةٌ شاملة لأجواء الموسم وزخمه، بكاميراتٍ متعددة تنقل نبض الحدث لحظةً بلحظة." },
  { t:"مائدة",             type:"إعلان تجاري · مطاعم الحضراء",    dur:"٤٥ ثانية", cat:"ad",    badge:"إعلان",    b:"b-ad",   id:"maeda", client:"مطاعم الحضراء", desc:"إعلانٌ يقدّم الطبق كقطعةٍ فنية، بتصويرٍ قريب يُشهّي ويُبهر." },
  { t:"أرض وماء",          type:"فيلم قصير · مهرجان أفلام السعودية", dur:"٢٢ دقيقة", cat:"short", badge:"فيلم قصير", b:"b-short", id:"ard-wama", client:"مهرجان أفلام السعودية", desc:"فيلمٌ قصير عن التشبّث بالأرض والحنين للماء، شارك في مهرجان أفلام السعودية." },
  { t:"إرث البنيان",       type:"فيلم مؤسسي · بنك الرياض",       dur:"٤ دقائق",  cat:"corp",  badge:"شركات",    b:"b-corp", id:"irth", client:"بنك الرياض", desc:"فيلمٌ مؤسسي يوثّق العمارة الداخلية لفروع المصرفية الخاصة، بعينٍ تُبرز فخامة التفاصيل." },
  { t:"قيادة الطموح",      type:"إعلان تجاري · تويوتا السعودية",  dur:"٩٠ ثانية", cat:"ad",    badge:"إعلان",    b:"b-ad",   id:"qiyada", client:"تويوتا السعودية", desc:"إعلانٌ يقرن الطموح بالطريق، بتصويرٍ ديناميكي ومعالجةٍ لونية حيّة." },
  { t:"التقنية تتكلم",     type:"فيلم مؤسسي · STC",              dur:"٥ دقائق",  cat:"corp",  badge:"شركات",    b:"b-corp", wide:true, id:"taqniya", client:"STC", desc:"فيلمٌ مؤسسي يجسّد حضور التقنية في الحياة اليومية، بأسلوبٍ سرديّ معاصر." }
];

/* وسوم العمل حسب التصنيف (تُعرض في صفحة التفاصيل) */
const WD_TAGS = {
  doc:   ["تصوير وثائقي","مونتاج","تعليق صوتي","تلوين"],
  ad:    ["إخراج إعلاني","تصوير","موشن جرافيك","معالجة لونية"],
  corp:  ["فيلم مؤسسي","تصوير معماري","تصوير جوي","معالجة رقمية"],
  short: ["إخراج","سيناريو","تصوير سينمائي","مونتاج"],
  event: ["تغطية حدث","تعدد كاميرات","بثّ مباشر","مونتاج سريع"]
};

function renderPortfolio(){
  const grid = document.getElementById("pfGrid");
  if (!grid) return;
  grid.innerHTML = PORTFOLIO.map((p, i) => {
    return `
      <a class="pf-card${p.wide ? " wide" : ""} reveal" href="work.html?id=${p.id}" data-cat="${p.cat}" aria-label="عرض تفاصيل ${p.t}">
        <img src="${imgUrl(img(i))}" alt="${p.t}" loading="lazy" data-gid="${img(i)}" data-fb="${i}">
        <span class="pf-badge ${p.b}">${p.badge}</span>
        <span class="pf-play">${ICON.play}</span>
        <div class="pf-info">
          <div class="pf-type">${p.type}</div>
          <h3>${p.t}</h3>
          <div class="pf-dur">${p.dur}</div>
        </div>
      </a>`;
  }).join("");
  grid.querySelectorAll("img[data-fb]").forEach(el => withFallback(el, +el.dataset.fb));
  const count = document.getElementById("pfCount");
  if (count) count.textContent = `${PORTFOLIO.length} عمل`;
}

function initPortfolioFilters(){
  const btns = document.querySelectorAll("#pfFilters .filter-btn");
  if (!btns.length) return;
  btns.forEach(btn => btn.addEventListener("click", () => {
    btns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;
    let shown = 0;
    document.querySelectorAll("#pfGrid .pf-card").forEach(c => {
      const ok = f === "all" || c.dataset.cat === f;
      c.style.display = ok ? "" : "none";
      if (ok) shown++;
    });
    const count = document.getElementById("pfCount");
    if (count) count.textContent = `${shown} عمل`;
  }));
}

/* =========================================================
   WORK DETAIL PAGE (work.html?id=...) — info + media grid
   ========================================================= */
function renderWorkDetail(){
  const gal = document.getElementById("wdGallery");
  if (!gal) return;                                  // not on the work page
  const id = new URLSearchParams(location.search).get("id");
  const n  = Math.max(0, PORTFOLIO.findIndex(p => p.id === id));
  const w  = PORTFOLIO[n] || PORTFOLIO[0];

  /* title + client */
  const titleEl = document.getElementById("wdTitle");
  if (titleEl) titleEl.innerHTML = `${w.t}<span class="wd-client"> | ${w.client}</span>`;
  const descEl = document.getElementById("wdDesc");
  if (descEl) descEl.textContent = w.desc;
  document.title = `${w.t} · قفّاز`;

  /* index number (01, 02, …) */
  const numEl = document.getElementById("wdNum");
  if (numEl) numEl.textContent = String(n + 1).padStart(2, "0");

  /* client logo with text fallback */
  const logo = document.getElementById("wdLogo");
  if (logo){
    const im = new Image();
    im.src = `assets/logos/${w.id}.svg`;
    im.alt = w.client;
    im.onerror = () => { logo.classList.add("is-text"); logo.textContent = w.client; };
    logo.innerHTML = "";
    logo.appendChild(im);
  }

  /* tags */
  const tagsEl = document.getElementById("wdTags");
  if (tagsEl) tagsEl.innerHTML = (WD_TAGS[w.cat] || []).map(t => `<span>${t}</span>`).join("");

  /* media: one video + five images (replace later with the real set) */
  const media = [{ kind:"video", id:vid(n) }];
  for (let k = 0; k < 5; k++) media.push({ kind:"img", id:img(n + k * 2) });

  gal.innerHTML = media.map((m, k) => {
    if (m.kind === "video"){
      return `
        <article class="wd-item" data-video="${m.id}" tabindex="0" role="button" aria-label="تشغيل الفيديو">
          <img src="${thumbUrl(m.id)}" alt="${w.t}" loading="lazy" data-gid="${m.id}" data-fb="${k}">
          <span class="play-badge">${ICON.play}</span>
        </article>`;
    }
    return `
      <figure class="wd-item" data-img="${m.id}" tabindex="0" role="button" aria-label="عرض الصورة">
        <img src="${imgUrl(m.id)}" alt="${w.t}" loading="lazy" data-gid="${m.id}" data-fb="${k}">
        <span class="wd-ico">${ICON.expand}</span>
      </figure>`;
  }).join("");
  gal.querySelectorAll("img[data-fb]").forEach(el => withFallback(el, +el.dataset.fb));
}

/* =========================================================
   LIGHTBOX (video iframe + image)
   ========================================================= */
function initLightbox(){
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  const inner = lb.querySelector(".lb-inner");
  const closeBtn = lb.querySelector(".lb-close");
  let lastFocus = null;

  const open = node => {
    lastFocus = document.activeElement;
    const vId = node.dataset.video;
    const imgId = node.dataset.img;
    inner.classList.toggle("video", !!vId);
    if (vId){
      inner.querySelector(".lb-body").innerHTML =
        `<iframe src="${embedUrl(vId)}" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="مشغّل الفيديو"></iframe>`;
    } else if (imgId){
      inner.querySelector(".lb-body").innerHTML =
        `<img src="${imgUrl(imgId)}" alt="عرض الصورة">`;
    }
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  };
  const close = () => {
    lb.classList.remove("open");
    inner.querySelector(".lb-body").innerHTML = "";
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };

  document.addEventListener("click", e => {
    const card = e.target.closest("[data-video],[data-img]");
    if (card && !e.target.closest(".lightbox")) open(card);
  });
  document.addEventListener("keydown", e => {
    const card = e.target.closest && e.target.closest("[data-video],[data-img]");
    if (card && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); open(card); }
    if (e.key === "Escape" && lb.classList.contains("open")) close();
  });
  closeBtn.addEventListener("click", close);
  lb.addEventListener("click", e => { if (e.target === lb) close(); });
}

/* =========================================================
   HEADER / NAV / REVEAL / FORM
   ========================================================= */
function initHeader(){
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive:true });

  const burger = document.querySelector(".burger");
  const body = document.body;
  if (burger){
    burger.addEventListener("click", () => body.classList.toggle("nav-open"));
    document.querySelectorAll(".nav-links a").forEach(a =>
      a.addEventListener("click", () => body.classList.remove("nav-open")));
  }
}

function initReveal(){
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)){ els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en, i) => {
      if (en.isIntersecting){
        setTimeout(() => en.target.classList.add("in"), (i % 4) * 70);
        io.unobserve(en.target);
      }
    });
  }, { threshold:.12, rootMargin:"0px 0px -8% 0px" });
  els.forEach(e => io.observe(e));
}

function initForm(){
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const note = document.getElementById("formNote");
    note.classList.add("show");
    note.textContent = "تم استلام طلبك — سنعاود التواصل معك قريباً.";
    form.reset();
    setTimeout(() => note.classList.remove("show"), 6000);
  });
}

/* waveform bars builder */
function buildWaveforms(){
  document.querySelectorAll(".waveform").forEach(w => {
    let bars = "";
    for (let i = 0; i < 34; i++){
      const d = (Math.random() * 1.1).toFixed(2);
      bars += `<i style="animation-delay:${d}s"></i>`;
    }
    w.innerHTML = bars;
  });
}

function initPhotoBgParallax(){
  if(window.innerWidth > 900) return;
  const sections = document.querySelectorAll('.mob-bg-section');
  if(!sections.length) return;
  let ticking = false;
  const run = () => {
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      const progress = -rect.top / (window.innerHeight + sec.offsetHeight);
      const shift = progress * 60; // px shift — subtle
      sec.style.setProperty('--mob-parallax', shift + 'px');
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if(!ticking){ requestAnimationFrame(run); ticking=true; }
  }, {passive:true});
  window.addEventListener('resize', () => {
    if(window.innerWidth > 900){
      sections.forEach(s => s.style.removeProperty('--mob-parallax'));
    } else run();
  });
  run();
}
document.addEventListener("DOMContentLoaded", () => {
  renderReel();
  initReelFilters();
  renderPhotos();
  renderPortfolio();
  initPortfolioFilters();
  renderWorkDetail();
  initLightbox();
  initHeader();
  initForm();
  buildWaveforms();
  initReveal();
  initPhotoBgParallax();
});
