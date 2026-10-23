# TinyBlossom 🌸

A simple, free online baby shop. Customers browse products, add them to a cart, and send the order by text message or WhatsApp. You reply with the final total (including shipping and any sales tax). Once they approve and pay, you ship it. There's no monthly cost and no payment company in the middle.

## Running the shop: the Google Sheets

**TinyBlossom Shop** (shared as "Anyone with the link: Viewer"; the website reads it live, and changes appear within a few minutes):

- **Products tab:** one row per product. Dropdowns for Category, Status (In stock / Sold out / Coming soon / Hidden), Featured and Label. Optional columns: Sale price with Sale ends date (switches itself off), Stock left (shows "Only 2 left" and sells out at 0), Sizes, Age range, Material, Care, up to 3 photo links (gallery) and Sort order. Every column header has a note explaining it. Red cells mean something required is missing.
- **Categories tab:** the dropdown list. A new row here becomes a new category on the site.
- **Settings tab:** announcement bar, free-shipping amount, low-stock warning level, vacation mode (pauses ordering with a message), and the homepage headline and text.
- **How to use tab:** a short guide.

**TinyBlossom Orders (private):** never share this publicly. An order log with status dropdowns (New, Awaiting payment, Paid, Shipped…), auto totals, and a Summary tab showing sales collected and how much sales tax to set aside.

Don't rename tabs or row-1 headers; the website finds them by name. If the sheet can't be reached, the site shows the backup list in `products.js`.

## How an order works

1. The customer adds items, taps **Checkout**, enters their name, phone and address, and ticks the box agreeing to the Terms of Sale.
2. They tap **Send order by text message** (or WhatsApp). Their messages app opens with the order already typed out.
3. You work out the shipping (USPS/UPS/Pirate Ship calculators), add any sales tax, and text back the final total.
4. They approve and pay with Zelle, Venmo, Cash App or PayPal. Then you ship the order and text them the tracking number.

## Rarely-changed settings (in `products.js` on GitHub)

Phone numbers, email, social links, payment choices, optional free-shipping threshold (`freeShippingOver`), return window (`returnDays`) and the sheet link. The policies are in `legal.html`, and the FAQ is in `index.html`.
