// ThemeSwitch.tsx

import { MoonIcon, SunIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { Switch } from './ui/switch';

function ThemeSwitch() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }, [theme]);

  const [enabled, setEnabled] = useState(theme === 'light');

  const handleThemeChange = (pEnabled: boolean) => {
    setTheme(pEnabled ? 'light' : 'dark');
    setEnabled(pEnabled);
  };

  return (
    <div className='flex items-center gap-2'>
      <MoonIcon className='h-5 w-5 text-gray-500 dark:text-gray-400' />
      <Switch
        onCheckedChange={() => handleThemeChange(!enabled)}
        aria-label='Toggle theme'
        className='relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75'
        id='theme-switch'
      >
        <span className='sr-only'>Toggle theme</span>
      </Switch>
      <SunIcon className='h-5 w-5 text-gray-500 dark:text-gray-400' />
    </div>
  );
}

export default ThemeSwitch;
