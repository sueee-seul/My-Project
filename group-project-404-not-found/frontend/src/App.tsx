import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, BookOpen, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

// Real Page Components
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import CourseListPage from './pages/CourseListPage';
import CourseDetailPage from './pages/CourseDetailPage';
import MaterialsMarketPage from './pages/MaterialsMarketPage';
import MarketPlacePage from './pages/MarketPlacePage';
import MarketPlaceDetailPage from './pages/MarketPlaceDetailPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import UploadMaterialPage from './pages/UploadMaterialPage';
import CreateListingPage from './pages/CreateListingPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const DEFAULT_AVATARS = [
  `${API_BASE_URL}/images/Asset 2.png`,
  `${API_BASE_URL}/images/Asset 3.png`,
  `${API_BASE_URL}/images/Asset 4.png`,
  `${API_BASE_URL}/images/Asset 6.png`,
  `${API_BASE_URL}/images/Asset 7.png`,
];

function getRandomAvatar(email?: string) {
  if (!email) return DEFAULT_AVATARS[0];
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[index];
}

type CurrentUser = {
  id: number;
  email: string;
  firstname?: string;
  lastname?: string;
  creditBalance?: number;
  avatarUrl?: string;
  upi?: string;
  is_admin?: number;
};

function Navbar({
  currentUser,
  onLogout,
}: {
  currentUser: CurrentUser | null;
  onLogout: () => Promise<void>;
}) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  if (isAuthPage) return null;

  const isLoggedIn = Boolean(currentUser);
  const initials = `${currentUser?.firstname?.[0] ?? ''}${currentUser?.lastname?.[0] ?? ''}`.trim() || currentUser?.email?.[0]?.toUpperCase() || 'U';

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-black text-white p-1.5 rounded-md">
                <BookOpen size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight">UoA Swap</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link to="/materials" className="hover:text-black transition-colors">Materials</Link>
              <Link to="/courses" className="hover:text-black transition-colors">Courses</Link>
              <Link to="/marketplace" className="hover:text-black transition-colors">Market Place</Link>
              {currentUser?.is_admin === 1 && (
                <Link to="/admin" className="flex items-center gap-1 text-purple-600 hover:text-purple-800 transition-colors font-bold">
                  <Settings size={14} />
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium">
                  <ShoppingBag size={16} />
                  <span>{(currentUser?.creditBalance ?? 0).toLocaleString()} pts</span>
                </div>

                <Button variant="ghost" className="text-sm font-medium" onClick={onLogout}>
                  Log out
                </Button>
                <Link to="/profile">
                  <Avatar className="h-9 w-9 border cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage src={currentUser?.avatarUrl || getRandomAvatar(currentUser?.email)} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth">
                  <Button variant="ghost" className="text-sm font-medium">Log in</Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button className="text-sm font-medium bg-black text-white hover:bg-gray-800">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  const location = useLocation();
  if (location.pathname === '/auth') return null;

  return (
    <footer className="bg-white border-t py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-black text-white p-1.5 rounded-md">
                <BookOpen size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight">UoA Swap</span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs">
              Campus marketplace connecting students with course materials, electronics and stationery linked to courses.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-4">Explore</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/materials" className="hover:text-black">Materials</Link></li>
              <li><Link to="/courses" className="hover:text-black">Courses</Link></li>
              <li><Link to="/marketplace" className="hover:text-black">Market Place</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-4">About</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/#about" className="hover:text-black">About UoA Swap</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-4">Help</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="mailto:admin@example.com?subject=Report%20an%20Issue" className="hover:text-black">Report</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            UoA Swap • University of Auckland student marketplace — Terms & Privacy
          </p>

        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/me`, {
          credentials: 'include',
        });

        if (!response.ok) {
          setCurrentUser(null);
          return;
        }

        const profile = await response.json();
        setCurrentUser(profile);
      } catch {
        setCurrentUser(null);
      }
    };

    const handleProfileUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<CurrentUser>;
      setCurrentUser(customEvent.detail);
    };

    void loadCurrentUser();

    window.addEventListener('profile-updated', handleProfileUpdated as EventListener);

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdated as EventListener);
    };
  }, []);

  const handleAuthSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setCurrentUser(null);
      window.location.href = '/';
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-sans">
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage currentUser={currentUser} />} />
            <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
            <Route path="/courses" element={<CourseListPage />} />
            <Route path="/course/:id" element={<CourseDetailPage />} />
            <Route path="/materials" element={<MaterialsMarketPage />} />
            <Route path="/marketplace" element={<MarketPlacePage />} />
            <Route path="/marketplace/:id" element={<MarketPlaceDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/upload" element={<UploadMaterialPage />} />
            <Route path="/create-listing" element={<CreateListingPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
