import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
// Tailwind — imported once here (not inside App.tsx) so it reaches both
// lazy-loaded routes; App and Landing are separate bundles that don't
// otherwise share any common module.
import './index.css';

// No router library — this is the entire routing surface the project needs:
// "/app" (and anything under it) is the real Stellora experience, everything
// else is the marketing landing page. A plain <a href> between them does a
// full navigation, which is fine here (landing → app is a one-way handoff,
// not an in-app transition) and needs no SPA history wiring.
//
// Lazy-loaded so a landing-page visitor's bundle doesn't include Three.js/
// R3F/postprocessing (the app's dependencies) at all, and an app visitor's
// bundle doesn't include landing-only code — each route only ships what it
// actually renders.
const App = lazy(() => import('./App'));
const Landing = lazy(() => import('./Landing'));

const isAppRoute = window.location.pathname.startsWith('/app');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={null}>{isAppRoute ? <App /> : <Landing />}</Suspense>
  </React.StrictMode>
);
