// Lightweight event tracker: GA4 (if configured) + optional webhook + local buffer
(function () {
  var cfg = window.TJZ_CONFIG || {};
  var LS_KEY = "tjz_events";
  var SID_KEY = "tjz_sid";

  function sid() {
    try {
      var s = localStorage.getItem(SID_KEY);
      if (!s) {
        s = "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
        localStorage.setItem(SID_KEY, s);
      }
      return s;
    } catch (e) { return "s_anon"; }
  }

  // GA4 bootstrap
  if (cfg.gaId) {
    var gs = document.createElement("script");
    gs.async = true;
    gs.src = "https://www.googletagmanager.com/gtag/js?id=" + cfg.gaId;
    document.head.appendChild(gs);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", cfg.gaId);
  }

  function persistLocal(ev) {
    try {
      var arr = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      arr.push(ev);
      if (arr.length > 500) arr = arr.slice(arr.length - 500);
      localStorage.setItem(LS_KEY, JSON.stringify(arr));
    } catch (e) { /* storage unavailable */ }
  }

  function sendWebhook(ev) {
    if (!cfg.eventEndpoint) return;
    try {
      var body = JSON.stringify(ev);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(cfg.eventEndpoint, new Blob([body], { type: "text/plain" }));
      } else {
        fetch(cfg.eventEndpoint, { method: "POST", body: body, keepalive: true, mode: "no-cors" });
      }
    } catch (e) { /* network unavailable */ }
  }

  window.TJZ_TRACK = function (name, params) {
    var ev = {
      event: name,
      params: params || {},
      ts: new Date().toISOString(),
      sid: sid(),
      lang: (window.TJZ_LANG || "en"),
      route: location.hash || "#/",
      ua: navigator.userAgent.slice(0, 120)
    };
    persistLocal(ev);
    if (window.gtag) window.gtag("event", name, params || {});
    sendWebhook(ev);
  };

  window.TJZ_EVENTS = function () {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch (e) { return []; }
  };
})();
