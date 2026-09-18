# AstroMystic 🌟

> **Practical Love Astrology** — A full-stack astrology platform combining astronomical calculations with personal relationship and natal chart readings, secure bookings, client dashboards, and administrator fulfillment tools.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-FFA611?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe)](https://stripe.com/)
[![Resend](https://img.shields.io/badge/Resend-Email-black?style=flat-square&logo=resend)](https://resend.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 🔮 Overview

AstroMystic is designed to bridge ancient celestial wisdom with practical, grounded guidance. It provides an intuitive interface for clients to generate natal charts, book specialized astrology readings (Natal, Synastry, Transit, and Composite), and view their fulfilled personalized video readings in a private member portal.

---

## ✨ Key Features

- **Astronomical Precision Calculations**: Calculates accurate planet positions (Sun, Moon, Rising, Mercury, Venus, Mars, Jupiter, Saturn) and whole-sign astrological houses using `astronomy-engine` and `luxon`.
- **Global City Geocoding**: Autocomplete and coordinates resolution via OpenStreetMap Nominatim with persistent Cloud Firestore caching.
- **Interactive Chart Visualizer**: Beautiful visual display with planetary placements, zodiac degrees, and house positions.
- **Client Reading Portal**: Private member dashboard where clients view their reading library and watch personalized video sessions.
- **Stripe Checkout Integration**: Seamless payment flows for single sessions, synastry deep dives, and composite charts.
- **Stripe Webhooks**: Automatic database provisioning and order receipt dispatch upon verified checkout completion.
- **Email Notifications via Resend**: Beautiful HTML-formatted emails for client payment receipts and administrator order alerts.
- **Admin Mission Control**: Dedicated dashboard for viewing pending client requests, fulfilling readings with video links, generating standalone charts, and communicating with clients.
- **Cosmic Day & Night Themes**: Elegant Sun and Moon theme switcher with customized astronomy visual aesthetics.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **Frontend Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Authentication & Database** | [Firebase Authentication](https://firebase.google.com/) & [Cloud Firestore](https://firebase.google.com/docs/firestore) |
| **Server Admin SDK** | [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) |
| **Payments** | [Stripe](https://stripe.com/) |
| **Email Delivery** | [Resend](https://resend.com/) |
| **Ephemeris / Astronomy** | [astronomy-engine](https://github.com/cosinekitty/astronomy) |
| **Time & Timezones** | [Luxon](https://moment.github.io/luxon/) |
| **Analytics** | [Mixpanel](https://mixpanel.com/) |

---

## 📁 Repository Structure

```text
astromystic/
├── .gitignore                   # Root gitignore excluding local configs, node_modules, and logs
├── .env.example                 # Safe environment variables template
├── LICENSE                      # MIT License
├── README.md                    # Project documentation
├── SECURITY.md                  # Security policy and disclosure
├── CONTRIBUTING.md              # Contribution guidelines
└── astromystic/                 # Next.js Application Root
    ├── app/                     # Next.js App Router
    │   ├── layout.tsx           # Root layout & font configurations
    │   ├── page.tsx             # Landing homepage
    │   ├── about/               # About page
    │   ├── admin/               # Administrator Mission Control dashboard
    │   ├── dashboard/           # Client member portal
    │   └── api/                 # Backend API endpoints
    │       ├── admin/           # Admin routes (charts, assignments, email, users)
    │       ├── booking/         # Reading request creation & credit redemptions
    │       ├── chart/           # Natal chart calculations
    │       ├── contact/         # Contact form handler
    │       ├── stripe/          # Stripe checkout & webhook handler
    │       └── users/           # User profile synchronization & roles
    ├── components/              # Reusable React components
    │   ├── admin/               # Admin chart modal and manager
    │   ├── dashboard/           # Booking modal, reading lists, chart views
    │   └── sections/            # Landing page sections (Hero, Services, About, Contact)
    ├── context/                 # React Context providers (ThemeContext)
    ├── lib/                     # Utilities & Service Integrations
    │   ├── astrologyService.ts  # Planet & house calculations via astronomy-engine
    │   ├── firebase.ts          # Client Firebase initialization
    │   ├── firebase-admin.ts    # Server Firebase Admin initialization
    │   ├── mixpanel.ts          # Mixpanel analytics tracking
    │   └── stripe-config.ts     # Stripe Price ID mappings
    └── public/                  # Static assets and icons
```

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: Version 18.18 or higher (Node.js 20+ recommended)
- **npm** or **pnpm** / **yarn**
- A **Firebase** project with Authentication and Cloud Firestore enabled
- A **Stripe** account for payment processing
- A **Resend** account for sending transactional emails

### 2. Clone the Repository

```bash
git clone https://github.com/sujeethiremath/astromystic.git
cd astromystic/astromystic
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Open `.env.local` and configure your keys (see [Environment Variables](#-environment-variables) below).

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🔑 Environment Variables

The application requires the following environment variables. None of these should ever be committed to version control.

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | Client / Server | Base application URL (e.g. `http://localhost:3000` or production domain) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client (Public) | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client (Public) | Firebase Auth domain (`project-id.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client (Public) | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Client (Public) | Firebase Storage bucket URL |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`| Client (Public) | Firebase Messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client (Public) | Firebase Web App ID |
| `NEXT_PUBLIC_MIXPANEL_TOKEN` | Client (Public) | Mixpanel analytics project token (optional) |
| `FIREBASE_CLIENT_EMAIL` | Server (Private) | Firebase Admin service account client email |
| `FIREBASE_PRIVATE_KEY` | Server (Private) | Firebase Admin private key (`\n` escaped) |
| `STRIPE_SECRET_KEY` | Server (Private) | Stripe Secret Key (`sk_test_...` or `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Server (Private) | Stripe Webhook Secret (`whsec_...`) |
| `RESEND_API_KEY` | Server (Private) | Resend API key (`re_...`) |
| `ADMIN_EMAILS` | Server (Private) | Comma-separated email addresses authorized for admin access |
| `CONTACT_EMAIL` | Server (Private) | Destination email for contact form submissions |
| `ADMIN_REPLY_TO_EMAIL` | Server (Private) | Reply-To address for client transaction emails |

---

## 🔒 Security & Admin Access

- **Admin Dashboard**: Located at `/admin`.
- **Authorization**: Access requires authenticated login via Firebase Auth. The backend verifies the Firebase ID token and checks whether the email matches the `ADMIN_EMAILS` environment variable or has `role: "admin"` in Cloud Firestore.
- **Stripe Webhooks**: Signed using `stripe.webhooks.constructEvent` to verify request authenticity and prevent replay attacks.
- For security vulnerabilities, please refer to [SECURITY.md](SECURITY.md).

---

## 📦 Production Build & Deployment

To verify and produce an optimized production build:

```bash
npm run build
npm run start
```

### Deploying to Vercel

1. Import the repository into [Vercel](https://vercel.com).
2. Set the **Root Directory** to `astromystic`.
3. In the project settings, add all required environment variables under **Settings → Environment Variables**.
4. Deploy!

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) for details on our workflow and branch guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
