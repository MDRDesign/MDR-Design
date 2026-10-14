import { useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Shell } from '@/components/Layout';
import { Intro, RouteWipe, ScrollProgress } from '@/components/Chrome';
import Home from '@/pages/Home';
import WizFix from '@/pages/WizFix';
import Process from '@/pages/Process';
import Services from '@/pages/Services';
import Contact from '@/pages/Contact';
import Preview from '@/pages/Preview';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function ScrollTop() {
  const [loc] = useLocation();
  useEffect(() => { if (!window.location.hash) window.scrollTo(0, 0); }, [loc]);
  return null;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router() {
  const [loc] = useLocation();
  if (loc.startsWith('/preview/')) {
    return (
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/preview/:slug" component={Preview} />
        </Switch>
      </RoutedErrorBoundary>
    );
  }
  return (
    <Shell>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/work/wizfix" component={WizFix} />
          <Route path="/process" component={Process} />
          <Route path="/services" component={Services} />
          <Route path="/contact" component={Contact} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <ScrollTop />
        <Router />
        <ScrollProgress />
        <RouteWipe />
        <Intro />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
