# TinyBlossom 🌸

A simple, free online baby shop. Customers browse products, add them to a cart, and send the order to you on WhatsApp (or email). You confirm the order and deliver. There's no monthly cost and no payment company in the middle.

## Changing things (no coding needed)

Everything you'll normally change is in **`products.js`**. You can edit it right on github.com: open the file, click the ✏️ pencil, make your change, then click **Commit changes**. The live site updates within about a minute.

- **Your WhatsApp number:** change `whatsapp: "9779800000000"` to your number. Use the country code and digits only, with no `+`, spaces or dashes.
- **Email, location, Instagram/Facebook:** right below that.
- **Currency and delivery fee:** `currency`, `deliveryFee`, `freeDeliveryOver`.
- **Products:** each product is a block between `{ }`. To add one, copy a whole block, paste it, and change the details. Give each product a unique `id`.
- **Sold out:** set `inStock: false`.
- **Sale price:** add `oldPrice: 1800,` and the old price shows crossed out.

## Adding real photos

1. On github.com, open the `images` folder and choose **Add file → Upload files**.
2. Upload a square photo, for example `onesie.jpg`. Keep each one under about 300 KB. You can shrink photos for free at squoosh.app.
3. In `products.js`, set that product's image: `image: "images/onesie.jpg",`

## How an order works

1. The customer adds items, taps **Checkout**, and enters their name, phone and address.
2. They tap **Send order on WhatsApp**. WhatsApp opens with the full order already typed out.
3. You get the message, confirm it, and arrange delivery and payment (cash on delivery, or share your payment QR).
