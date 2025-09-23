import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import { useSettings } from '../context/SettingsProvider';
import { useAuth } from '../context/AuthProvider';
import { AvatarIcon } from './icons';

const ROLE_DISPLAY: Record<string, string> = {
  Doctor: 'Doctor',
  AdminAssistant: 'Administrative Assistant',
  ITAdmin: 'IT Administrator',
};

export default function Header() {
  const { appName, logo } = useSettings();
  const { accessToken, user } = useAuth();
  const showSettings = user?.role === 'ITAdmin';
  const roleLabel = user ? ROLE_DISPLAY[user.role] ?? user.role : null;
  const displayName = appName || 'EMR System';
  return (
    <header className="border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col items-start gap-2">
          {logo ? (
            <Link to="/" className="flex items-center gap-3 text-gray-900">
              <img src={logo} alt="logo" className="h-12 w-auto rounded" />
              <span className="text-2xl font-semibold">{displayName}</span>
            </Link>
          ) : (
            <span className="text-2xl font-semibold text-gray-900">{displayName}</span>
          )}
        </div>
        <div className="flex items-start gap-4">
          {roleLabel && (
            <div className="hidden text-right text-xs text-gray-500 sm:flex sm:flex-col">
              <span className="font-medium text-gray-700">{user?.email}</span>
              <span>{roleLabel}</span>
            </div>
          )}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
              <AvatarIcon className="h-6 w-6" />
            </div>
            {showSettings && (
              <Link to="/settings" className="text-sm font-medium text-blue-600 hover:underline">
                Settings
              </Link>
            )}
            {accessToken && (
              <LogoutButton className="text-sm font-medium text-red-600 hover:underline" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
