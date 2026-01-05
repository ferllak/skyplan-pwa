const citySelect = document.getElementById("citySelect");
const districtSelect = document.getElementById("districtSelect");
const detailBtn = document.getElementById("detailBtn");

// Sayfa yüklendiğinde Şehirleri doldur (turkeyData data.js'den geliyor)
document.addEventListener("DOMContentLoaded", () => {
    // Şehirleri alfabetik sırala
    const sortedCities = turkeyData.sort((a, b) => a.name.localeCompare(b.name));

    sortedCities.forEach(city => {
        const opt = document.createElement("option");
        opt.value = city.name; // Value olarak ismi kullanıyoruz
        opt.textContent = city.name;
        citySelect.appendChild(opt);
    });
});

// Şehir değişince
citySelect.addEventListener("change", () => {
    districtSelect.innerHTML = '<option value="">Seçiniz</option>';
    detailBtn.disabled = true;
    districtSelect.disabled = true;

    const cityName = citySelect.value;
    if (!cityName) return;

    // Seçilen şehrin verisini bul
    const selectedCity = turkeyData.find(c => c.name === cityName);

    if (selectedCity && selectedCity.districts) {
        districtSelect.disabled = false;

        // İlçeleri ekle
        selectedCity.districts.forEach(dist => {
            const opt = document.createElement("option");
            opt.value = dist;
            opt.textContent = dist;
            districtSelect.appendChild(opt);
        });
    }
});

// İlçe seçilince
districtSelect.addEventListener("change", () => {
    detailBtn.disabled = !districtSelect.value;
});

// Detay butonuna tıkla
detailBtn.addEventListener("click", () => {
    const cityName = citySelect.value;
    const districtName = districtSelect.value;

    // Şehrin koordinatlarını bul
    const cityData = turkeyData.find(c => c.name === cityName);

    // Detay sayfasına yönlendir (Şehrin koordinatlarını da gönderiyoruz ki harita/API çalışsın)
    if (cityData) {
        window.location.href = `detail.html?city=${cityName}&district=${districtName}&lat=${cityData.lat}&lon=${cityData.lon}`;
    }
});