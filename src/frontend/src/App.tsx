import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-primary mb-4">
        Welcome to Crudibase
      </h1>
      <p className="text-lg text-slate-600 mb-8">
        Explore Wikibase knowledge graphs with ease
      </p>
      <div className="flex gap-4">
        <Link to="/login" className="btn-primary">
          Sign In
        </Link>
        <Link to="/register" className="btn-secondary">
          Get Started
        </Link>
      </div>
    </div>
  );
}

function LoginPage() {
  return <LoginForm />;
}

function RegisterPage() {
  return <RegisterForm />;
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
      <p className="text-xl text-slate-600 mb-8">Page not found</p>
      <Link to="/" className="btn-primary">
        Go Home
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
