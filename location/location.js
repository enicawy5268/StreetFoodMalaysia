// ====== Sidebar toggle ======
var menuToggle = document.getElementById("menuToggle");
var sidebar = document.getElementById("sidebar");
var overlay = document.getElementById("overlay");

menuToggle.addEventListener("click", function () {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
});
overlay.addEventListener("click", function () {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});

// ====== Leaflet map setup ======
var map = L.map('map', { scrollWheelZoom: true }).setView([4.2105, 101.9758], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Markers for famous foods
var markers = L.layerGroup().addTo(map);
[
  { name: 'Penang – Hokkien Mee', lat: 5.4141, lon: 100.3288 },
  { name: 'Kuala Lumpur – Satay', lat: 3.1390, lon: 101.6869 },
  { name: 'Melaka – Nyonya Laksa', lat: 2.1896, lon: 102.2501 },
  { name: 'Kedah – Nasi Ulam', lat: 6.1184, lon: 100.3685 },
  { name: 'Johor – Mee Rebus', lat: 1.4927, lon: 103.7414 },
  { name: 'Perak – Nga Choi Kai', lat: 4.5975, lon: 101.0901 },
  { name: 'Sarawak – Kolo Mee', lat: 1.5533, lon: 110.3592 },
  { name: 'Kelantan – Nasi Kerabu', lat: 6.1254, lon: 102.2381 },
  { name: 'Terengganu – Keropok Lekor', lat: 5.3290, lon: 103.1370 },
  { name: 'Sabah – Sang Nyuk Mee', lat: 5.9804, lon: 116.0735 }
].forEach(function (p) {
  L.marker([p.lat, p.lon]).addTo(markers).bindPopup("<strong>" + p.name + "</strong>");
});

// ====== Preload permission (optional) ======
var __lastPos = null;
var __lastPosTime = 0;
window.addEventListener("load", function () {
  if (!navigator.geolocation) {
    console.log("Geolocation not supported.");
    return;
  }
  var opts = { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 };
  navigator.geolocation.getCurrentPosition(
    function (pos) {
      __lastPos = pos;
      __lastPosTime = Date.now();
      console.log("Location permission granted immediately", pos.coords);
    },
    function (err) {
      console.log("Location permission denied or unavailable", err);
    },
    opts
  );
});

// ====== Search and Nearby functions ======
function searchOnMap() {
  var inputEl = document.getElementById("mapSearchInput");
  var keyword = (inputEl ? inputEl.value : "").trim();
  if (!keyword) {
    alert("Please enter a food name or keyword.");
    if (inputEl) inputEl.focus();
    return;
  }
  var url = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(keyword);
  window.open(url, "_blank");
}

function openNearbyFood() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by this browser.");
    return;
  }
  var win = window.open("about:blank", "_blank");
  var options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 };

  navigator.geolocation.getCurrentPosition(
    function (pos) {
      var lat = pos.coords.latitude;
      var lng = pos.coords.longitude;

      markers.clearLayers();
      L.marker([lat, lng]).addTo(markers).bindPopup("You are here").openPopup();
      map.setView([lat, lng], 15);

      var inputEl = document.getElementById("mapSearchInput");
      var keyword = inputEl ? inputEl.value.trim() : "";
      if (!keyword) keyword = "street food";

      var url = "https://www.google.com/maps/search/" + encodeURIComponent(keyword) +
                "/@" + lat + "," + lng + ",15z";
      if (win) {
        win.location.href = url;
      } else {
        window.open(url, "_blank");
      }
    },
    function (err) {
      if (win && !win.closed) win.close();
      alert("Location access denied. Cannot show nearby food.");

      var inputEl = document.getElementById("mapSearchInput");
      var keyword = inputEl ? inputEl.value.trim() : "";
      var fallback = keyword
        ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(keyword)
        : "https://www.google.com/maps/search/?api=1&query=street%20food%20near%20me";
      window.open(fallback, "_blank");
    },
    options
  );
}

// 暴露到全局给 HTML 按钮使用
window.searchOnMap = searchOnMap;
window.openNearbyFood = openNearbyFood;

// ====== Storage demo（只用课堂基础 JS） ======
// 1) 记住上次搜索关键词（localStorage）
(function () {
  var inputEl = document.getElementById("mapSearchInput");
  var last = localStorage.getItem("lastKeyword") || "";
  if (inputEl && last) inputEl.value = last;

  // 包装现有 searchOnMap：先保存输入再调用原函数
  var _origSearch = window.searchOnMap;
  window.searchOnMap = function () {
    var el = document.getElementById("mapSearchInput");
    var val = el ? el.value : "";
    val = val ? val.trim() : "";
    if (val) localStorage.setItem("lastKeyword", val);
    _origSearch();
  };
})();

// 2) 本会话访问计数（sessionStorage）
(function () {
  var n = Number(sessionStorage.getItem("locVisits") || 0) + 1;
  sessionStorage.setItem("locVisits", String(n));
  console.log("This session visits (Location page):", n);
})();

// 3) 简单 cookie：记住访问过 Location 页
(function () {
  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    document.cookie = name + "=" + encodeURIComponent(value) +
                      "; expires=" + d.toUTCString() + "; path=/";
  }
  if (document.cookie.indexOf("visitedLocation=") === -1) {
    setCookie("visitedLocation", "yes", 30);
  }
})();
