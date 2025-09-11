import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import Header from './Header';
import { useSettings } from '../context/SettingsProvider';

interface Props {
  children: ReactNode;
}

export default function RouteGuard({ children }: Props) {
  const { accessToken } = useAuth();
  const { widgetEnabled } = useSettings();
  const location = useLocation();
  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return (
    <>
      <Header />
      {children}
      {widgetEnabled && (
        <iframe
          src="https://demo.atenxion.ai/chat-widget?chatbotId=68c11a6aac23300903b7d455"
          style={{ bottom: 0, right: 0, width: '90%', height: '90%', position: 'fixed' }}
          frameBorder="0"
          allow="midi 'src'; geolocation 'src'; microphone 'src'; camera 'src'; display-capture 'src'; encrypted-media 'src';"
        ></iframe>
      )}
    </>
  );
}
