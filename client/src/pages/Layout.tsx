import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">ASH</span>
              </div>
              <span className="hidden sm:inline font-bold text-lg">Houra Sports & Divertissements</span>
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={`${menuOpen ? 'block' : 'hidden'} md:flex md:items-center md:space-x-6 absolute md:relative top-16 md:top-0 left-0 right-0 md:left-auto md:right-auto bg-white md:bg-transparent`}>
              <nav className="flex flex-col md:flex-row md:space-x-6 p-4 md:p-0">
                <Link to="/" className="text-gray-600 hover:text-gray-900 py-2 md:py-0">Accueil</Link>
                <Link to="/about" className="text-gray-600 hover:text-gray-900 py-2 md:py-0">À propos</Link>
                <Link to="/activities" className="text-gray-600 hover:text-gray-900 py-2 md:py-0">Activités</Link>
                <Link to="/contact" className="text-gray-600 hover:text-gray-900 py-2 md:py-0">Contact</Link>
              </nav>

              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 pt-4 md:pt-0 border-t md:border-t-0">
                {user ? (
                  <>
                    <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 py-2 md:py-0">Dashboard</Link>
                    <span className="text-sm text-gray-600 py-2 md:py-0">{user.first_name}</span>
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      size="sm"
                      className="justify-start md:justify-center py-2 md:py-1"
                    >
                      <LogOut size={16} className="mr-2" />
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="outline" size="sm" className="w-full md:w-auto">Login</Button>
                    </Link>
                    <Link to="/register">
                      <Button size="sm" className="w-full md:w-auto">Enregister</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-gray-900 text-gray-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">Association Sportive Houra</h3>
              <p className="text-sm">Association sportive de premier plan proposant des activités et des entraînements de qualité.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Liens rapides</h4>
              <ul className="text-sm space-y-2">
                <li><Link to="/about" className="hover:text-white">À propos de nous</Link></li>
                <li><Link to="/activities" className="hover:text-white">Activités</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <p className="text-sm">Email: contact@association-houra.dz</p>
              <p className="text-sm">Phone: +213 (0) 5 53 41 94 05</p>
              <p className="text-sm">Village Houra Commune Bouzeguene 15140, Tizi-Ouzou</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Association Sportive Houra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
