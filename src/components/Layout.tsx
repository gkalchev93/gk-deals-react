import { useState } from 'react';
import { LayoutDashboard, Settings, LogOut, Menu, X } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
    const { signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const NavItem = ({ to, icon: Icon, children, end = false }: any) => (
        <NavLink
            to={to}
            end={end}
            onClick={closeMenu}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
            }
        >
            <Icon size={20} />
            <span className="font-medium">{children}</span>
        </NavLink>
    );

    return (
        <div className="flex min-h-screen bg-[#242424] text-white overflow-x-hidden">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1a1a1a] border-b border-gray-800 flex items-center justify-between px-6 z-40">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <img src="./pwa-192x192.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-lg shadow-blue-500/20" />
                    <span className="text-blue-400">GK Deal$</span>
                </h1>
                <button onClick={toggleMenu} className="p-2 text-gray-400 hover:text-white transition-colors">
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar Overlay (Mobile) */}
            {isMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={closeMenu}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out
                lg:relative lg:translate-x-0
                ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-gray-800 hidden lg:block">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <img src="./pwa-192x192.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-lg shadow-blue-500/20" />
                        <span className="text-blue-400">GK Deal$</span>
                    </h1>
                </div>

                <nav className="flex-1 p-4 pt-20 lg:pt-4 space-y-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">
                        Navigation
                    </div>

                    <NavItem to="/" icon={LayoutDashboard} end>Dashboard</NavItem>
                    <NavItem to="/settings" icon={Settings}>Settings</NavItem>

                    <button
                        onClick={() => {
                            signOut();
                            closeMenu();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-400 hover:bg-red-900/20 hover:text-red-500 mt-4"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </nav>

                <div className="p-4 text-xs text-gray-600 text-center">
                    v1.0.0
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 pt-16 lg:pt-0">
                <Outlet />
            </main>
        </div>
    );
}
