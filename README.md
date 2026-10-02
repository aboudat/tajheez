# Tajheez Medical

Bilingual (Arabic / English) e-commerce storefront for medical, dental and home-care equipment. Static site, no build step.

## Structure

- `index.html` single page app shell
- `js/products.js` product catalog (names, prices, categories in both languages)
- `js/i18n.js` UI strings (EN / AR with RTL)
- `js/app.js` router, cart, checkout
- `js/tracker.js` analytics events
- `js/config.js` site settings (GA4 ID, event endpoint, shipping)

## Run locally

Serve the folder with any static server, for example:

```
python -m http.server 8080
```

## Configuration

Set `gaId` in `js/config.js` to a GA4 measurement ID to enable Google Analytics. Optionally set `eventEndpoint` to a webhook URL that receives event JSON.
