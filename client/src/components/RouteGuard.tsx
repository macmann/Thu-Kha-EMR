import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import LogoutButton from './LogoutButton';

interface Props {
  children: ReactNode;
}

export default function RouteGuard({ children }: Props) {
  const { accessToken } = useAuth();
  const location = useLocation();
  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return (
    <>
      <div className="fixed top-4 right-4">
        <LogoutButton />
      </div>
      {children}
    </>
  );
}
