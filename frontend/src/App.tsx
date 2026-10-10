import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/auth';
import Landing from './pages/Landing';
import { Login, Register } from './pages/Auth';
import { Spinner } from './components/ui';
import { motion } from 'framer-motion';
import { REVEAL_EASE } from './lib/motion';

// Lazy-loaded: these pull in the heavier stuff (Framer Motion-heavy
// screens, Socket.IO + Razorpay checkout on Treasury, the whole BakraWheel
// game) — bundling them all eagerly meant every visitor downloaded and
// parsed ALL of it just to see the login screen. Splitting per-route means
// a phone on a slow connection only fetches the page it's actually on.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SquadPage = lazy(() => import('./pages/SquadPage'));
const Wrapped = lazy(() => import('./pages/Wrapped'));
const TreasuryPage = lazy(() => import('./pages/TreasuryPage'));
const TripsPage = lazy(() => import('./pages/TripsPage'));
const TripDetailPage = lazy(() => import('./pages/TripDetailPage'));

// Subtle fade-in on every page navigation — before this, pages just popped
// in abruptly. Deliberately opacity-ONLY (no y/scale): a CSS transform on
// an ancestor makes every `position: fixed` descendant (the bottom nav,
// FABs, modals) position itself relative to the transformed wrapper
// instead of the viewport for the duration of the animation, which would
// cause a visible jump when it ends. Opacity doesn't create that
// containing block, so it's safe to wrap entire pages with.
const Page = ({ children }: { children: JSX.Element }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: REVEAL_EASE }}>
    {children}
  </motion.div>
);

const PageLoader = () => <main className="flex min-h-screen items-center justify-center"><Spinner /></main>;

function Protected({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const hydrate = useAuth((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Page><Landing /></Page>} />
        <Route path="/login" element={<Page><Login /></Page>} />
        <Route path="/register" element={<Page><Register /></Page>} />
        <Route path="/app" element={<Protected><Page><Dashboard /></Page></Protected>} />
        <Route path="/app/squad/:id" element={<Protected><Page><SquadPage /></Page></Protected>} />
        <Route path="/app/squad/:id/wrapped" element={<Protected><Page><Wrapped /></Page></Protected>} />
        <Route path="/app/squad/:id/treasury" element={<Protected><Page><TreasuryPage /></Page></Protected>} />
        <Route path="/app/squad/:id/trips" element={<Protected><Page><TripsPage /></Page></Protected>} />
        <Route path="/app/squad/:id/trip/:tripId" element={<Protected><Page><TripDetailPage /></Page></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
