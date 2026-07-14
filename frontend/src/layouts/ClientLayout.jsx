// layouts/ClientLayout.jsx
import ClientNavbar from '../components/ClientNavbar';

export default function ClientLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <ClientNavbar />
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}