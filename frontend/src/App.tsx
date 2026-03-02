import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import WhyChooseSection from './components/WhyChooseSection';
import FeaturedProjects from './components/FeaturedProjects';
import ArtworkGallery from './components/ArtworkGallery';
import ContactSection from './components/ContactSection';
import QRSection from './components/QRSection';
import Footer from './components/Footer';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';

const queryClient = new QueryClient();

// ─── Layout ───────────────────────────────────────────────────────────────────

function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

// ─── Portfolio Page ───────────────────────────────────────────────────────────

function PortfolioPage() {
  return (
    <div className="min-h-screen font-poppins">
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <WhyChooseSection />
        <FeaturedProjects />
        <ArtworkGallery />
        <QRSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

// ─── Routes ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: PortfolioPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin-login',
  component: AdminLogin,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPanel,
});

const routeTree = rootRoute.addChildren([indexRoute, adminLoginRoute, adminRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return <RouterProvider router={router} />;
}
