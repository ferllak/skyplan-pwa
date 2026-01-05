const params = new URLSearchParams(window.location.search);
const city = params.get("city");
const district = params.get("district");
const latParam = params.get("lat");
const lonParam = params.get("lon");

const titleEl = document.getElementById("detailTitle");
const descEl = document.getElementById("detailDesc");
const statusEl = document.getElementById("status");
const weatherList = document.getElementById("weatherList");
const shareBtn = document.getElementById("shareBtn");

// İkon Seti
function getWeatherIcon(code) {
    if (code === 0) return "☀️";
    if (code >= 1 && code <= 3) return "⛅";
    if (code >= 45 && code <= 48) return "🌫️";
    if (code >= 51 && code <= 67) return "🌧️";
    if (code >= 71 && code <= 77) return "❄️";
    if (code >= 80 && code <= 82) return "⛈️";
    if (code >= 95) return "⚡";
    return "🌡️";
}

// ✨ YENİ: Hava Durumuna Göre Etkinlik Tavsiyesi
function getEventAdvice(code, tempMax) {
    if (code >= 95) return { text: "⚠️ Riskli! Açık hava etkinliği planlamayın.", color: "text-danger" };
    if (code >= 51 || code >= 80) return { text: "☔ Yağmur riski. Çadır veya kapalı alan şart.", color: "text-warning" };
    if (code >= 71) return { text: "❄️ Kar yağışlı. Isıtma sistemlerini kontrol edin.", color: "text-info" };
    if (tempMax > 35) return { text: "🔥 Aşırı sıcak. Soğutma ve gölgelik alan sağlayın.", color: "text-danger" };
    if (code === 0 || code === 1) return { text: "✅ Mükemmel! Açık hava düğün/konser için uygun.", color: "text-success" };
    return { text: "☁️ Standart koşullar. Önlem alarak plan yapılabilir.", color: "text-primary" };
}

const coords = {
    "İstanbul": [41.01, 28.97],
    "Ankara": [39.93, 32.85],
    "İzmir": [38.42, 27.14]
};

let targetLat, targetLon, displayTitle;

if (city && latParam && lonParam) {
    targetLat = latParam;
    targetLon = lonParam;
    displayTitle = city;
    descEl.innerText = "Şehir merkezi için etkinlik uygunluk raporu";
} else if (city && district && coords[city]) {
    targetLat = coords[city][0];
    targetLon = coords[city][1];
    displayTitle = `${city} / ${district}`;
    descEl.innerText = "Seçilen konum için etkinlik uygunluk raporu";
} else {
    titleEl.innerText = "Hata";
    statusEl.innerHTML = `<div class="alert alert-danger">Eksik parametre. <a href="index.html">Geri dön</a></div>`;
    shareBtn.style.display = "none";
    throw new Error("Parametre Hatası");
}

titleEl.innerText = displayTitle;
fetchWeather(targetLat, targetLon);

shareBtn.addEventListener("click", () => {
    if (navigator.share) {
        navigator.share({
            title: `SkyPlan: ${displayTitle}`,
            text: `${displayTitle} etkinlik hava raporunu incele!`,
            url: window.location.href
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Bağlantı kopyalandı!");
    }
});

function fetchWeather(lat, lon) {
    statusEl.innerHTML = '<div class="spinner-border text-primary" role="status"></div> Rapor hazırlanıyor...';
    weatherList.innerHTML = "";

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

    fetch(url)
        .then(res => { if (!res.ok) throw new Error("API"); return res.json(); })
        .then(data => {
            statusEl.innerText = "";
            data.daily.time.forEach((day, i) => {
                const dateStr = new Date(day).toLocaleDateString("tr-TR", { weekday: 'long', day: 'numeric', month: 'short' });
                const code = data.daily.weathercode[i];
                const maxTemp = data.daily.temperature_2m_max[i];
                const icon = getWeatherIcon(code);

                // Tavsiyeyi al
                const advice = getEventAdvice(code, maxTemp);

                weatherList.innerHTML += `
                    <div class="col-md-6 col-lg-4">
                        <div class="card shadow-sm h-100 border-0">
                            <div class="card-body text-center">
                                <h5 class="text-muted mb-3 border-bottom pb-2">${dateStr}</h5>
                                <div class="d-flex justify-content-center align-items-center gap-3 mb-3">
                                    <div class="display-4">${icon}</div>
                                    <div class="text-start">
                                        <div class="fs-4 fw-bold text-dark">${maxTemp}°C</div>
                                        <div class="text-muted small">Min: ${data.daily.temperature_2m_min[i]}°C</div>
                                    </div>
                                </div>
                                <div class="alert alert-light border ${advice.color} fw-bold small mb-0">
                                    ${advice.text}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        })
        .catch((err) => {
            console.error(err);
            statusEl.innerHTML = `
                <div class="alert alert-danger">
                    Rapor alınamadı.
                    <button onclick="location.reload()" class="btn btn-sm btn-outline-danger ms-2">Tekrar Dene</button>
                </div>`;
        });
}