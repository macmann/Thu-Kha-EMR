import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleClick() {
    logout();
    navigate('/login');
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
    >
      Logout
    </button>
  );
}
