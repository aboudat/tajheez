// Tajheez Medical storefront SPA
(function () {
  var CFG = window.TJZ_CONFIG;
  var P = window.TJZ_PRODUCTS;
  var CATS = window.TJZ_CATS;
  var track = window.TJZ_TRACK;

  // Placeholder delivery cities until the owner confirms coverage.
  var CITIES = ["Riyadh", "Jeddah", "Makkah", "Madinah", "Dammam", "Khobar", "Dhahran", "Taif", "Tabuk", "Buraydah", "Abha", "Khamis Mushait", "Hail", "Jazan", "Najran", "Al Ahsa"];
  var CITIES_AR = ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الظهران", "الطائف", "تبوك", "بريدة", "أبها", "خميس مشيط", "حائل", "جازان", "نجران", "الأحساء"];

  // Monoline category pictograms (48 grid, 1.5 stroke), standing in until product photos exist.
  var PICTOS = {
    diagnostics: '<rect x="7" y="12" width="34" height="24" rx="3"/><path d="M12 25h6l3-7 5 13 3-6h7"/>',
    respiratory: '<path d="M24 7v15M24 18c-1.5 2-3.5 3-5 3M24 18c1.5 2 3.5 3 5 3"/><path d="M19 15c-6 0-10 9-10 18 0 4 2 6 5 6 3.5 0 5-2.5 5-6.5z"/><path d="M29 15c6 0 10 9 10 18 0 4-2 6-5 6-3.5 0-5-2.5-5-6.5z"/>',
    mobility: '<circle cx="21" cy="31" r="9"/><circle cx="36" cy="38" r="2.5"/><path d="M13 10h5v15h13l3 11"/>',
    homecare: '<path d="M6 36V13M6 29h36v7M42 29v-6a4 4 0 0 0-4-4H21v10"/><rect x="10" y="20" width="8" height="6" rx="2"/>',
    dental: '<path d="M17 8c-5 0-9 4-9 9.5 0 6 3 9 4 15 .8 5 2 7.5 4 7.5 3 0 3-9.5 8-9.5s5 9.5 8 9.5c2 0 3.2-2.5 4-7.5 1-6 4-9 4-15C40 12 36 8 31 8c-3 0-4.5 2-7 2s-4-2-7-2z"/>',
    supplies: '<rect x="8" y="16" width="32" height="24" rx="2"/><path d="M8 22h32M19 16v-4h10v4M24 26v9M19.5 30.5h9"/>'
  };
  function picto(cat, cls) {
    return '<svg class="picto ' + (cls || "") + '" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + (PICTOS[cat] || "") + "</svg>";
  }
  function doorOf(cat) {
    var c = CATS.find(function (x) { return x.id === cat; });
    return c ? c.door : "home";
  }
  function arrow() { return window.TJZ_LANG === "ar" ? " ←" : " →"; }
  // Escapes text; in Arabic, isolates numeric runs ("22-42", "93% +-3") so they keep left-to-right order.
  var NUM_RUN = /\d[\d.,%x×+\-–\/ ]*\d(?:%|x|×)?|\d(?:%|x|×)?/g;
  function txt(s) {
    s = String(s);
    if (window.TJZ_LANG !== "ar") return esc(s);
    var out = "", last = 0;
    s.replace(NUM_RUN, function (m, off) {
      out += esc(s.slice(last, off)) + '<bdi dir="ltr">' + esc(m) + "</bdi>";
      last = off + m.length;
      return m;
    });
    return out + esc(s.slice(last));
  }

  // One of the two doors into the catalogue, with its categories and a short price list.
  function doorHTML(id) {
    var cats = CATS.filter(function (c) { return c.door === id; });
    var top = id === "clinic"
      ? P.filter(function (p) { return doorOf(p.cat) === "clinic"; }).sort(function (a, b) { return b.pop - a.pop; }).slice(0, 4)
      : cats.map(function (c) {
          return P.filter(function (p) { return p.cat === c.id; }).sort(function (a, b) { return b.pop - a.pop; })[0];
        });
    var href = id === "clinic" ? "#/shop?for=clinic&view=list" : "#/shop?for=home";
    return '<a class="door door-' + id + '" href="' + href + '" data-door="' + id + '">' +
      "<h2>" + esc(t("door_" + id + "_t")) + "</h2>" +
      '<ul class="door-cats">' + cats.map(function (c) {
        var n = P.filter(function (p) { return p.cat === c.id; }).length;
        return "<li>" + picto(c.id) + "<span>" + esc(t(c.key)) + '</span><span class="n">' + n + "</span></li>";
      }).join("") + "</ul>" +
      '<ul class="door-list">' + top.map(function (p) {
        var lp = L(p);
        return '<li><span class="nm">' + txt(lp.name) + '</span><span class="sp">' + txt(lp.specs[0]) + "</span>" + fmt(p.price) + "</li>";
      }).join("") + "</ul>" +
      '<span class="door-go">' + esc(t("door_" + id + "_go")) + arrow() + "</span>" +
    "</a>";
  }
  function doorsHTML() { return '<div class="doors">' + doorHTML("home") + doorHTML("clinic") + "</div>"; }
  function bindDoors(root) {
    root.querySelectorAll("[data-door]").forEach(function (a) {
      a.addEventListener("click", function () { track("door_click", { door: a.getAttribute("data-door") }); });
    });
  }

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
    var badge = document.querySelector(".cart-badge");
    if (badge) badge.classList.add("tick");
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
    var qs = new URLSearchParams((location.hash.split("?")[1]) || "");
    var navDoor = route === "#/shop" ? (qs.get("for") || (qs.get("cat") ? doorOf(qs.get("cat")) : "all")) : "";
    if (route.indexOf("#/product/") === 0) { var np = byId(route.slice(10)); if (np) navDoor = doorOf(np.cat); }
    document.getElementById("header").innerHTML =
      '<div class="header-inner">' +
        '<a href="#/" class="logo">' + esc(t("brand")) + "</a>" +
        '<div class="search-wrap"><svg class="search-ic" viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.5"/></svg>' +
          '<input id="search-input" type="search" placeholder="' + esc(t("search_ph")) + '" autocomplete="off"></div>' +
        '<div class="header-actions">' +
          '<button class="lang-btn" id="lang-toggle">' + (window.TJZ_LANG === "en" ? "عربي" : "English") + "</button>" +
          '<a class="icon-btn" href="#/cart"><span>' + esc(t("cart")) + "</span>" +
            (cartCount() ? '<span class="cart-badge">' + cartCount() + "</span>" : "") + "</a>" +
        "</div>" +
      "</div>" +
      '<nav class="nav">' +
        '<a href="#/" class="' + (route === "#/" ? "active" : "") + '">' + esc(t("nav_home")) + "</a>" +
        '<a href="#/shop?for=home" class="' + (navDoor === "home" ? "active" : "") + '">' + esc(t("group_home")) + "</a>" +
        '<a href="#/shop?for=clinic&view=list" class="' + (navDoor === "clinic" ? "active" : "") + '">' + esc(t("group_clinic")) + "</a>" +
        '<a href="#/shop" class="' + (navDoor === "all" ? "active" : "") + '">' + esc(t("all_products")) + "</a>" +
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
          '<div class="f-brand">' + esc(t("brand")) + "</div>" +
          '<p class="f-about">' + esc(t("footer_about")) + "</p>" +
        "</div>" +
        "<div><h4>" + esc(t("footer_shop")) + "</h4>" +
          '<a href="#/shop?for=home">' + esc(t("group_home")) + "</a>" +
          '<a href="#/shop?for=clinic&view=list">' + esc(t("group_clinic")) + "</a>" +
          '<a href="#/shop">' + esc(t("all_products")) + "</a>" +
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
      '<a href="#/product/' + p.id + '" class="card-img" aria-hidden="true" tabindex="-1">' + picto(p.cat) + "</a>" +
      '<div class="card-body">' +
        '<div class="card-meta"><span>' + esc(catName(p.cat)) + "</span>" + badge + "</div>" +
        '<a href="#/product/' + p.id + '"><h3>' + txt(lp.name) + "</h3></a>" +
        (lp.specs && lp.specs.length ? '<p class="card-spec">' + txt(lp.specs[0]) + "</p>" : "") +
        priceRow(p) +
        '<button class="btn btn-outline" data-add="' + p.id + '">' + esc(t("add_to_cart")) + "</button>" +
      "</div></div>";
  }
  function priceRow(p) {
    return '<div class="price-row"><span class="price">' + fmt(p.price) + "</span>" +
      (p.oldPrice ? '<span class="old-price">' + fmt(p.oldPrice) + '</span><span class="off" dir="ltr">−' +
        Math.round((1 - p.price / p.oldPrice) * 100) + "%</span>" : "") + "</div>";
  }
  function bindCards(root) {
    root.querySelectorAll("[data-add]").forEach(function (b) {
      b.addEventListener("click", function () { addToCart(b.getAttribute("data-add")); });
    });
  }

  // ---------- views ----------
  function viewHome(main) {
    var best = P.slice().sort(function (a, b) { return b.pop - a.pop; }).slice(0, 8);
    var cities = window.TJZ_LANG === "ar" ? CITIES_AR : CITIES;
    main.innerHTML =
      '<section class="hero"><div class="hero-inner">' +
        "<h1>" + esc(t("hero_title")) + "</h1>" +
        "<p>" + esc(t("hero_sub")) + "</p>" +
      "</div></section>" +
      doorsHTML() +
      '<section class="delivery">' +
        '<p class="delivery-lead">' + esc(t("deliver_to")) + "</p>" +
        '<ul class="cities">' + cities.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>" +
        '<p class="delivery-terms"><b>' + esc(t("usp3_t")) + "</b> " + esc(t("usp3_d")) + " · " +
          esc(t("usp2_d")) + " · " + esc(t("usp4_d")) + "</p>" +
      "</section>" +
      '<section class="section">' +
        '<div class="section-head"><h2>' + esc(t("featured_title")) + '</h2><a href="#/shop">' + esc(t("view_all")) + arrow() + "</a></div>" +
        '<div class="grid">' + best.map(cardHTML).join("") + "</div>" +
      "</section>";
    bindCards(main);
    bindDoors(main);
  }

  function rowHTML(p) {
    var lp = L(p);
    return "<tr>" +
      '<td class="c-item"><a href="#/product/' + p.id + '">' + txt(lp.name) + "</a></td>" +
      '<td class="c-cat">' + esc(catName(p.cat)) + "</td>" +
      '<td class="c-spec">' + txt((lp.specs && lp.specs[0]) || "") + "</td>" +
      '<td class="c-price">' + fmt(p.price) + "</td>" +
      '<td class="c-add"><button class="btn btn-outline" data-add="' + p.id + '">' + esc(t("add_short")) + "</button></td>" +
    "</tr>";
  }

  function viewShop(main, params) {
    var cat = params.get("cat") || "";
    var q = (params.get("q") || "").toLowerCase();
    var sort = params.get("sort") || "pop";
    var forDoor = params.get("for") || "";
    var view = params.get("view") === "list" || (!params.has("view") && cat && doorOf(cat) === "clinic") ? "list" : "cards";
    var list = P.filter(function (p) {
      if (cat && p.cat !== cat) return false;
      if (forDoor && doorOf(p.cat) !== forDoor) return false;
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
        '<aside class="filters">' +
          '<a class="f-all' + (!cat && !forDoor ? " active" : "") + '" href="#/shop' + (view === "list" ? "?view=list" : "") + '">' + esc(t("all_cats")) + "</a>" +
          ["home", "clinic"].map(function (d) {
            var keep = view === "list" ? "&view=list" : "";
            return '<div class="f-group"><a class="f-door' + (forDoor === d && !cat ? " active" : "") + '" href="#/shop?for=' + d + keep + '">' + esc(t("group_" + d)) + "</a>" +
              CATS.filter(function (c) { return c.door === d; }).map(function (c) {
                return '<a class="f-cat' + (cat === c.id ? " active" : "") + '" href="#/shop?cat=' + c.id + keep + '">' + esc(t(c.key)) + "</a>";
              }).join("") + "</div>";
          }).join("") +
        "</aside>" +
        "<div>" +
          '<div class="shop-toolbar">' +
            '<span class="count">' + (q ? esc(t("search_results")) + ' "' + esc(q) + '" · ' : "") + '<span class="n">' + list.length + "</span> " + esc(t("products_count")) + "</span>" +
            '<div class="toolbar-end">' +
            '<div class="view-toggle" role="group">' +
              '<button data-view="cards" aria-pressed="' + (view === "cards") + '">' + esc(t("view_cards")) + "</button>" +
              '<button data-view="list" aria-pressed="' + (view === "list") + '">' + esc(t("view_table")) + "</button>" +
            "</div>" +
            '<select id="sort-sel">' +
              '<option value="pop" ' + (sort === "pop" ? "selected" : "") + ">" + esc(t("sort_pop")) + "</option>" +
              '<option value="price_asc" ' + (sort === "price_asc" ? "selected" : "") + ">" + esc(t("sort_price_asc")) + "</option>" +
              '<option value="price_desc" ' + (sort === "price_desc" ? "selected" : "") + ">" + esc(t("sort_price_desc")) + "</option>" +
            "</select></div>" +
          "</div>" +
          (!list.length ? '<div class="empty-state"><p>' + esc(t("no_results")) + "</p></div>"
            : view === "list"
              ? '<table class="ptable"><thead><tr><th>' + esc(t("col_item")) + "</th><th class=\"c-cat\">" + esc(t("col_cat")) + '</th><th class="c-spec">' + esc(t("col_spec")) + '</th><th class="c-price">' + esc(t("col_price")) + "</th><th></th></tr></thead><tbody>" + list.map(rowHTML).join("") + "</tbody></table>"
              : '<div class="grid grid-3">' + list.map(cardHTML).join("") + "</div>") +
        "</div>" +
      "</div></section>";
    bindCards(main);
    var activeFilter = main.querySelector(".filters a.active");
    if (activeFilter && window.matchMedia("(max-width: 960px)").matches) activeFilter.scrollIntoView({ inline: "center", block: "nearest" });
    main.querySelectorAll("[data-view]").forEach(function (b) {
      b.addEventListener("click", function () {
        var u = new URLSearchParams(params);
        u.set("view", b.getAttribute("data-view"));
        track("view_toggle", { view: b.getAttribute("data-view") });
        location.hash = "#/shop" + (u.toString() ? "?" + u.toString() : "");
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
    var related = P.filter(function (x) { return x.cat === p.cat && x.id !== p.id; })
      .concat(P.filter(function (x) { return x.cat !== p.cat && doorOf(x.cat) === doorOf(p.cat); }).sort(function (a, b) { return b.pop - a.pop; }))
      .slice(0, 4);
    main.innerHTML =
      '<section class="section"><div class="product-layout">' +
        '<div class="product-hero">' + picto(p.cat) + "</div>" +
        '<div class="product-info">' +
          '<a href="#/shop?cat=' + p.cat + '" class="link-muted">' + esc(catName(p.cat)) + "</a>" +
          "<h1>" + txt(lp.name) + "</h1>" +
          priceRow(p) +
          '<div class="pay-hint">' + esc(t("usp3_t")) + " · " + esc(t("usp1_d")) + "</div>" +
          '<div class="qty-row"><div class="qty-ctl">' +
            '<button id="q-minus">−</button><span id="q-val">1</span><button id="q-plus">+</button>' +
          "</div></div>" +
          '<button class="btn btn-primary btn-block" id="pdp-add">' + esc(t("add_to_cart")) + "</button>" +
          '<div class="specs"><h4>' + esc(t("specs_title")) + "</h4><ul>" +
            lp.specs.map(function (s) { return "<li>" + txt(s) + "</li>"; }).join("") +
          "</ul></div>" +
        "</div>" +
      "</div>" +
      '<div class="desc-block"><h4>' + esc(t("desc_title")) + "</h4><p>" + txt(lp.desc) + "</p></div>" +
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

  // The order summary, set as a courier's delivery note. opts: { city, pay }
  function deliveryNote(opts) {
    opts = opts || {};
    var pay = opts.pay || t("note_pay_cod");
    var sub = cartSubtotal();
    var ship = sub >= CFG.freeShippingThreshold ? 0 : CFG.shippingFee;
    return '<div class="note"><h3>' + esc(t("note_title")) + "</h3>" +
      (opts.lines === false ? "" : '<ul class="note-lines">' + getCart().map(function (i) {
        var p = byId(i.id); if (!p) return "";
        return '<li><span class="q" dir="ltr">' + i.qty + "×</span><span class=\"nm\">" + txt(L(p).name) + "</span>" + fmt(p.price * i.qty) + "</li>";
      }).join("") + "</ul>") +
      '<div class="note-row"><span>' + esc(t("subtotal")) + "</span>" + fmt(sub) + "</div>" +
      '<div class="note-row"><span>' + esc(t("shipping")) + "</span>" +
        (ship === 0 ? '<span class="free-tag">' + esc(t("free")) + "</span>" : fmt(ship)) + "</div>" +
      '<div class="note-row note-total"><span>' + esc(t("total")) + "</span>" + fmt(sub + ship) + "</div>" +
      '<div class="note-row note-meta"' + (opts.city ? "" : " hidden") + ' id="note-city-row"><span>' + esc(t("note_to")) + '</span><span id="note-city">' + esc(opts.city || "") + "</span></div>" +
      '<div class="note-row note-meta"><span>' + esc(t("note_pay")) + '</span><span id="note-pay">' + esc(pay) + "</span></div>" +
    "</div>";
  }

  function viewCart(main) {
    var c = getCart();
    track("view_cart", { cart_size: cartCount(), cart_value: +cartSubtotal().toFixed(2) });
    if (!c.length) {
      main.innerHTML = '<section class="section"><div class="empty-state">' +
        "<h1>" + esc(t("cart_empty")) + "</h1></div></section>" + doorsHTML();
      bindDoors(main);
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
            '<a href="#/product/' + p.id + '" class="thumb">' + picto(p.cat) + "</a>" +
            "<div><h4>" + txt(lp.name) + "</h4>" + (i.qty > 1 ? '<span class="unit">' + fmt(p.price) + " × " + i.qty + "</span>" : "") + "</div>" +
            '<div class="line-end">' +
              '<div class="qty-ctl">' +
                '<button data-dec="' + p.id + '">−</button><span>' + i.qty + '</span><button data-inc="' + p.id + '">+</button>' +
              "</div>" +
              '<b>' + fmt(p.price * i.qty) + "</b>" +
              '<button class="remove-btn" data-rm="' + p.id + '">' + esc(t("remove")) + "</button>" +
            "</div></div>";
        }).join("") +
      "</div>" +
      '<div class="summary">' + deliveryNote({ lines: false }) +
        '<button class="btn btn-primary btn-block" id="go-checkout">' + esc(t("checkout_btn")) + "</button>" +
        '<a href="#/shop" class="text-link summary-link">' + esc(t("continue_shopping")) + "</a>" +
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

    function summaryHTML(pay) {
      return '<div class="summary">' + deliveryNote({ city: saved.city, pay: pay }) + "</div>";
    }

    function stepInfo() {
      track("checkout_step", { step: "info" });
      main.innerHTML =
        '<section class="section"><div class="section-head"><h2>' + esc(t("checkout_title")) + "</h2></div>" +
        '<div class="steps"><div class="step active"><span class="n">1/2</span> ' + esc(t("step_info")) + '</div><div class="step"><span class="n">2/2</span> ' + esc(t("step_payment")) + "</div></div>" +
        '<div class="cart-layout"><div class="checkout-card"><form id="info-form" class="form-grid">' +
          "<div><label>" + esc(t("f_name")) + ' *</label><input name="name" required value="' + esc(saved.name || "") + '"></div>' +
          "<div><label>" + esc(t("f_phone")) + ' *</label><input name="phone" type="tel" required placeholder="05XXXXXXXX" pattern="(05|\\+9665|9665)[0-9]{8}" inputmode="tel" value="' + esc(saved.phone || "") + '"></div>' +
          "<div><label>" + esc(t("f_city")) + ' *</label><select name="city" required><option value="">' + esc(t("city_select")) + "</option>" +
            cities.map(function (c) { return '<option ' + (saved.city === c ? "selected" : "") + ">" + esc(c) + "</option>"; }).join("") + "</select></div>" +
          "<div><label>" + esc(t("f_area")) + ' *</label><input name="area" required value="' + esc(saved.area || "") + '"></div>' +
          '<div class="full"><label>' + esc(t("f_notes")) + '</label><textarea name="notes" rows="2">' + esc(saved.notes || "") + "</textarea></div>" +
          '<div class="full"><button class="btn btn-primary btn-block" type="submit">' + esc(t("to_payment")) + "</button></div>" +
        "</form></div>" + summaryHTML() + "</div></section>";
      main.querySelector('select[name="city"]').addEventListener("change", function (e) {
        var row = document.getElementById("note-city-row");
        document.getElementById("note-city").textContent = e.target.value;
        row.hidden = !e.target.value;
      });
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
        { id: "cod", t: "pay_cod", d: "pay_cod_d", note: "note_pay_cod" },
        { id: "card", t: "pay_card", d: "pay_card_d", note: "pay_card" },
        { id: "cliq", t: "pay_cliq", d: "pay_cliq_d", note: "pay_cliq" }
      ];
      main.innerHTML =
        '<section class="section"><div class="section-head"><h2>' + esc(t("checkout_title")) + "</h2></div>" +
        '<div class="steps"><div class="step done"><span class="n">1/2</span> ' + esc(t("step_info")) + '</div><div class="step active"><span class="n">2/2</span> ' + esc(t("step_payment")) + "</div></div>" +
        '<div class="cart-layout"><div class="checkout-card">' +
          "<h3>" + esc(t("pay_title")) + "</h3>" +
          methods.map(function (m, i) {
            return '<label class="pay-option' + (i === 0 ? " selected" : "") + '" data-pay="' + m.id + '">' +
              '<input type="radio" name="pay" value="' + m.id + '" ' + (i === 0 ? "checked" : "") + ">" +
              "<span><b>" + esc(t(m.t)) + "</b><span>" + esc(t(m.d)) + "</span></span></label>";
          }).join("") +
          '<button class="btn btn-primary btn-block" id="place-order">' + esc(t("place_order")) + " · " + fmt(total) + "</button>" +
        "</div>" + summaryHTML(t(methods[0].note)) + "</div></section>";
      main.querySelectorAll(".pay-option").forEach(function (opt) {
        opt.addEventListener("click", function () {
          main.querySelectorAll(".pay-option").forEach(function (o) { o.classList.remove("selected"); });
          opt.classList.add("selected");
          opt.querySelector("input").checked = true;
          var m = methods.find(function (x) { return x.id === opt.getAttribute("data-pay"); });
          document.getElementById("note-pay").textContent = t(m.note);
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
        
        "<h3>" + esc(t("fail_title")) + "</h3>" +
        "<p>" + esc(t("fail_msg")) + "</p>" +
        '<input id="lead-contact" placeholder="' + esc(t("fail_contact")) + '" value="' + esc(saved.phone || "") + '">' +
        '<button class="btn btn-primary btn-block" id="lead-submit">' + esc(t("fail_submit")) + "</button>" +
        '<div style="margin-top:12px"><a href="#/shop" class="text-link" id="lead-skip">' + esc(t("fail_skip")) + "</a></div>" +
      "</div></div>";
      document.getElementById("lead-submit").onclick = function () {
        var contact = document.getElementById("lead-contact").value.trim();
        track("lead_submitted", {
          contact_given: !!contact, method: method,
          cart_value: +total.toFixed(2), city: saved.city || "", items: cartSnapshot()
        });
        root.innerHTML = '<div class="overlay"><div class="modal">' +
          '<h3>' + esc(t("lead_thanks_t")) + "</h3>" +
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
      '<p class="about-doors"><a class="text-link" href="#/shop?for=home">' + esc(t("door_home_t")) + arrow() + "</a>" +
        '<a class="text-link" href="#/shop?for=clinic&view=list">' + esc(t("door_clinic_t")) + arrow() + "</a></p>" +
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
