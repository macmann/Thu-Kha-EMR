import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import { useSettings } from '../context/SettingsProvider';
import { useAuth } from '../context/AuthProvider';

export default function Header() {
  const { appName, logo } = useSettings();
  const { accessToken } = useAuth();
  return (
    <header className="flex items-center justify-between bg-blue-600 px-4 py-2 text-white">
      <div className="flex items-center">
        {logo && (
          <img src={logo} alt="logo" className="mr-2 h-8 w-8 rounded" />
        )}
        <span className="text-lg font-semibold">{appName}</span>
      </div>
      <div className="flex items-center space-x-4">
        <Link to="/settings" className="text-sm hover:underline">
          Settings
        </Link>
        {accessToken && (
          <LogoutButton className="rounded bg-white/20 px-3 py-1 text-sm text-white hover:bg-white/30" />
        )}
      </div>
    </header>
  );
}
