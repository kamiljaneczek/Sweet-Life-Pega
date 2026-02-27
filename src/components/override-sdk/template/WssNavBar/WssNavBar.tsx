import { logout } from '@pega/auth/lib/sdk-auth-manager';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { Menu as MenuIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import './WssNavBar.css';

interface WssNavBarProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  appInfo: any;
  navLinks: any[];
  operator: { currentUserInitials: string };
  navDisplayOptions: { alignment: string; position: string };

  portalName: string;
  imageSrc: string;

  fullImageSrc: string;
  appName: any;
}

export default function WssNavBar(props: WssNavBarProps) {
  const { appInfo, navLinks, operator, navDisplayOptions } = props;
  const { alignment, position } = navDisplayOptions;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  const localizedVal = PCore.getLocaleUtils().getLocaleValue;
  const localeCategory = 'AppShell';

  const handleToggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleToggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleCloseUserMenu = () => {
    setUserMenuOpen(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    if (!mobileMenuOpen && !userMenuOpen) return undefined;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        mobileButtonRef.current &&
        !mobileButtonRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
      if (
        userMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen, userMenuOpen]);

  const navLinksContent = (
    <div id='nav-links' className='hidden md:flex flex-grow' style={{ justifyContent: alignment }}>
      {navLinks.map((link) => (
        <button type='button' className='link-style' key={link.text} onClick={link.onClick}>
          {link.text}
        </button>
      ))}
    </div>
  );

  return (
    <div id='NavBar' className='nav-bar'>
      <nav className='bg-primary'>
        <div className='max-w-screen-xl mx-auto px-4'>
          <div className='flex items-center justify-between' style={{ minHeight: '64px' }}>
            <button
              type='button'
              id='appName'
              className='flex items-center capitalize bg-transparent border-none cursor-pointer'
              onClick={appInfo.onClick}
            >
              <img src={appInfo.imageSrc} className='w-[3.6rem]' alt='app logo' />
              <span className='text-white ml-4 mr-8 text-2xl'>{appInfo.appName}</span>
            </button>

            {/* Mobile menu button */}
            <div className='flex md:hidden relative'>
              <button
                ref={mobileButtonRef}
                type='button'
                className='p-2 text-white bg-transparent border-none cursor-pointer rounded hover:bg-white/10'
                aria-label='account of current user'
                aria-controls='menu-appbar'
                aria-haspopup='true'
                onClick={handleToggleMobileMenu}
              >
                <MenuIcon size={24} />
              </button>
              {mobileMenuOpen && (
                <div
                  ref={mobileMenuRef}
                  id='menu-appbar'
                  className='absolute top-full left-0 z-50 bg-white rounded shadow-lg border border-gray-200 py-1 min-w-[160px]'
                >
                  <ul className='m-0 p-0 list-none'>
                    {navLinks.map((link) => (
                      <li
                        key={link.text}
                        className='px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-900'
                        onClick={() => {
                          link.onClick();
                          handleCloseMobileMenu();
                        }}
                      >
                        <span>{link.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {position === 'inline' && <>{navLinksContent}</>}

            {/* User avatar and menu */}
            <div className='flex-shrink-0 relative'>
              <button
                ref={userButtonRef}
                type='button'
                className='p-1 bg-transparent border-none cursor-pointer rounded-full'
                onClick={handleToggleUserMenu}
              >
                <span className='inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-400 text-white text-sm font-medium'>
                  {operator.currentUserInitials}
                </span>
              </button>
              {userMenuOpen && (
                <div
                  ref={userMenuRef}
                  className='absolute right-0 top-full z-50 bg-white rounded shadow-lg border border-gray-200 py-1 min-w-[160px]'
                >
                  <ul className='m-0 p-0 list-none'>
                    <li
                      className='px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-900'
                      onClick={() => {
                        logout();
                        handleCloseUserMenu();
                      }}
                    >
                      <span>{localizedVal('Log off', localeCategory)}</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          {position === 'below' && <>{navLinksContent}</>}
        </div>
      </nav>
    </div>
  );
}
