# TinyBlossom 🌸

A simple, free online baby shop. Customers browse products, add them to a cart, and send the order to you by text message or WhatsApp. You confirm the order and ship it. There's no monthly cost and no payment company in the middle.

## Changing things (no coding needed)

Everything you'll normally change is in **`products.js`**. You can edit it right on github.com: open the file, click the ✏️ pencil, make your change, then click **Commit changes**. The live site updates within about a minute.

- **Phone numbers:** `whatsapp` (digits only, starting with 1) and `sms` (starts with `+1`). Set either one to `""` to hide that button.
- **Email, location, Instagram/Facebook:** right below that.
- **Shipping charge:** `deliveryFee: 5.99` is added to every order. `freeDeliveryOver: 50` makes orders of $50 or more ship free. For always-free shipping, set `deliveryFee: 0`. To always charge shipping, set `freeDeliveryOver: 0`.
- **Payment choices at checkout:** `paymentOptions`.
- **FAQ, shipping times and return policy text:** these are in `index.html`. Search the file for the sentence you want to change.
- **Products:** each product is a block between `{ }`. To add one, copy a whole block, paste it, and change the details. Give each product a unique `id`.
- **Sold out:** set `inStock: false`.
- **Sale price:** add `oldPrice: 29.99,` and the old price shows crossed out.

## Adding real photos

1. On github.com, open the `images` folder and choose **Add file → Upload files**.
2. Upload a square photo, for example `onesie.jpg`. Keep each one under about 300 KB. You can shrink photos for free at squoosh.app.
3. In `products.js`, set that product's image: `image: "images/onesie.jpg",`

## How an order works

1. The customer adds items, taps **Checkout**, and enters their name, phone and address.
2. They tap **Send order by text message** (or WhatsApp). Their messages app opens with the full order already typed out, and they hit send.
3. You get the text, reply to confirm, and send your Zelle/Venmo/PayPal details.
4. Once they've paid, you ship the order and text them the tracking number.
