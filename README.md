# SensiXpert Blog

Free Fire hassasiyet rehberleri + **Yapay Zeka ile otomatik blog yazısı üretici**.

## 📁 Dosya Yapısı

```
blog/
├── index.html                          ← Blog ana sayfası
├── style.css                           ← Ortak stiller
├── generate-post.js                    ← AI yazı üretici (Node.js)
├── .env.example                        ← API key şablonu
├── .env                                ← API key (kendi oluşturursun, git'e ekleme!)
└── posts/
    ├── hassasiyet-ayari-nasil-yapilir.html
    ├── iphone-free-fire-headshot-ayarlari-2026.html
    ├── samsung-free-fire-dpi-ayarlari.html
    ├── redmi-note-12-free-fire-hassasiyet.html
    ├── dpi-nedir-oyunu-nasil-etkiler.html
    ├── free-fire-en-iyi-hassasiyet-kodlari-2026.html
    └── free-fire-guncelleme-sonrasi-en-iyi-ayarlar.html
```

---

## 🚀 Kurulum (1 Adım)

### 1. Gemini API Key Al (Ücretsiz)
→ https://aistudio.google.com/app/apikey  
Sayfaya gir, "Create API Key" butonuna tıkla, kopyala.

### 2. `.env` Dosyası Oluştur
```
blog/ klasöründe .env dosyası oluştur ve şunu yaz:
GEMINI_API_KEY=buraya_api_keyini_yaz
```

> Node.js 18+ kurulu olmalı. Kontrol: `node --version`

---

## ✍️ Kullanım

### Manuel Konu ile Yazı Yaz
```powershell
# blog/ klasöründeyken:
node generate-post.js "TECNO Spark 20 Free Fire hassasiyet ayarları"
node generate-post.js "Free Fire 4 parmak claw rehberi"
node generate-post.js "Huawei Free Fire DPI ayarı 2026"
```

### Otomatik Konu Seçimi
```powershell
node generate-post.js --auto
```
Script `AUTO_TOPICS` listesinden henüz yazılmamış bir konu seçer ve yazar.

### Haftada 3 Yazı (Haftalık Rutin)
```powershell
node generate-post.js --auto
node generate-post.js --auto
node generate-post.js --auto
```

---

## ⏱ Windows Görev Zamanlayıcı ile Otomatik Çalıştırma

Her Pazartesi sabahı otomatik yazı oluşturmak için:

1. **Görev Zamanlayıcı** aç (Başlat → Görev Zamanlayıcı)
2. **Eylem** → Temel Görev Oluştur
3. **Tetikleyici:** Haftalık → Pazartesi → 08:00
4. **Eylem:** Program başlat  
   - Program: `node`  
   - Bağımsız Değişkenler: `generate-post.js --auto`  
   - Başlangıç Klasörü: `C:\Users\tret\Desktop\devami_app\devami_app\blog`

---

## 🌐 Yerel Test

```powershell
# blog/ klasöründe:
npx serve . -p 3000
# Tarayıcıda aç: http://localhost:3000
```

---

## 🔑 Hedef Anahtar Kelimeler

Blog şu uzun kuyruklu kelimeleri hedefliyor:

| Anahtar Kelime | Sayfa |
|---|---|
| Free Fire hassasiyet ayarları 2026 | index.html |
| iPhone Free Fire headshot ayarları | iphone-free-fire-headshot-ayarlari-2026.html |
| Samsung Free Fire DPI ayarları | samsung-free-fire-dpi-ayarlari.html |
| Redmi Note 12 Free Fire hassasiyet | redmi-note-12-free-fire-hassasiyet.html |
| DPI nedir oyunu nasıl etkiler | dpi-nedir-oyunu-nasil-etkiler.html |
| En iyi Free Fire hassasiyet kodları 2026 | free-fire-en-iyi-hassasiyet-kodlari-2026.html |
| Free Fire güncelleme sonrası ayarlar | free-fire-guncelleme-sonrasi-en-iyi-ayarlar.html |

---

## 📊 SEO Kontrol Listesi

Her yazı şunları içeriyor:
- [x] `<title>` — anahtar kelime ile (maks 60 karakter)
- [x] `<meta name="description">` (maks 155 karakter)
- [x] `<meta name="keywords">`
- [x] `<link rel="canonical">`
- [x] Open Graph meta tags
- [x] Twitter Card meta tags
- [x] JSON-LD structured data (Article schema)
- [x] H1 → H2 → H3 başlık hiyerarşisi
- [x] İç bağlantılar (ilgili yazılara)
- [x] CTA blokları (uygulama indirme)
