import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import { useSettings } from '../context/SettingsProvider';
import { useAuth } from '../context/AuthProvider';

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
  return (
    <header className="flex items-center justify-between bg-gray-600 px-4 py-4 text-white">
      <div className="flex items-center space-x-4">
        {logo && (
          <Link to="/">
            <img src={logo} alt="logo" className="h-16 w-auto rounded" />
          </Link>
        )}
        <span className="text-xl font-semibold">{appName}</span>
      </div>
      <div className="flex items-center space-x-4">
        {roleLabel && (
          <div className="hidden text-right text-xs text-white/80 sm:flex sm:flex-col">
            <span className="font-medium text-white">{user?.email}</span>
            <span>{roleLabel}</span>
          </div>
        )}
        {showSettings && (
          <Link to="/settings" className="text-sm hover:underline">
            Settings
          </Link>
        )}
        {accessToken && (
          <LogoutButton className="rounded bg-white/20 px-3 py-1 text-sm text-white hover:bg-white/30" />
        )}
      </div>
    </header>
  );
}
