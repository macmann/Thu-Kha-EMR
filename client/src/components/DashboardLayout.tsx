import type { ComponentType, ReactNode, SVGProps } from 'react';
import { Link } from 'react-router-dom';
import {
  AvatarIcon,
  CalendarIcon,
  DashboardIcon,
  PatientsIcon,
  ReportsIcon,
  SearchIcon,
  SettingsIcon,
} from './icons';
import LogoutButton from './LogoutButton';
import { useAuth } from '../context/AuthProvider';
import { useSettings } from '../context/SettingsProvider';
import { useTranslation } from '../hooks/useTranslation';

type NavigationKey = 'dashboard' | 'patients' | 'appointments' | 'reports' | 'settings';

type NavigationItem = {
  key: NavigationKey;
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  to?: string;
};

const navigation: NavigationItem[] = [
  { key: 'dashboard', name: 'Dashboard', icon: DashboardIcon, to: '/' },
  { key: 'patients', name: 'Patients', icon: PatientsIcon, to: '/patients' },
  { key: 'appointments', name: 'Appointments', icon: CalendarIcon, to: '/appointments' },
  { key: 'reports', name: 'Reports', icon: ReportsIcon, to: '/reports' },
  { key: 'settings', name: 'Settings', icon: SettingsIcon, to: '/settings' },
];

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  activeItem?: NavigationKey;
  headerChildren?: ReactNode;
  children: ReactNode;
}

function DefaultHeaderSearch() {
  const { t } = useTranslation();
  return (
    <div className="relative w-full md:w-72">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        placeholder={t('Search patients...')}
        className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      />
    </div>
  );
}

export default function DashboardLayout({
  title,
  subtitle,
  activeItem = 'dashboard',
  headerChildren,
  children,
}: DashboardLayoutProps) {
  const { accessToken, user } = useAuth();
  const { appName, logo } = useSettings();
  const { t } = useTranslation();
  const roleLabel = user ? t(ROLE_LABELS[user.role] ?? 'Team Member') : t('Team Member');
  const navItems = navigation.filter((item) => {
    if (item.key === 'settings') {
      return user?.role === 'ITAdmin';
    }
    return true;
  });
  const displayName = appName || t('EMR System');
  const showSettings = user?.role === 'ITAdmin';
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-72 flex-col border-r border-gray-200 bg-white px-6 py-8 shadow-sm md:flex">
        <div className="text-lg font-semibold text-blue-600">{appName || t('EMR System')}</div>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <div
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  item.key === activeItem
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{t(item.name)}</span>
              </div>
            );

            if (item.to) {
              return (
                <Link key={item.key} to={item.to} className="block" aria-current={item.key === activeItem ? 'page' : undefined}>
                  {content}
                </Link>
              );
            }

            return (
              <button key={item.key} type="button" className="w-full text-left">
                {content}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <AvatarIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{user?.email ?? t('Signed-in user')}</div>
            <div className="text-xs text-gray-500">{roleLabel}</div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="border-b border-gray-200 bg-white">
          <div className="flex flex-col gap-6 px-6 py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Link to="/" className="flex items-center gap-3 text-gray-900">
                {logo ? (
                  <img src={logo} alt={`${displayName} logo`} className="h-10 w-auto rounded" />
                ) : (
                  <span className="text-xl font-semibold">{displayName}</span>
                )}
                {logo && <span className="text-xl font-semibold">{displayName}</span>}
              </Link>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                {headerChildren ?? <DefaultHeaderSearch />}
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <div className="hidden flex-col text-right text-xs text-gray-500 sm:flex">
                    <span className="font-medium text-gray-700">{user?.email ?? t('Signed-in user')}</span>
                    <span>{roleLabel}</span>
                  </div>
                  {showSettings && (
                    <Link to="/settings" className="text-sm font-medium text-blue-600 hover:underline">
                      {t('Settings')}
                    </Link>
                  )}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                    <AvatarIcon className="h-6 w-6" />
                  </div>
                  {accessToken && (
                    <LogoutButton className="text-sm font-medium text-red-600 hover:underline" />
                  )}
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

export type { NavigationKey };

const ROLE_LABELS: Record<string, string> = {
  Doctor: 'Doctor',
  AdminAssistant: 'Administrative Assistant',
  ITAdmin: 'IT Administrator',
};
