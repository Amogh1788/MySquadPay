import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { sheetSpring } from '../lib/motion';
import {
  LayoutGrid,
  Users,
  Plus,
  Landmark,
  Compass,
  Menu,
  X,
  PlusCircle,
  KeyRound,
  Wallet,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  LogOut,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { useTheme } from '../store/theme';
import {
  isSoundEnabled,
  setSoundEnabled,
  play,
  initSound,
} from '../lib/sound';

interface SquadLite {
  id: string;
  name: string;
  emoji: string;
}

// Remember the most recently opened squad.
const LAST_SQUAD_KEY = 'squadpay_last_squad';

export function rememberLastSquad(id: string) {
  localStorage.setItem(LAST_SQUAD_KEY, id);
}

function getLastSquad(): string | null {
  return localStorage.getItem(LAST_SQUAD_KEY);
}

export default function GlobalNav() {
  const nav = useNavigate();
  const loc = useLocation();

  const { logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();

  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [sheet, setSheet] = useState<'squads' | 'more' | 'add' | null>(
    null
  );
  const [squads, setSquads] = useState<SquadLite[] | null>(null);

  useEffect(() => {
    if (sheet === 'squads' && !squads) {
      api<{ squads: SquadLite[] }>('/squads')
        .then((d) => setSquads(d.squads))
        .catch(() => setSquads([]));
    }
  }, [sheet]);

  const go = (path: string) => {
    setSheet(null);
    nav(path);
  };

  const goVault = () => {
    const last = getLastSquad();

    if (last) {
      return go(`/app/squad/${last}/treasury`);
    }

    setSheet('squads');
  };

  const goTrips = () => {
    const last = getLastSquad();

    if (last) {
      return go(`/app/squad/${last}/trips`);
    }

    setSheet('squads');
  };

  const NAV_ITEMS = [
    {
      key: 'home',
      label: 'Home',
      icon: LayoutGrid,
      isFab: false,
      onClick: () => go('/app'),
    },
    {
      key: 'squads',
      label: 'Squads',
      icon: Users,
      isFab: false,
      onClick: () => setSheet('squads'),
    },
    {
      key: 'add',
      label: '',
      icon: Plus,
      isFab: true,
      onClick: () => setSheet('add'),
    },
    {
      key: 'vault',
      label: 'Vault',
      icon: Landmark,
      isFab: false,
      onClick: goVault,
    },
    {
      key: 'trips',
      label: 'Trips',
      icon: Compass,
      isFab: false,
      onClick: goTrips,
    },
    {
      key: 'more',
      label: 'More',
      icon: Menu,
      isFab: false,
      onClick: () => setSheet('more'),
    },
  ] as const;

  return (
    <>
      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:hidden">
        <div
          className="grid grid-cols-6 items-center justify-items-center rounded-2xl border border-bone/10 px-2 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          style={{
            background:
              'linear-gradient(180deg, rgba(22,19,16,0.97), rgba(14,12,10,0.99))',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            // CENTRAL PLUS BUTTON
            if (item.isFab) {
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    initSound();
                    play('tap');
                    item.onClick();
                  }}
                  aria-label="Add"
                  className="relative flex h-12 w-12 shrink-0 items-center justify-center self-center rounded-xl border border-bone/15 shadow-[0_2px_10px_rgba(255,61,110,0.2)] transition active:scale-90"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--color-marigold), var(--color-hot-pink))',
                  }}
                >
                  <Icon
                    className="h-6 w-6 text-ink-950"
                    strokeWidth={2.5}
                  />
                </button>
              );
            }

            const isActive =
              item.key === 'home' && loc.pathname === '/app';

            return (
              <button
                key={item.key}
                onClick={() => {
                  initSound();
                  play('tap');
                  item.onClick();
                }}
                className="flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 transition active:scale-95"
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? 'text-marigold' : 'text-bone/55'
                  }`}
                />

                <span
                  className={`text-[9px] font-bold uppercase tracking-wide ${
                    isActive ? 'text-marigold' : 'text-bone/45'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* SQUADS QUICK-SWITCHER */}
      <BottomSheet
        open={sheet === 'squads'}
        onClose={() => setSheet(null)}
        title="Tumhare Squads"
      >
        {!squads ? (
          <p className="py-6 text-center text-sm text-bone/50">
            Loading...
          </p>
        ) : squads.length === 0 ? (
          <p className="py-6 text-center text-sm text-bone/50">
            Koi squad nahi hai abhi — pehle ek banao ya join karo.
          </p>
        ) : (
          <div className="space-y-2">
            {squads.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  rememberLastSquad(s.id);
                  go(`/app/squad/${s.id}`);
                }}
                className="flex w-full items-center gap-3 rounded-xl bg-bone/5 p-3 text-left transition active:scale-[0.98]"
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className="font-display text-sm font-bold text-bone">
                  {s.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </BottomSheet>

      {/* ADD QUICK ACTIONS */}
      <BottomSheet
        open={sheet === 'add'}
        onClose={() => setSheet(null)}
        title="Kya karna hai?"
      >
        <div className="space-y-2">
          <button
            onClick={() => go('/app?action=create')}
            className="flex w-full items-center gap-3 rounded-xl bg-bone/5 p-3.5 text-left"
          >
            <PlusCircle className="h-5 w-5 text-marigold" />
            <span className="font-display text-sm font-bold text-bone">
              Naya Squad Banao
            </span>
          </button>

          <button
            onClick={() => go('/app?action=join')}
            className="flex w-full items-center gap-3 rounded-xl bg-bone/5 p-3.5 text-left"
          >
            <KeyRound className="h-5 w-5 text-aqua" />
            <span className="font-display text-sm font-bold text-bone">
              Invite Code se Join Karo
            </span>
          </button>

          {getLastSquad() && (
            <button
              onClick={() =>
                go(`/app/squad/${getLastSquad()}?action=add-expense`)
              }
              className="flex w-full items-center gap-3 rounded-xl bg-bone/5 p-3.5 text-left"
            >
              <Wallet className="h-5 w-5 text-lime" />
              <span className="font-display text-sm font-bold text-bone">
                Kharcha Add Karo
              </span>
            </button>
          )}
        </div>
      </BottomSheet>

      {/* MORE MENU */}
      <BottomSheet
        open={sheet === 'more'}
        onClose={() => setSheet(null)}
        title="More"
      >
        <div className="space-y-2">
          <button
            onClick={() => go('/app')}
            className="flex w-full items-center gap-3 rounded-xl bg-bone/5 p-3.5 text-left"
          >
            <Wallet className="h-5 w-5 text-lime" />
            <span className="font-display text-sm font-bold text-bone">
              Personal Finance
            </span>
          </button>

          <button
            onClick={() => toggleTheme()}
            className="flex w-full items-center justify-between rounded-xl bg-bone/5 p-3.5"
          >
            <span className="flex items-center gap-3 font-display text-sm font-bold text-bone">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              Theme
            </span>

            <span className="text-xs font-bold text-bone/50">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>

          <button
            onClick={() => {
              const v = !soundOn;
              setSoundOn(v);
              setSoundEnabled(v);

              if (v) {
                initSound();
                play('toggle');
              }
            }}
            className="flex w-full items-center justify-between rounded-xl bg-bone/5 p-3.5"
          >
            <span className="flex items-center gap-3 font-display text-sm font-bold text-bone">
              {soundOn ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
              Sound
            </span>

            <span className="text-xs font-bold text-bone/50">
              {soundOn ? 'On' : 'Off'}
            </span>
          </button>

          <button
            onClick={() => {
              logout();
              nav('/');
            }}
            className="flex w-full items-center gap-3 rounded-xl bg-hot-pink/10 p-3.5 text-left"
          >
            <LogOut className="h-5 w-5 text-hot-pink" />
            <span className="font-display text-sm font-bold text-hot-pink">
              Logout
            </span>
          </button>
        </div>
      </BottomSheet>
    </>
  );
}

function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={sheetSpring}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[75vh] max-w-lg overflow-y-auto rounded-t-3xl border-2 border-b-0 border-bone/15 bg-ink-900 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display font-extrabold text-bone">
                {title}
              </h3>

              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-bone/50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}