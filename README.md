# TinyBlossom 🌸

A simple, free online baby shop. Customers browse products, add them to a cart, and send the order by text message or WhatsApp. You reply with the final total (including shipping and any sales tax). Once they approve and pay, you ship it. There's no monthly cost and no payment company in the middle.

## Changing products and prices: use the Google Sheet

All products live in the **TinyBlossom Products** Google Sheet. Edit it from the Google Sheets app on your phone or on a computer. The website picks up changes within a few minutes, and there's nothing to save or publish.

| Column | What to put |
|---|---|
| Product name | The name customers see |
| Category | Any word, e.g. Clothing. A new category shows up as a new filter automatically |
| Price | Just the number, e.g. `24.99` |
| Was price | Optional. Fill it in to show a crossed-out "sale" price |
| Sizes | Optional, separated by commas: `0-3m, 3-6m` |
| In stock | `Yes`, `No` (shows "Sold out") or `Hide` (removes it from the site) |
| Label | Optional little tag such as `New` or `Bestseller` |
| Description | A sentence or two |
| Photo link | Optional. Upload the photo to Google Drive, set it to "Anyone with the link", tap **Copy link**, and paste it here |
| Emoji | Shown when there's no photo |

- **Add a product:** fill in a new row.
- **Remove a product:** delete the row, or set In stock to `Hide`.
- The sheet must stay shared as **"Anyone with the link: Viewer"**, or the site can't read it. If the site ever can't reach the sheet, it shows the backup list from `products.js` instead.

## How an order works

1. The customer adds items, taps **Checkout**, enters their name, phone and address, and ticks the box agreeing to the Terms of Sale.
2. They tap **Send order by text message** (or WhatsApp). Their messages app opens with the order already typed out.
3. You work out the shipping (USPS/UPS/Pirate Ship calculators), add any sales tax, and text back the final total.
4. They approve and pay with Zelle, Venmo, Cash App or PayPal. Then you ship the order and text them the tracking number.

## Rarely-changed settings (in `products.js` on GitHub)

Phone numbers, email, social links, payment choices, optional free-shipping threshold (`freeShippingOver`), return window (`returnDays`) and the sheet link. The policies are in `legal.html`, and the FAQ is in `index.html`.
