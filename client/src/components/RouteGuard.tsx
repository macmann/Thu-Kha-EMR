import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import Header from './Header';

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
      <Header />
      {children}
    </>
  );
}
