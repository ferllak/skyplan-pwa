const cityList = document.getElementById("cityList");
const statusText = document.getElementById("status");
const searchInput = document.getElementById("searchInput");
const locateBtn = document.getElementById("locateBtn"); // Yeni buton
const favoritesSection = document.getElementById("favoritesSection");
const favoritesList = document.getElementById("favoritesList");

let favorites = JSON.parse(localStorage.getItem("skyplan_favs")) || [];

// Hava Durumu İkon Seti
function getWeatherIcon(code) {
    if (code === 0) return "☀️"; // Açık
    if (code >= 1 && code <= 3) return "⛅"; // Parçalı Bulutlu
    if (code >= 45 && code <= 48) return "🌫️"; // Sisli
    if (code >= 51 && code <= 67) return "🌧️"; // Yağmurlu
    if (code >= 71 && code <= 77) return "❄️"; // Karlı
    if (code >= 80 && code <= 82) return "⛈️"; // Sağanak
    if (code >= 95) return "⚡"; // Fırtına
    return "🌡️"; // Bilinmeyen
}

document.addEventListener("DOMContentLoaded", () => {
    renderFavorites();
    // Varsayılan vitrin
    const featured = turkeyData.filter(c => ["İstanbul", "Ankara", "İzmir"].includes(c.name));
    fetchWeatherForList(featured, cityList);
});

// Arama
searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLocaleLowerCase("tr");
    if (term.length === 0) {
        const featured = turkeyData.filter(c => ["İstanbul", "Ankara", "İzmir"].includes(c.name));
        fetchWeatherForList(featured, cityList);
        return;
    }
    const filtered = turkeyData.filter(city => city.name.toLocaleLowerCase("tr").includes(term));
    fetchWeatherForList(filtered, cityList);
});

// KONUM BULMA (Geolocation)
locateBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        alert("Tarayıcınız konum özelliğini desteklemiyor.");
        return;
    }

    statusText.innerHTML = '<div class="spinner-border text-primary" role="status"></div><div class="mt-2">Konum bulunuyor...</div>';
    cityList.innerHTML = ""; // Listeyi temizle

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            // Konum bulunduğunda tek bir kart olarak gösterelim
            fetchSingleLocation(lat, lon, "Konumunuz");
        },
        () => {
            statusText.innerHTML = '<div class="alert alert-warning">Konum alınamadı. İzin verdiğinizden emin olun.</div>';
        }
    );
});

// Tekil Konum İçin Fetch (GPS için özel)
async function fetchSingleLocation(lat, lon, name) {
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();

        // Tek bir kart oluşturup listeye bas
        const mockCityList = [{ name: name, lat: lat, lon: lon }]; // List yapısına uydurma

        // Bu veriyi normal fonksiyona göndermek yerine direkt basabiliriz veya listeye ekleyebiliriz
        // Basitlik için UI'yi manuel oluşturuyorum:
        statusText.innerHTML = "";
        cityList.innerHTML = `
        <div class="col-md-4 mx-auto">
            <div class="card h-100 shadow border-primary border-2">
                <div class="card-header bg-primary text-white text-center fw-bold">📍 Sizin Konumunuz</div>
                <div class="card-body text-center">
                    <h1 class="display-4">${getWeatherIcon(data.current_weather.weathercode)}</h1>
                    <h2 class="card-title">${data.current_weather.temperature}°C</h2>
                    <p class="card-text text-muted">💨 Rüzgar: ${data.current_weather.windspeed} km/s</p>
                    <a href="detail.html?city=${name}&lat=${lat}&lon=${lon}" class="btn btn-primary w-100 mt-2">Detaylar</a>
                </div>
            </div>
        </div>`;
    } catch (err) {
        statusText.innerHTML = `<div class="alert alert-danger">Hata oluştu. <button onclick="location.reload()" class="btn btn-sm btn-outline-danger">Yenile</button></div>`;
    }
}


// Liste Fetch Fonksiyonu (Spinner & Try Again ekli)
async function fetchWeatherForList(cities, container) {
    container.innerHTML = "";
    // SPINNER EKLENDİ
    statusText.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Yükleniyor...</span></div>';

    try {
        for (const city of cities) {
            const res = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`
            );
            const data = await res.json();

            const isFav = favorites.some(f => f.name === city.name);
            const btnClass = isFav ? "btn-warning" : "btn-outline-secondary";
            const btnText = isFav ? "Favorilerden Çıkar" : "Favoriye Ekle";
            const icon = getWeatherIcon(data.current_weather.weathercode); // İkon Fonksiyonu

            container.innerHTML += `
            <div class="col-md-4">
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="card-title fw-bold mb-0">📍 ${city.name}</h5>
                            <span class="fs-4">${icon}</span>
                        </div>
                        <h3 class="mb-3">${data.current_weather.temperature}<small class="fs-6 text-muted">°C</small></h3>
                        <p class="card-text text-muted small">
                            💨 Rüzgar: ${data.current_weather.windspeed} km/s
                        </p>
                        
                        <div class="d-grid gap-2">
                            <a href="detail.html?city=${city.name}&lat=${city.lat}&lon=${city.lon}" 
                               class="btn btn-primary btn-sm">Detaylar</a>
                            <button onclick="toggleFavorite('${city.name}')" class="btn ${btnClass} btn-sm">${btnText}</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }
        statusText.innerHTML = "";
        if (cities.length === 0) statusText.innerText = "Şehir bulunamadı.";

    } catch (error) {
        console.error(error);
        // TRY AGAIN BUTTON EKLENDİ
        statusText.innerHTML = `
            <div class="alert alert-danger d-inline-block">
                Veri alınamadı. İnternet bağlantınızı kontrol edin.
                <br>
                <button onclick="location.reload()" class="btn btn-sm btn-outline-danger mt-2">🔄 Sayfayı Yenile</button>
            </div>`;
    }
}

window.toggleFavorite = function (cityName) {
    const city = turkeyData.find(c => c.name === cityName);
    if (!city) return;
    const index = favorites.findIndex(f => f.name === cityName);
    if (index > -1) favorites.splice(index, 1);
    else favorites.push(city);
    localStorage.setItem("skyplan_favs", JSON.stringify(favorites));
    renderFavorites();
    searchInput.dispatchEvent(new Event('input'));
};

function renderFavorites() {
    favoritesList.innerHTML = "";
    if (favorites.length > 0) {
        favoritesSection.classList.remove("d-none");
        favorites.forEach(city => {
            favoritesList.innerHTML += `
                <div class="col-6 col-md-3">
                    <div class="p-3 border rounded text-center bg-white shadow-sm position-relative">
                        <button onclick="toggleFavorite('${city.name}')" class="btn-close position-absolute top-0 end-0 m-2"></button>
                        <h6 class="mb-2 text-truncate">${city.name}</h6>
                        <a href="detail.html?city=${city.name}&lat=${city.lat}&lon=${city.lon}" class="btn btn-sm btn-outline-primary w-100">Git</a>
                    </div>
                </div>`;
        });
    } else {
        favoritesSection.classList.add("d-none");
    }
}