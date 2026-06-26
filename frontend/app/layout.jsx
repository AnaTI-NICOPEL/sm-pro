import './globals.css';
import Sidebar from '../components/Sidebar';

export const metadata = {
  title: 'SM Click Pro - Automator',
  description: 'Sistema de Envio de Mensagens',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
