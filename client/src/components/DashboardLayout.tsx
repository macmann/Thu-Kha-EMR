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
  { key: 'appointments', name: 'Appointments', icon: CalendarIcon },
  { key: 'reports', name: 'Reports', icon: ReportsIcon },
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
  return (
    <div className="relative w-full md:w-72">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        placeholder="Search patients..."
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
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-72 flex-col border-r border-gray-200 bg-white px-6 py-8 shadow-sm md:flex">
        <div className="text-lg font-semibold text-blue-600">EMR System</div>
        <nav className="mt-8 space-y-1">
          {navigation.map((item) => {
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
                <span>{item.name}</span>
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
            <div className="text-sm font-medium text-gray-900">Dr. Smith</div>
            <div className="text-xs text-gray-500">Administrator</div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="border-b border-gray-200 bg-white">
          <div className="flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
              {headerChildren ?? <DefaultHeaderSearch />}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                <AvatarIcon className="h-6 w-6" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

export type { NavigationKey };
