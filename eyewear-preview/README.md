# Pacific Lens Co. MVP

This is a static ecommerce prototype for a New Zealand/Australia cross-border eyewear MVP.

The site deliberately separates low-risk products from prescription fulfillment:

- Frames, sunglasses, blue-light glasses, and accessories can be sold as normal ecommerce SKUs.
- Prescription lenses are handled as an inquiry and manual review flow.
- The site does not present itself as online eye testing, optometry advice, or prescription issuance.

## Files

- `index.html` - page structure and content.
- `styles.css` - responsive layout and visual design.
- `script.js` - product filtering, quote cart, and prescription estimate interaction.
- `assets/hero-eyewear.png` - generated project-bound hero image.

## Local preview

Open `index.html` directly in a browser, or run:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Shopify migration notes

Use this prototype as the information architecture for a Shopify build:

- Product cards become Shopify products and variants.
- The quote cart becomes the normal Shopify cart.
- The prescription panel can be implemented with product line item properties, a form app, or a custom app.
- Compliance pages should be created for prescription terms, returns, privacy, shipping, and GST/import handling.
