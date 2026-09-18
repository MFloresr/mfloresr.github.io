# mfloresr.github.io

Personal portfolio of Mario Flores Rodríguez — full-stack web developer.

Built with [Next.js](https://nextjs.org) (App Router, TypeScript). The
"Proyectos" section fetches live data from the GitHub API (featured repo
stats + most recently pushed repos) with hourly ISR revalidation, so new
repos show up automatically without editing the site.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

## Deploy

Deployed on [Vercel](https://vercel.com). Push to `master` and Vercel
builds and deploys automatically (or run `vercel --prod`).

> Note: since this now requires a Node runtime (Server Components + ISR),
> it can no longer be served as static files via GitHub Pages.
