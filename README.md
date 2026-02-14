# Valentine App for Swagata ❤️

A cute, funny, mobile-friendly Next.js app with:
- A `Yes` button that shows a sweet popup message for Swagata.
- A `No` button that runs away when someone tries to click it.
- Confetti celebration on `Yes`.
- Optional background music toggle.
- Custom photo support with GIF fallback.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Personalize It

Add optional files in `/public`:
- `/public/swagata.jpg` for Swagata's photo in the popup.
- `/public/love-song.mp3` for background music via the music toggle.

If `swagata.jpg` is missing, the app automatically shows the funny GIF fallback.

## Deploy so anyone can access it (Recommended: Vercel)

1. Push this project to GitHub.
2. Go to [https://vercel.com/new](https://vercel.com/new).
3. Import the repo.
4. Click **Deploy**.
5. Share the generated URL (for example: `https://your-app.vercel.app`).

Vercel is the smoothest option for Next.js and needs no backend setup here.
