import Link from 'next/link';
import LanguageToggle from './LanguageToggle';

export default function Navigation() {
  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Coupe Québec AOE2
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/register" className="hover:text-gray-300">
              Register
            </Link>
            <Link href="/players" className="hover:text-gray-300">
              Players
            </Link>
            <Link href="/brackets" className="hover:text-gray-300">
              Brackets
            </Link>
            <Link href="/admin" className="hover:text-gray-300 text-sm">
              Admin
            </Link>
            <LanguageToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
