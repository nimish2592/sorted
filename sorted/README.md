# Sorted

**Company paperwork, sorted.**

A calm records and compliance app for Indian Private Limited companies and their Chartered Accountants.

## Current

- UI shell (Ordo visual language) + Overview + Bills + Documents + Compliance
- Auth: email/password + optional Google Sign-In
- Admin: always `vnslabsai@gmail.com` (Settings → people with access)
- Google Drive/Sheets: **service account on the server** (not browser OAuth)

Production: [https://sorted.clipera.in](https://sorted.clipera.in)

## Develop

```bash
cd sorted
cp .env.example .env.local   # fill secrets
npm install
npm run dev
```

Default admin login (until you change `AUTH_ADMIN_PASSWORD`):

- Email: `vnslabsai@gmail.com`
- Password: `SortedAdmin!2026`

## Google setup

### A) User Google Sign-In (login button)

1. OAuth Web client redirect URIs (NextAuth):
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Prod: `https://sorted.clipera.in/api/auth/callback/google`
2. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_GOOGLE_SIGNIN=true`

### B) Backend Drive + Sheets (service account)

1. Create a service account; download JSON key
2. Set `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
3. Share Drive folder `1vw_CLVKNogs8ZhMZKBxbN04FCim6TtM9` and the Company Records sheet with that email (Editor)
4. Set `GOOGLE_DRIVE_ROOT_FOLDER_ID` and `GOOGLE_SHEETS_SPREADSHEET_ID`

Access list is stored in `data/access-users.json` locally (move to Sheets later for Vercel persistence).

## Design reference

Ordo (`revital-opendental`): Instrument Sans + DM Sans, cyan triad, `page-rail`, `surface-panel`.
