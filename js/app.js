// Tajheez Medical storefront SPA
(function () {
  var CFG = window.TJZ_CONFIG;
  var P = window.TJZ_PRODUCTS;
  var CATS = window.TJZ_CATS;
  var track = window.TJZ_TRACK;

  var CITIES = ["Amman", "Zarqa", "Irbid", "Russeifa", "Aqaba", "Salt", "Madaba", "Jerash", "Mafraq", "Karak", "Ajloun", "Tafilah", "Ma'an"];
  var CITIES_AR = ["عمان", "الزرقاء", "إربد", "الرصيفة", "العقبة", "السلط", "مادبا", "جرش", "المفرق", "الكرك", "عجلون", "الطفيلة", "معان"];

  // ---------- helpers ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Official Saudi Riyal symbol as inline SVG (the Unicode glyph U+20C1 is not in most fonts yet).
  var SAR_PATHS = '<path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"/>' +
    '<path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"/>';
  function sarIcon() {
    return '<svg class="sar" viewBox="0 0 1124.14 1256.39" role="img" aria-label="' + esc(t("sar")) + '">' + SAR_PATHS + "</svg>";
  }
  // Returns HTML: symbol to the left of the amount in both languages.
  function fmt(n) {
    return '<span class="money" dir="ltr">' + sarIcon() + " " + n.toFixed(2).replace(/\.00$/, "") + "</span>";
  }
  function byId(id) { return P.find(function (p) { return p.id === id; }); }
  function L(p) { return p[window.TJZ_LANG] || p.en; }
  function catName(cid) {
    var c = CATS.find(function (x) { return x.id === cid; });
    return c ? t(c.key) : cid;
  }

  // ---------- cart ----------
  function getCart() {
    try { return JSON.parse(localStorage.getItem("tjz_cart") || "[]"); } catch (e) { return []; }
  }
  function saveCart(c) {
    try { localStorage.setItem("tjz_cart", JSON.stringify(c)); } catch (e) {}
    renderHeader();
  }
  function cartCount() { return getCart().reduce(function (a, i) { return a + i.qty; }, 0); }
  function cartSubtotal() {
    return getCart().reduce(function (a, i) {
      var p = byId(i.id); return p ? a + p.price * i.qty : a;
    }, 0);
  }
  function cartSnapshot() {
    return getCart().map(function (i) {
      var p = byId(i.id);
      return { id: i.id, name: p ? p.en.name : i.id, qty: i.qty, price: p ? p.price : 0 };
    });
  }
  function addToCart(id, qty) {
    qty = qty || 1;
    var c = getCart();
    var row = c.find(function (i) { return i.id === id; });
    if (row) row.qty += qty; else c.push({ id: id, qty: qty });
    saveCart(c);
    var p = byId(id);
    track("add_to_cart", { item_id: id, item_name: p.en.name, price: p.price, quantity: qty, cart_size: cartCount(), cart_value: +cartSubtotal().toFixed(2) });
    toast(t("added"));
  }
  function setQty(id, qty) {
    var c = getCart();
    var row = c.find(function (i) { return i.id === id; });
    if (!row) return;
    if (qty <= 0) {
      c = c.filter(function (i) { return i.id !== id; });
      track("remove_from_cart", { item_id: id });
    } else {
      row.qty = qty;
      track("cart_qty_change", { item_id: id, quantity: qty });
    }
    saveCart(c);
    render();
  }

  // ---------- toast ----------
  var toastTimer;
  function toast(msg) {
    var root = document.getElementById("toast-root");
    root.innerHTML = '<div class="toast">' + esc(msg) + "</div>";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { root.innerHTML = ""; }, 2200);
  }

  // ---------- chrome (header / footer) ----------
  function renderHeader() {
    document.getElementById("topbar").innerHTML = esc(t("topbar")).replace("{amount}", fmt(CFG.freeShippingThreshold));
    var route = (location.hash || "#/").split("?")[0];
    document.getElementById("header").innerHTML =
      '<div class="header-inner">' +
        '<a href="#/" class="logo"><span class="logo-mark">⚕</span><span>' + esc(t("brand")) + "</span></a>" +
        '<div class="search-wrap"><span class="search-ic">🔎</span>' +
          '<input id="search-input" type="search" placeholder="' + esc(t("search_ph")) + '" autocomplete="off"></div>' +
        '<div class="header-actions">' +
          '<button class="lang-btn" id="lang-toggle">' + (window.TJZ_LANG === "en" ? "عربي" : "English") + "</button>" +
          '<a class="icon-btn" href="#/cart">🛒 <span>' + esc(t("cart")) + "</span>" +
            (cartCount() ? '<span class="cart-badge">' + cartCount() + "</span>" : "") + "</a>" +
        "</div>" +
      "</div>" +
      '<nav class="nav">' +
        '<a href="#/" class="' + (route === "#/" ? "active" : "") + '">' + esc(t("nav_home")) + "</a>" +
        '<a href="#/shop" class="' + (route.indexOf("#/shop") === 0 ? "active" : "") + '">' + esc(t("nav_shop")) + "</a>" +
        CATS.map(function (c) {
          return '<a href="#/shop?cat=' + c.id + '">' + esc(t(c.key)) + "</a>";
        }).join("") +
        '<a href="#/about" class="' + (route === "#/about" ? "active" : "") + '">' + esc(t("nav_about")) + "</a>" +
        '<a href="#/contact" class="' + (route === "#/contact" ? "active" : "") + '">' + esc(t("nav_contact")) + "</a>" +
      "</nav>";

    document.getElementById("lang-toggle").onclick = function () {
      var next = window.TJZ_LANG === "en" ? "ar" : "en";
      setLang(next);
      track("language_toggle", { lang: next });
      render();
    };
    var si = document.getElementById("search-input");
    si.onkeydown = function (e) {
      if (e.key === "Enter" && si.value.trim()) {
        track("search", { query: si.value.trim() });
        location.hash = "#/shop?q=" + encodeURIComponent(si.value.trim());
      }
    };
  }

  function renderFooter() {
    document.getElementById("footer").innerHTML =
      '<div class="footer-inner">' +
        "<div>" +
          '<div class="f-brand">⚕ ' + esc(t("brand")) + "</div>" +
          '<p class="f-about">' + esc(t("footer_about")) + "</p>" +
        "</div>" +
        "<div><h4>" + esc(t("footer_shop")) + "</h4>" +
          CATS.slice(0, 4).map(function (c) {
            return '<a href="#/shop?cat=' + c.id + '">' + esc(t(c.key)) + "</a>";
          }).join("") +
        "</div>" +
        "<div><h4>" + esc(t("footer_help")) + "</h4>" +
          '<a href="#/about" data-track="footer_shipping">' + esc(t("footer_shipping")) + "</a>" +
          '<a href="#/about" data-track="footer_returns">' + esc(t("footer_returns")) + "</a>" +
          '<a href="#/about" data-track="footer_warranty">' + esc(t("footer_warranty")) + "</a>" +
          '<a href="#/contact">' + esc(t("nav_contact")) + "</a>" +
        "</div>" +
      "</div>" +
      '<div class="footer-bottom">© ' + new Date().getFullYear() + " " + esc(t("footer_rights")) + "</div>";
    document.querySelectorAll("#footer [data-track]").forEach(function (a) {
      a.addEventListener("click", function () { track("footer_link", { link: a.getAttribute("data-track") }); });
    });
  }

  // ---------- product card ----------
  function cardHTML(p) {
    var lp = L(p);
    var badge = p.badge ? '<span class="badge ' + p.badge + '">' + esc(t(p.badge === "new" ? "new_badge" : p.badge)) + "</span>" : "";
    return '<div class="card">' +
      '<a href="#/product/' + p.id + '" class="card-img ' + p.grad + '">' + badge + p.icon + "</a>" +
      '<div class="card-body">' +
        '<a href="#/product/' + p.id + '"><h3>' + esc(lp.name) + "</h3></a>" +
        '<div class="price-row"><span class="price">' + fmt(p.price) + "</span>" +
          (p.oldPrice ? '<span class="old-price">' + fmt(p.oldPrice) + "</span>" : "") + "</div>" +
        '<button class="btn btn-teal" data-add="' + p.id + '">🛒 ' + esc(t("add_to_cart")) + "</button>" +
      "</div></div>";
  }
  function bindCards(root) {
    root.querySelectorAll("[data-add]").forEach(function (b) {
      b.addEventListener("click", function () { addToCart(b.getAttribute("data-add")); });
    });
  }

  // ---------- views ----------
  function viewHome(main) {
    var best = P.slice().sort(function (a, b) { return b.pop - a.pop; }).slice(0, 8);
    var fresh = P.filter(function (p) { return p.badge === "new" || p.badge === "sale"; }).slice(0, 4);
    main.innerHTML =
      '<section class="hero"><div class="hero-inner"><div>' +
        "<h1>" + esc(t("hero_title")) + "</h1>" +
        "<p>" + esc(t("hero_sub")) + "</p>" +
        '<div class="hero-ctas">' +
          '<a href="#/shop" class="btn btn-primary" id="hero-cta">' + esc(t("hero_cta")) + "</a>" +
          '<a href="#home-cats" class="btn btn-ghost">' + esc(t("hero_cta2")) + "</a>" +
        "</div></div>" +
        '<div class="hero-art">🩺</div>' +
      "</div></section>" +
      '<div class="usps">' +
        [["🚚", "usp1"], ["✅", "usp2"], ["💵", "usp3"], ["👨‍⚕️", "usp4"]].map(function (u) {
          return '<div class="usp"><span class="ic">' + u[0] + "</span><div><b>" + esc(t(u[1] + "_t")) + "</b><span>" + esc(t(u[1] + "_d")) + "</span></div></div>";
        }).join("") +
      "</div>" +
      '<section class="section" id="home-cats">' +
        '<div class="section-head"><h2>' + esc(t("cats_title")) + "</h2></div>" +
        '<div class="cat-grid">' + CATS.map(function (c) {
          return '<a class="cat-tile" href="#/shop?cat=' + c.id + '"><span class="ic ' + c.grad + '">' + c.icon + "</span><b>" + esc(t(c.key)) + "</b></a>";
        }).join("") + "</div>" +
      "</section>" +
      '<section class="section">' +
        '<div class="section-head"><h2>' + esc(t("featured_title")) + '</h2><a href="#/shop">' + esc(t("view_all")) + " →</a></div>" +
        '<div class="grid">' + best.map(cardHTML).join("") + "</div>" +
      "</section>" +
      '<section class="section">' +
        '<div class="section-head"><h2>' + esc(t("new_title")) + '</h2><a href="#/shop">' + esc(t("view_all")) + " →</a></div>" +
        '<div class="grid">' + fresh.map(cardHTML).join("") + "</div>" +
      "</section>";
    bindCards(main);
    document.getElementById("hero-cta").addEventListener("click", function () { track("hero_cta_click", {}); });
  }

  function viewShop(main, params) {
    var cat = params.get("cat") || "";
    var q = (params.get("q") || "").toLowerCase();
    var sort = params.get("sort") || "pop";
    var list = P.filter(function (p) {
      if (cat && p.cat !== cat) return false;
      if (q) {
        var lp = L(p);
        return (lp.name + " " + lp.desc + " " + p.en.name + " " + p.ar.name).toLowerCase().indexOf(q) !== -1;
      }
      return true;
    });
    if (sort === "price_asc") list.sort(function (a, b) { return a.price - b.price; });
    else if (sort === "price_desc") list.sort(function (a, b) { return b.price - a.price; });
    else list.sort(function (a, b) { return b.pop - a.pop; });

    if (cat) track("category_view", { category: cat, results: list.length });
    if (q) track("search_results", { query: q, results: list.length });

    main.innerHTML =
      '<section class="section"><div class="shop-layout">' +
        '<aside class="filters"><h4>' + esc(t("all_cats")) + "</h4>" +
          '<label class="' + (!cat ? "active" : "") + '"><input type="radio" name="cat" value="" ' + (!cat ? "checked" : "") + ">" + esc(t("all_cats")) + "</label>" +
          CATS.map(function (c) {
            return '<label class="' + (cat === c.id ? "active" : "") + '"><input type="radio" name="cat" value="' + c.id + '" ' + (cat === c.id ? "checked" : "") + ">" + esc(t(c.key)) + "</label>";
          }).join("") +
        "</aside>" +
        "<div>" +
          '<div class="shop-toolbar">' +
            '<span class="count">' + (q ? esc(t("search_results")) + ' "' + esc(q) + '" · ' : "") + list.length + " " + esc(t("products_count")) + "</span>" +
            '<select id="sort-sel">' +
              '<option value="pop" ' + (sort === "pop" ? "selected" : "") + ">" + esc(t("sort_pop")) + "</option>" +
              '<option value="price_asc" ' + (sort === "price_asc" ? "selected" : "") + ">" + esc(t("sort_price_asc")) + "</option>" +
              '<option value="price_desc" ' + (sort === "price_desc" ? "selected" : "") + ">" + esc(t("sort_price_desc")) + "</option>" +
            "</select>" +
          "</div>" +
          (list.length ? '<div class="grid">' + list.map(cardHTML).join("") + "</div>"
            : '<div class="empty-state"><div class="ic">🔍</div><p>' + esc(t("no_results")) + "</p></div>") +
        "</div>" +
      "</div></section>";
    bindCards(main);
    main.querySelectorAll('input[name="cat"]').forEach(function (r) {
      r.addEventListener("change", function () {
        location.hash = "#/shop" + (r.value ? "?cat=" + r.value : "");
      });
    });
    document.getElementById("sort-sel").addEventListener("change", function (e) {
      var u = new URLSearchParams(params); u.set("sort", e.target.value);
      track("sort_change", { sort: e.target.value });
      location.hash = "#/shop?" + u.toString();
    });
  }

  function viewProduct(main, id) {
    var p = byId(id);
    if (!p) { location.hash = "#/shop"; return; }
    var lp = L(p);
    track("view_product", { item_id: p.id, item_name: p.en.name, price: p.price, category: p.cat });
    var related = P.filter(function (x) { return x.cat === p.cat && x.id !== p.id; }).slice(0, 4);
    main.innerHTML =
      '<section class="section"><div class="product-layout">' +
        '<div class="product-hero ' + p.grad + '">' + p.icon + "</div>" +
        '<div class="product-info">' +
          '<a href="#/shop?cat=' + p.cat + '" class="link-muted">' + esc(catName(p.cat)) + "</a>" +
          "<h1>" + esc(lp.name) + "</h1>" +
          '<div class="price-row"><span class="price">' + fmt(p.price) + "</span>" +
            (p.oldPrice ? '<span class="old-price">' + fmt(p.oldPrice) + "</span>" : "") + "</div>" +
          '<div class="pay-hint">💵 ' + esc(t("usp3_t")) + " · 🚚 " + esc(t("usp1_d")) + "</div>" +
          '<div class="qty-row"><div class="qty-ctl">' +
            '<button id="q-minus">−</button><span id="q-val">1</span><button id="q-plus">+</button>' +
          "</div></div>" +
          '<button class="btn btn-primary btn-block" id="pdp-add">🛒 ' + esc(t("add_to_cart")) + "</button>" +
          '<div class="specs"><h4>' + esc(t("specs_title")) + "</h4><ul>" +
            lp.specs.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") +
          "</ul></div>" +
        "</div>" +
      "</div>" +
      '<div class="desc-block"><h4>' + esc(t("desc_title")) + "</h4><p>" + esc(lp.desc) + "</p></div>" +
      "</section>" +
      (related.length ?
        '<section class="section"><div class="section-head"><h2>' + esc(t("related")) + "</h2></div>" +
        '<div class="grid">' + related.map(cardHTML).join("") + "</div></section>" : "");
    bindCards(main);
    var qty = 1;
    var qv = document.getElementById("q-val");
    document.getElementById("q-minus").onclick = function () { if (qty > 1) { qty--; qv.textContent = qty; } };
    document.getElementById("q-plus").onclick = function () { qty++; qv.textContent = qty; };
    document.getElementById("pdp-add").onclick = function () { addToCart(p.id, qty); };
    window.scrollTo(0, 0);
  }

  function viewCart(main) {
    var c = getCart();
    track("view_cart", { cart_size: cartCount(), cart_value: +cartSubtotal().toFixed(2) });
    if (!c.length) {
      main.innerHTML = '<section class="section"><div class="empty-state"><div class="ic">🛒</div>' +
        "<p>" + esc(t("cart_empty")) + "</p>" +
        '<a href="#/shop" class="btn btn-teal">' + esc(t("cart_empty_cta")) + "</a></div></section>";
      return;
    }
    var sub = cartSubtotal();
    var ship = sub >= CFG.freeShippingThreshold ? 0 : CFG.shippingFee;
    main.innerHTML =
      '<section class="section"><div class="section-head"><h2>' + esc(t("cart_title")) + "</h2></div>" +
      '<div class="cart-layout"><div>' +
        c.map(function (i) {
          var p = byId(i.id); if (!p) return "";
          var lp = L(p);
          return '<div class="cart-item">' +
            '<a href="#/product/' + p.id + '" class="thumb ' + p.grad + '">' + p.icon + "</a>" +
            "<div><h4>" + esc(lp.name) + '</h4><span class="unit">' + fmt(p.price) + "</span></div>" +
            '<div class="line-end">' +
              '<div class="qty-ctl">' +
                '<button data-dec="' + p.id + '">−</button><span>' + i.qty + '</span><button data-inc="' + p.id + '">+</button>' +
              "</div>" +
              '<b>' + fmt(p.price * i.qty) + "</b>" +
              '<button class="remove-btn" data-rm="' + p.id + '">' + esc(t("remove")) + "</button>" +
            "</div></div>";
        }).join("") +
      "</div>" +
      '<div class="summary"><h3>' + esc(t("order_summary")) + "</h3>" +
        '<div class="sum-row"><span>' + esc(t("subtotal")) + "</span><span>" + fmt(sub) + "</span></div>" +
        '<div class="sum-row"><span>' + esc(t("shipping")) + "</span>" +
          (ship === 0 ? '<span class="free-tag">' + esc(t("free")) + "</span>" : "<span>" + fmt(ship) + "</span>") + "</div>" +
        '<div class="sum-row total"><span>' + esc(t("total")) + "</span><span>" + fmt(sub + ship) + "</span></div>" +
        '<button class="btn btn-primary btn-block" id="go-checkout" style="margin-top:14px">' + esc(t("checkout_btn")) + "</button>" +
        '<a href="#/shop" class="btn btn-outline btn-block" style="margin-top:10px">' + esc(t("continue_shopping")) + "</a>" +
      "</div></div></section>";
    main.querySelectorAll("[data-inc]").forEach(function (b) {
      b.onclick = function () { var id = b.getAttribute("data-inc"); setQty(id, getCart().find(function (i) { return i.id === id; }).qty + 1); };
    });
    main.querySelectorAll("[data-dec]").forEach(function (b) {
      b.onclick = function () { var id = b.getAttribute("data-dec"); setQty(id, getCart().find(function (i) { return i.id === id; }).qty - 1); };
    });
    main.querySelectorAll("[data-rm]").forEach(function (b) {
      b.onclick = function () { setQty(b.getAttribute("data-rm"), 0); };
    });
    document.getElementById("go-checkout").onclick = function () {
      track("begin_checkout", { cart_value: +(sub + ship).toFixed(2), items: cartSnapshot() });
      location.hash = "#/checkout";
    };
  }

  function viewCheckout(main) {
    if (!getCart().length) { location.hash = "#/shop"; return; }
    var cities = window.TJZ_LANG === "ar" ? CITIES_AR : CITIES;
    var sub = cartSubtotal();
    var ship = sub >= CFG.freeShippingThreshold ? 0 : CFG.shippingFee;
    var total = sub + ship;
    var saved = {};
    try { saved = JSON.parse(sessionStorage.getItem("tjz_checkout") || "{}"); } catch (e) {}

    function summaryHTML() {
      return '<div class="summary"><h3>' + esc(t("order_summary")) + "</h3>" +
        getCart().map(function (i) {
          var p = byId(i.id); if (!p) return "";
          return '<div class="sum-row"><span>' + esc(L(p).name) + " × " + i.qty + "</span><span>" + fmt(p.price * i.qty) + "</span></div>";
        }).join("") +
        '<div class="sum-row"><span>' + esc(t("shipping")) + "</span>" +
        (ship === 0 ? '<span class="free-tag">' + esc(t("free")) + "</span>" : "<span>" + fmt(ship) + "</span>") + "</div>" +
        '<div class="sum-row total"><span>' + esc(t("total")) + "</span><span>" + fmt(total) + "</span></div></div>";
    }

    function stepInfo() {
      track("checkout_step", { step: "info" });
      main.innerHTML =
        '<section class="section"><div class="section-head"><h2>' + esc(t("checkout_title")) + "</h2></div>" +
        '<div class="steps"><div class="step active">1. ' + esc(t("step_info")) + '</div><div class="step">2. ' + esc(t("step_payment")) + "</div></div>" +
        '<div class="cart-layout"><div class="checkout-card"><form id="info-form" class="form-grid">' +
          "<div><label>" + esc(t("f_name")) + ' *</label><input name="name" required value="' + esc(saved.name || "") + '"></div>' +
          "<div><label>" + esc(t("f_phone")) + ' *</label><input name="phone" type="tel" required placeholder="07XXXXXXXX" value="' + esc(saved.phone || "") + '"></div>' +
          "<div><label>" + esc(t("f_city")) + ' *</label><select name="city" required><option value="">' + esc(t("city_select")) + "</option>" +
            cities.map(function (c) { return '<option ' + (saved.city === c ? "selected" : "") + ">" + esc(c) + "</option>"; }).join("") + "</select></div>" +
          "<div><label>" + esc(t("f_area")) + ' *</label><input name="area" required value="' + esc(saved.area || "") + '"></div>' +
          '<div class="full"><label>' + esc(t("f_notes")) + '</label><textarea name="notes" rows="2">' + esc(saved.notes || "") + "</textarea></div>" +
          '<div class="full"><button class="btn btn-primary btn-block" type="submit">' + esc(t("to_payment")) + "</button></div>" +
        "</form></div>" + summaryHTML() + "</div></section>";
      document.getElementById("info-form").onsubmit = function (e) {
        e.preventDefault();
        var fd = new FormData(e.target);
        saved = { name: fd.get("name"), phone: fd.get("phone"), city: fd.get("city"), area: fd.get("area"), notes: fd.get("notes") };
        try { sessionStorage.setItem("tjz_checkout", JSON.stringify(saved)); } catch (err) {}
        track("checkout_info_submitted", { city: saved.city, cart_value: +total.toFixed(2) });
        stepPayment();
        window.scrollTo(0, 0);
      };
    }

    function stepPayment() {
      track("checkout_step", { step: "payment" });
      var methods = [
        { id: "card", ic: "💳", t: "pay_card", d: "pay_card_d" },
        { id: "cod", ic: "💵", t: "pay_cod", d: "pay_cod_d" },
        { id: "cliq", ic: "🏦", t: "pay_cliq", d: "pay_cliq_d" }
      ];
      main.innerHTML =
        '<section class="section"><div class="section-head"><h2>' + esc(t("checkout_title")) + "</h2></div>" +
        '<div class="steps"><div class="step done">1. ' + esc(t("step_info")) + '</div><div class="step active">2. ' + esc(t("step_payment")) + "</div></div>" +
        '<div class="cart-layout"><div class="checkout-card">' +
          "<h3 style='margin-bottom:14px'>" + esc(t("pay_title")) + "</h3>" +
          methods.map(function (m, i) {
            return '<label class="pay-option' + (i === 0 ? " selected" : "") + '" data-pay="' + m.id + '">' +
              '<input type="radio" name="pay" value="' + m.id + '" ' + (i === 0 ? "checked" : "") + ">" +
              '<span class="pay-ic">' + m.ic + "</span>" +
              "<span><b>" + esc(t(m.t)) + "</b><span>" + esc(t(m.d)) + "</span></span></label>";
          }).join("") +
          '<button class="btn btn-primary btn-block" id="place-order" style="margin-top:10px">' + esc(t("place_order")) + " · " + fmt(total) + "</button>" +
        "</div>" + summaryHTML() + "</div></section>";
      main.querySelectorAll(".pay-option").forEach(function (opt) {
        opt.addEventListener("click", function () {
          main.querySelectorAll(".pay-option").forEach(function (o) { o.classList.remove("selected"); });
          opt.classList.add("selected");
          opt.querySelector("input").checked = true;
          track("payment_method_selected", { method: opt.getAttribute("data-pay") });
        });
      });
      document.getElementById("place-order").onclick = function () {
        var method = main.querySelector('input[name="pay"]:checked').value;
        track("payment_attempt", {
          method: method, cart_value: +total.toFixed(2),
          city: saved.city, items: cartSnapshot()
        });
        showProcessing(method);
      };
    }

    // The validation wall: processing spinner, then "could not complete", lead capture.
    function showProcessing(method) {
      var root = document.getElementById("overlay-root");
      root.innerHTML = '<div class="overlay"><div class="modal">' +
        '<div class="spinner"></div><h3>' + esc(t("redirecting")) + "</h3></div></div>";
      setTimeout(function () { showFailWall(method); }, 1800);
    }

    function showFailWall(method) {
      track("order_wall_shown", { method: method, cart_value: +total.toFixed(2) });
      var root = document.getElementById("overlay-root");
      root.innerHTML = '<div class="overlay"><div class="modal">' +
        '<div class="big-ic">⏳</div>' +
        "<h3>" + esc(t("fail_title")) + "</h3>" +
        "<p>" + esc(t("fail_msg")) + "</p>" +
        '<input id="lead-contact" placeholder="' + esc(t("fail_contact")) + '" value="' + esc(saved.phone || "") + '">' +
        '<button class="btn btn-primary btn-block" id="lead-submit">' + esc(t("fail_submit")) + "</button>" +
        '<div style="margin-top:12px"><a href="#/shop" class="link-muted" id="lead-skip">' + esc(t("fail_skip")) + "</a></div>" +
      "</div></div>";
      document.getElementById("lead-submit").onclick = function () {
        var contact = document.getElementById("lead-contact").value.trim();
        track("lead_submitted", {
          contact_given: !!contact, method: method,
          cart_value: +total.toFixed(2), city: saved.city || "", items: cartSnapshot()
        });
        root.innerHTML = '<div class="overlay"><div class="modal">' +
          '<div class="big-ic">✅</div><h3>' + esc(t("lead_thanks_t")) + "</h3>" +
          '<p style="text-align:center">' + esc(t("lead_thanks_m")) + "</p>" +
          '<a href="#/shop" class="btn btn-teal btn-block" id="thanks-close">' + esc(t("continue_shopping")) + "</a>" +
        "</div></div>";
        document.getElementById("thanks-close").onclick = function () { root.innerHTML = ""; };
      };
      document.getElementById("lead-skip").onclick = function () {
        track("wall_dismissed", { method: method });
        root.innerHTML = "";
      };
    }

    stepInfo();
  }

  function viewAbout(main) {
    track("view_about", {});
    main.innerHTML = '<section class="section"><div class="prose">' +
      "<h1>" + esc(t("about_title")) + "</h1>" +
      "<p>" + esc(t("about_p1")) + "</p><p>" + esc(t("about_p2")) + "</p>" +
      "</div></section>";
  }

  function viewContact(main) {
    track("view_contact", {});
    main.innerHTML = '<section class="section"><div class="prose">' +
      "<h1>" + esc(t("contact_title")) + "</h1>" +
      "<p>" + esc(t("contact_p")) + "</p>" +
      '<form id="contact-form" class="form-grid" style="max-width:560px">' +
        "<div><label>" + esc(t("f_name")) + ' *</label><input name="name" required></div>' +
        "<div><label>" + esc(t("fail_contact")) + ' *</label><input name="contact" required></div>' +
        '<div class="full"><label>' + esc(t("c_msg")) + ' *</label><textarea name="msg" rows="4" required></textarea></div>' +
        '<div class="full"><button class="btn btn-teal" type="submit">' + esc(t("c_send")) + "</button></div>" +
      "</form></div></section>";
    document.getElementById("contact-form").onsubmit = function (e) {
      e.preventDefault();
      track("contact_submitted", {});
      e.target.reset();
      toast(t("c_thanks"));
    };
  }

  // Hidden local event viewer for testing: #/stats
  function viewStats(main) {
    var evs = window.TJZ_EVENTS().slice().reverse();
    main.innerHTML = '<section class="section"><h2>Local events (' + evs.length + ")</h2>" +
      '<pre style="background:#fff;padding:16px;border-radius:12px;overflow:auto;font-size:12px;max-height:70vh">' +
      esc(JSON.stringify(evs, null, 1)) + "</pre></section>";
  }

  // ---------- router ----------
  function render() {
    var hash = location.hash || "#/";
    var qIdx = hash.indexOf("?");
    var route = qIdx === -1 ? hash : hash.slice(0, qIdx);
    var params = new URLSearchParams(qIdx === -1 ? "" : hash.slice(qIdx + 1));
    renderHeader();
    renderFooter();
    var main = document.getElementById("main");
    document.getElementById("overlay-root").innerHTML = "";

    if (route === "#/" || route === "#") viewHome(main);
    else if (route === "#/shop") viewShop(main, params);
    else if (route.indexOf("#/product/") === 0) viewProduct(main, route.slice("#/product/".length));
    else if (route === "#/cart") viewCart(main);
    else if (route === "#/checkout") viewCheckout(main);
    else if (route === "#/about") viewAbout(main);
    else if (route === "#/contact") viewContact(main);
    else if (route === "#/stats") viewStats(main);
    else viewHome(main);

    track("page_view", { route: route });
  }

  window.addEventListener("hashchange", render);
  render();
})();
