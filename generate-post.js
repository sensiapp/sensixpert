#!/usr/bin/env node
/**
 * SensiXpert Blog - AI Post Generator
 * Kullanım: node generate-post.js "Konu veya anahtar kelime"
 *
 * Örnek: node generate-post.js "TECNO Spark 20 Free Fire hassasiyet ayarları"
 *        node generate-post.js "Free Fire 4 parmak claw nasıl oynanır"
 *        node generate-post.js "Samsung Galaxy A55 headshot kodu 2026"
 *
 * GEMINI_API_KEY env değişkenini set etmeyi unutma:
 *   Windows: set GEMINI_API_KEY=YOUR_KEY_HERE
 *   veya .env dosyasına GEMINI_API_KEY=YOUR_KEY_HERE yaz
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Built-in .env loader — no npm install needed
(function loadEnv() {
  const envFile = path.join(__dirname, '.env');
  if (!fs.existsSync(envFile)) return;
  fs.readFileSync(envFile, 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  });
})();

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL   = 'gemini-2.5-flash';
const POSTS_DIR      = path.join(__dirname, 'posts');
const INDEX_FILE     = path.join(__dirname, 'index.html');

// ─── TOPIC SUGGESTIONS (otomatik çalışma için) ────────────────────────────────
const AUTO_TOPICS = [
  'TECNO Spark 20 Free Fire hassasiyet ayarları 2026',
  'Free Fire 4 parmak claw nasıl oynanır? Tam rehber',
  'Huawei Free Fire hassasiyet ayarları 2026',
  'Free Fire headshot antrenman teknikleri',
  'OPPO A78 Free Fire DPI ve hassasiyet rehberi',
  'Vivo Y27 Free Fire hassasiyet ayarları',
  'Free Fire gyroscope (jiroskop) hassasiyet ayarı',
  'Realme C55 Free Fire optimizasyon rehberi',
  'Free Fire düşük FPS sorunu çözümü 2026',
  'Infinix Note 30 Free Fire hassasiyet ayarları',
  'Free Fire ateş düğmesi hassasiyeti nasıl ayarlanır?',
  'Honor 90 Free Fire DPI rehberi 2026',
  'Free Fire AWM sniper hassasiyet değerleri',
  'Samsung Galaxy A05s Free Fire ayarları',
  'Free Fire gece modu hassasiyet ipuçları',
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

function today() {
  return new Date().toLocaleDateString('tr-TR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function estimateReadTime(text) {
  const wordCount = text.split(/\s+/).length;
  return Math.max(3, Math.round(wordCount / 200));
}

// ─── GEMINI API CALL ──────────────────────────────────────────────────────────
function callGemini(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        topP: 0.9,
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(`Gemini API Hatası: ${parsed.error.message}`));
            return;
          }
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            reject(new Error('Gemini boş yanıt döndürdü. API key\'i kontrol et.'));
            return;
          }
          resolve(text);
        } catch (e) {
          reject(new Error(`JSON parse hatası: ${e.message}\nGelen yanıt: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── BUILD PROMPT ─────────────────────────────────────────────────────────────
function buildPrompt(topic) {
  return `Sen SensiXpert adli Free Fire hassasiyet uygulamasinin blog yazarisin. Asagidaki konu icin SEO optimize edilmis, Turkce bir blog yazisi yaz.

KONU: ${topic}

YAZMA KURALLARI:
1. Dil: Turkce, gunluk ama profesyonel ton
2. Uzunluk: 600-900 kelime
3. En az 4 bolum basligi kullan (## ile isaretlenecek)
4. En az 1 Markdown tablo ekle (| Sutun | Sutun | formatinda)
5. En az 2 ozel kutu ekle: [TIP], [INFO] veya [WARNING] ile baslayan satirlar
6. Makale sonunda "Sonuc" bolumu ekle
7. SensiXpert uygulamasindan dogal bicimde bahset
8. Somut sayi ver: hassasiyet degerleri, DPI degerleri vb.

CIKTI FORMATI - Bu formati AYNEN uygula, baska sey yazma:

---META---
BASLIK: ${topic.substring(0, 55)}
DESCRIPTION: ${topic} hakkinda kapsamli rehber. DPI ve hassasiyet ayarlari.
KEYWORDS: Free Fire hassasiyet, ${topic.split(' ').slice(0, 3).join(' ')}, DPI ayari 2026
EMOJI: 🎯
RENK1: #1a0808
RENK2: #0a0404
---ICERIK---
[Makale icerigini buraya yaz - Markdown formatinda]
---SON---`;
}

// ─── PARSE AI RESPONSE ────────────────────────────────────────────────────────
function parseResponse(text, topic) {
  const metaMatch = text.match(/---META---([\s\S]*?)---ICERIK---/);
  const contentMatch = text.match(/---ICERIK---([\s\S]*?)---SON---/);

  if (!metaMatch || !contentMatch) {
    return {
      title: topic || 'Free Fire Hassasiyet Rehberi 2026',
      description: (topic || 'Free Fire hassasiyet') + ' hakkinda kapsamli rehber.',
      keywords: 'Free Fire hassasiyet, headshot, DPI ayari 2026',
      emoji: '🎯',
      color1: '#1a0808',
      color2: '#0a0404',
      rawContent: text,
    };
  }

  const meta = metaMatch[1];
  const getField = (field) => {
    const m = meta.match(new RegExp(`${field}:\\s*(.+)`));
    return m ? m[1].trim() : '';
  };

  return {
    title: getField('BASLIK') || topic || 'Free Fire Hassasiyet Rehberi',
    description: getField('DESCRIPTION') || '',
    keywords: getField('KEYWORDS') || 'Free Fire hassasiyet',
    emoji: getField('EMOJI') || '🎯',
    color1: getField('RENK1') || '#1a0808',
    color2: getField('RENK2') || '#0a0404',
    rawContent: contentMatch[1].trim(),
  };
}

// ─── MARKDOWN → HTML ──────────────────────────────────────────────────────────
function markdownToHtml(md) {
  let html = md;

  // H2 başlıklar
  html = html.replace(/^## (.+)$/gm, (_, t) => {
    const id = slugify(t);
    return `<h2 id="${id}">${t}</h2>`;
  });

  // H3 başlıklar
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');

  // Callout kutuları
  html = html.replace(/^\[TIP\]\s*\*\*(.+?)\*\*\s*\n([\s\S]*?)(?=\n\n|\n\[|$)/gm, (_, title, content) => `
    <div class="callout callout-tip">
      <div class="callout-icon">💡</div>
      <div class="callout-body"><strong>${title}</strong><p>${content.trim()}</p></div>
    </div>`);

  html = html.replace(/^\[INFO\]\s*\*\*(.+?)\*\*\s*\n([\s\S]*?)(?=\n\n|\n\[|$)/gm, (_, title, content) => `
    <div class="callout callout-info">
      <div class="callout-icon">ℹ️</div>
      <div class="callout-body"><strong>${title}</strong><p>${content.trim()}</p></div>
    </div>`);

  html = html.replace(/^\[WARNING\]\s*\*\*(.+?)\*\*\s*\n([\s\S]*?)(?=\n\n|\n\[|$)/gm, (_, title, content) => `
    <div class="callout callout-warning">
      <div class="callout-icon">⚠️</div>
      <div class="callout-body"><strong>${title}</strong><p>${content.trim()}</p></div>
    </div>`);

  // Basit callout (başlıksız)
  html = html.replace(/^\[(TIP|INFO|WARNING)\]\s*(.+)$/gm, (_, type, content) => {
    const map = { TIP: ['callout-tip', '💡'], INFO: ['callout-info', 'ℹ️'], WARNING: ['callout-warning', '⚠️'] };
    const [cls, icon] = map[type];
    return `<div class="callout ${cls}"><div class="callout-icon">${icon}</div><div class="callout-body"><p>${content}</p></div></div>`;
  });

  // Markdown tablolar
  html = html.replace(/(\|.+\|\n\|[-| :]+\|\n(?:\|.+\|\n?)+)/g, (match) => {
    const rows = match.trim().split('\n');
    const header = rows[0].split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
    const body = rows.slice(2).map(row => {
      const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('\n');
    return `<table class="sens-table"><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
  });

  // Kalın metin
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // İtalik
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Sırasız liste
  html = html.replace(/((?:^- .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(l => `<li>${l.replace(/^- /, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });

  // Sıralı liste
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  // Paragraflar
  html = html.split('\n\n').map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('<')) return block;
    return `<p>${block}</p>`;
  }).join('\n');

  return html;
}

// ─── BUILD TOC ────────────────────────────────────────────────────────────────
function buildToc(html) {
  const headings = [];
  const regex = /<h2 id="([^"]+)">([^<]+)<\/h2>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    headings.push({ id: match[1], text: match[2] });
  }
  return headings.map(h => `<a class="toc-link" href="#${h.id}">${h.text}</a>`).join('\n');
}

// ─── RENDER FULL HTML PAGE ────────────────────────────────────────────────────
function renderPage(topic, parsed, articleHtml) {
  const toc = buildToc(articleHtml);
  const readTime = estimateReadTime(parsed.rawContent);
  const slug = slugify(parsed.title);
  const url = `https://sensixpert.com/blog/posts/${slug}.html`;

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${parsed.title} | SensiXpert Blog</title>
  <meta name="description" content="${parsed.description}">
  <meta name="keywords" content="${parsed.keywords}">
  <meta name="robots" content="index, follow">
  <meta name="author" content="SensiXpert">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${parsed.title}">
  <meta property="og:description" content="${parsed.description}">
  <meta property="og:image" content="../../web/icons/Icon-512.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../style.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${parsed.title.replace(/"/g, '\\"')}",
    "description": "${parsed.description.replace(/"/g, '\\"')}",
    "author": { "@type": "Organization", "name": "SensiXpert" },
    "publisher": { "@type": "Organization", "name": "SensiXpert" },
    "datePublished": "${todayISO()}",
    "dateModified": "${todayISO()}",
    "url": "${url}"
  }
  </script>
</head>
<body>

<nav>
  <a class="nav-brand" href="../index.html"><span class="dot"></span>SensiXpert</a>
  <div class="nav-links">
    <a href="../index.html">Blog</a>
    <a href="https://sensixpert.com" class="nav-cta">Uygulamayı İndir</a>
  </div>
</nav>

<section class="article-hero">
  <div class="container">
    <div class="breadcrumb">
      <a href="../index.html">Blog</a><span>›</span><span>Rehberler</span>
    </div>
    <h1>${parsed.title}</h1>
    <div class="meta">
      <span>📅 ${today()}</span>
      <span>⏱ ${readTime} dk okuma</span>
      <span class="author">✍ SensiXpert AI</span>
      <span>🤖 Yapay Zeka İçeriği</span>
    </div>
  </div>
</section>

<div class="article-layout">
  <article class="article-content">
    ${articleHtml}

    <div class="cta-block">
      <h3>${parsed.emoji} Cihazına Özel Hassasiyet Al</h3>
      <p>SensiXpert uygulaması telefon modelini otomatik algılar ve sana özel hassasiyet değerlerini hesaplar.</p>
      <a class="cta-btn" href="https://sensixpert.com">Uygulamayı Ücretsiz İndir</a>
    </div>
  </article>

  <aside class="sidebar">
    <div class="sidebar-card">
      <h4>📑 İçindekiler</h4>
      ${toc || '<a class="toc-link" href="#">Başa Dön</a>'}
    </div>
    <div class="sidebar-card">
      <h4>📚 İlgili Yazılar</h4>
      <a class="sidebar-link" href="hassasiyet-ayari-nasil-yapilir.html">Hassasiyet Rehberi</a>
      <a class="sidebar-link" href="dpi-nedir-oyunu-nasil-etkiler.html">DPI Nedir?</a>
      <a class="sidebar-link" href="free-fire-en-iyi-hassasiyet-kodlari-2026.html">Hassasiyet Kodları</a>
      <a class="sidebar-link" href="samsung-free-fire-dpi-ayarlari.html">Samsung DPI</a>
    </div>
    <div class="sidebar-card" style="background:linear-gradient(135deg,#1a0808,#130820);border-color:var(--accent);">
      <h4>🚀 SensiXpert App</h4>
      <p style="font-size:13px;color:var(--text2);margin-bottom:12px;">Cihazına özel otomatik hassasiyet hesaplama.</p>
      <a href="https://sensixpert.com" class="cta-btn" style="display:block;text-align:center;font-size:13px;">İndir</a>
    </div>
  </aside>
</div>

<footer>
  <strong>SensiXpert Blog</strong> — Free Fire Hassasiyet Rehberleri<br>
  <span style="margin-top:8px;display:inline-block;">© 2026 SensiXpert · <a href="../index.html">← Blog'a Dön</a></span>
</footer>
</body>
</html>`;
}

// ─── UPDATE INDEX.HTML ────────────────────────────────────────────────────────
function updateIndex(slug, parsed, readTime) {
  if (!fs.existsSync(INDEX_FILE)) return;

  const indexHtml = fs.readFileSync(INDEX_FILE, 'utf-8');
  const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const newCard = `
    <a class="post-card" href="posts/${slug}.html" data-tags="${parsed.keywords.toLowerCase()}">
      <div class="post-card-thumb" style="background:linear-gradient(135deg,${parsed.color2 || '#1a0808'},${parsed.color1 || '#0a0404'})">${parsed.emoji}</div>
      <div class="post-card-body">
        <div class="post-card-tags">
          <span class="tag">🤖 AI</span>
          <span class="tag">Yeni</span>
        </div>
        <h3>${parsed.title}</h3>
        <p>${parsed.description}</p>
        <div class="post-card-meta">
          <span>📅 ${today} · ${readTime} dk okuma</span>
          <span class="read-more">Oku →</span>
        </div>
      </div>
    </a>`;

  // Yeni kartı ikinci posts-grid'e (Rehberler bölümüne) ekle
  const updatedIndex = indexHtml.replace(
    /(<div class="posts-grid">(?![\s\S]*<div class="posts-grid">))/,
    `$1\n${newCard}`
  );

  fs.writeFileSync(INDEX_FILE, updatedIndex, 'utf-8');
  console.log('✅ index.html güncellendi — yeni kart eklendi.');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  // API key kontrolü
  if (!GEMINI_API_KEY) {
    console.error(`
❌ HATA: GEMINI_API_KEY bulunamadı!

Çözüm:
1. blog/.env dosyası oluştur ve şunu yaz:
   GEMINI_API_KEY=buraya_api_keyini_yaz

2. Ücretsiz Gemini API key almak için:
   https://aistudio.google.com/app/apikey
`);
    process.exit(1);
  }

  // Konu belirleme
  let topic = process.argv[2];
  const autoMode = process.argv.includes('--auto');

  if (autoMode || !topic) {
    // Otomatik: Daha önce yazılmamış bir konu seç
    const existingSlugs = fs.readdirSync(POSTS_DIR)
      .filter(f => f.endsWith('.html'))
      .map(f => f.replace('.html', ''));

    const unused = AUTO_TOPICS.filter(t => !existingSlugs.includes(slugify(t)));
    if (unused.length === 0) {
      console.log('Tüm hazır konular yazıldı. Yeni konular eklemek için AUTO_TOPICS listesini genişlet.');
      process.exit(0);
    }
    topic = unused[Math.floor(Math.random() * unused.length)];
    console.log(`🤖 Otomatik konu seçildi: "${topic}"`);
  }

  console.log(`\n📝 Blog yazısı oluşturuluyor: "${topic}"\n`);
  console.log('🌐 Gemini API ile bağlantı kuruluyor...');

  let aiResponse;
  try {
    aiResponse = await callGemini(buildPrompt(topic));
  } catch (err) {
    console.error('❌ Gemini API hatası:', err.message);
    process.exit(1);
  }

  console.log('✅ AI yanıtı alındı. HTML oluşturuluyor...');

  const parsed = parseResponse(aiResponse, topic);
  const articleHtml = markdownToHtml(parsed.rawContent);
  const readTime = estimateReadTime(parsed.rawContent);
  const slug = slugify(parsed.title);
  const outputPath = path.join(POSTS_DIR, `${slug}.html`);

  // Aynı slug varsa üzerine yazma
  if (fs.existsSync(outputPath)) {
    const ts = Date.now();
    const newSlug = `${slug}-${ts}`;
    const newPath = path.join(POSTS_DIR, `${newSlug}.html`);
    console.log(`⚠️  "${slug}.html" zaten mevcut. "${newSlug}.html" olarak kaydediliyor.`);
    fs.writeFileSync(newPath, renderPage(topic, parsed, articleHtml), 'utf-8');
    updateIndex(newSlug, parsed, readTime);
    console.log(`\n✅ Yazı oluşturuldu: blog/posts/${newSlug}.html`);
  } else {
    fs.writeFileSync(outputPath, renderPage(topic, parsed, articleHtml), 'utf-8');
    updateIndex(slug, parsed, readTime);
    console.log(`\n✅ Yazı oluşturuldu: blog/posts/${slug}.html`);
  }

  console.log(`📊 Başlık    : ${parsed.title}`);
  console.log(`📝 Açıklama  : ${parsed.description}`);
  console.log(`🔑 Keywords  : ${parsed.keywords}`);
  console.log(`⏱  Okuma     : ~${readTime} dakika\n`);
  console.log("Blog'u yerel olarak test etmek icin:");
  console.log('  npx serve . -p 3000   (blog klasöründe çalıştır)\n');
}

main().catch(err => {
  console.error('Beklenmeyen hata:', err);
  process.exit(1);
});
