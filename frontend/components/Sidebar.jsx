'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Activity, Download, Tag, 
  Calendar, History, ClipboardList, Settings, Send, Users, Upload
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/sellers', label: 'Vendedores', icon: Users },
    { href: '/leads', label: 'Monitoramento', icon: Activity },
    { href: '/import', label: 'Importar Contatos', icon: Download },
    { href: '/upload-tags', label: 'Upload Etiquetas', icon: Upload },
    { href: '/tags', label: 'Etiquetas', icon: Tag },
    { href: '/new', label: 'Agendar', icon: Calendar },
    { href: '/history', label: 'Histórico', icon: History },
    { href: '/logs', label: 'Logs de Envio', icon: ClipboardList },
    { href: '/settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        <Send size={24} />
        <span>SM Click Pro</span>
      </div>

      <nav className="nav-links">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
              scroll={false}
            >
              <Icon size={20} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
