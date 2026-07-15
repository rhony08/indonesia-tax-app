import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth';

export function MainLayout() {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-background-gray flex flex-col">
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-semibold text-primary">
                {t('app.name')}
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm text-text-secondary hover:text-text-primary">
                {t('nav.home')}
              </Link>
              <Link to="/consultants" className="text-sm text-text-secondary hover:text-text-primary">
                {t('nav.consultants')}
              </Link>
              <Link to="/blog" className="text-sm text-text-secondary hover:text-text-primary">
                {t('nav.blog')}
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-sm text-text-secondary hover:text-text-primary">
                    {t('nav.dashboard')}
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="text-sm text-text-secondary hover:text-text-primary">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="text-sm text-text-secondary hover:text-text-primary"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/auth/register"
                    className="text-sm font-medium text-white bg-primary hover:bg-primary-hover px-4 py-2 rounded-md"
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-text-secondary">
          &copy; {new Date().getFullYear()} {t('app.name')}. {t('app.tagline')}
        </div>
      </footer>
    </div>
  );
}
