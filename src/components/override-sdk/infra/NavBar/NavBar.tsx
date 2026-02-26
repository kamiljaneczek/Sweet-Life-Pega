import { useEffect, useRef, useState } from 'react';
import { User, ChevronLeft, ChevronRight, Flag, Home, ChevronUp, ChevronDown, Plus, Briefcase, X, ArrowLeft } from 'lucide-react';
import { logout } from '@pega/auth/lib/sdk-auth-manager';

import { useNavBar } from '@pega/react-sdk-components/lib/components/helpers/reactContextHelpers';
import { Utils } from '@pega/react-sdk-components/lib/components/helpers/utils';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';

import './NavBar.css';

interface NavBarProps extends PConnProps {
  // If any, enter additional props that only exist on this component

  appName?: string;
  pages?: any[];
  caseTypes: any[];
  pConn?: any;
}

const iconMap = {
  'pi pi-headline': <Home size={28} />,
  'pi pi-flag-solid': <Flag size={28} />,
  'pi pi-home-solid': <Home size={28} />
};

const DRAWER_WIDTH_OPEN = '300px';
const DRAWER_WIDTH_CLOSED_MD = '72px';
const DRAWER_WIDTH_CLOSED = '56px';

export default function NavBar(props: NavBarProps) {
  const { pConn, pages = [], caseTypes = [] } = props;

  const [isDesktop, setIsDesktop] = useState(window.matchMedia('(min-width: 768px)').matches);

  const { open, setOpen } = useNavBar();
  const [navPages, setNavPages] = useState(JSON.parse(JSON.stringify(pages)));
  const [bShowCaseTypes, setBShowCaseTypes] = useState(true);
  const [bShowOperatorButtons, setBShowOperatorButtons] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const operatorButtonRef = useRef<HTMLLIElement>(null);
  const localeUtils = PCore.getLocaleUtils();
  const localeReference = pConn.getValue('.pyLocaleReference');

  const localizedVal = PCore.getLocaleUtils().getLocaleValue;
  const localeCategory = 'AppShell';

  const portalLogoImage = Utils.getIconPath(Utils.getSDKStaticConentUrl()).concat('pzpega-logo-mark.svg');
  const portalOperator = PCore.getEnvironmentInfo().getOperatorName();
  const portalApp = PCore.getEnvironmentInfo().getApplicationLabel();

  useEffect(() => {
    setNavPages(JSON.parse(JSON.stringify(pages)));
  }, [pages]);

  // Replace useMediaQuery with window.matchMedia listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!bShowOperatorButtons) return undefined;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        operatorButtonRef.current &&
        !operatorButtonRef.current.contains(e.target as Node)
      ) {
        setBShowOperatorButtons(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [bShowOperatorButtons]);

  function navPanelButtonClick(oPageData: any) {
    const { pyClassName, pyRuleName } = oPageData;

    pConn
      .getActionsApi()
      .showPage(pyRuleName, pyClassName)
      .then(() => {
        console.log(`${localizedVal('showPage completed', localeCategory)}`);
      });
  }

  function navPanelCreateCaseType(sCaseType: string, sFlowType: string) {
    setOpen(false);
    const actionInfo = {
      containerName: 'primary',
      flowType: sFlowType || 'pyStartCase'
    };

    pConn
      .getActionsApi()
      .createWork(sCaseType, actionInfo)
      .then(() => {
        console.log(`${localizedVal('createWork completed', localeCategory)}`);
      });
  }

  // Toggle showing the Operator buttons
  function navPanelOperatorButtonClick() {
    setBShowOperatorButtons(!bShowOperatorButtons);
  }

  const handleDrawerOpen = () => {
    setOpen(!open);
  };

  const handleCaseItemClick = () => {
    if (!open) {
      setOpen(true);
      setBShowCaseTypes(true);
    } else setBShowCaseTypes(!bShowCaseTypes);
  };

  useEffect(() => {
    if (!isDesktop) setOpen(false);
    else setOpen(true);
  }, [isDesktop]);

  const drawerWidth = open ? DRAWER_WIDTH_OPEN : isDesktop ? DRAWER_WIDTH_CLOSED_MD : DRAWER_WIDTH_CLOSED;

  return (
    <aside
      className='relative flex flex-col h-screen whitespace-nowrap transition-[width] duration-200 ease-in-out bg-white border-r border-gray-200'
      style={{ width: drawerWidth, overflow: open ? undefined : 'hidden' }}
    >
      {open ? (
        <ul className='m-0 p-0 list-none bg-primary text-primary-foreground'>
          <li className='flex items-center px-4 py-2 cursor-pointer' onClick={handleDrawerOpen}>
            <span className='flex-shrink-0 mr-2'>
              <img src={portalLogoImage} className='w-[3.6rem]' alt='logo' />
            </span>
            <span className='flex-grow min-w-0'>
              <h6 className='text-base font-medium whitespace-normal m-0'>{portalApp}</h6>
            </span>
            <span className='flex-shrink-0 ml-auto'>
              <button type='button' className='p-1 rounded-full hover:bg-primary-foreground/20 text-primary-foreground' onClick={handleDrawerOpen}>
                <ChevronLeft size={24} />
              </button>
            </span>
          </li>
        </ul>
      ) : (
        <div className='bg-primary text-primary-foreground py-4 flex items-center justify-center cursor-pointer' onClick={handleDrawerOpen}>
          <ChevronRight size={28} id='chevron-right-icon' />
        </div>
      )}
      <ul className='m-0 p-0 list-none'>
        <li className='flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100' onClick={handleCaseItemClick}>
          <span className='flex-shrink-0 min-w-[40px]'>{bShowCaseTypes && open ? <X size={28} /> : <Plus size={28} />}</span>
          <span className='flex-grow'>Create</span>
          {bShowCaseTypes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </li>
      </ul>
      {bShowCaseTypes && open && (
        <div className='scrollable transition-all duration-200'>
          <ul className='m-0 p-0 list-none'>
            {caseTypes.map(caseType => (
              <li
                className='flex items-center pl-8 pr-4 py-2 cursor-pointer hover:bg-gray-100'
                onClick={() => navPanelCreateCaseType(caseType.pyClassName, caseType.pyFlowType)}
                key={caseType.pyLabel}
              >
                <span className='flex-shrink-0 min-w-[40px]'>
                  <Briefcase size={28} />
                </span>
                <span className='flex-grow'>{localeUtils.getLocaleValue(caseType.pyLabel, '', localeReference)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <ul className='m-0 p-0 list-none'>
        {navPages.map(page => (
          <li className='flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100' onClick={() => navPanelButtonClick(page)} key={page.pyLabel}>
            <span className='flex-shrink-0 min-w-[40px]'>{iconMap[page.pxPageViewIcon]}</span>
            <span className='flex-grow'>{localeUtils.getLocaleValue(page.pyLabel, '', localeReference)}</span>
          </li>
        ))}
      </ul>
      <hr className='border-gray-200 my-0' />
      <ul className='m-0 p-0 list-none marginTopAuto'>
        <li
          ref={operatorButtonRef}
          className='relative flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100'
          onClick={navPanelOperatorButtonClick}
        >
          <span className='flex-shrink-0 min-w-[40px]'>
            <User size={28} />
          </span>
          <span className='flex-grow'>{portalOperator}</span>
          {open && (
            <span className='flex-shrink-0 ml-auto'>
              <button type='button' className='p-1 rounded-full hover:bg-gray-200' onClick={navPanelOperatorButtonClick}>
                <ChevronRight size={20} />
              </button>
            </span>
          )}
        </li>
      </ul>
      {bShowOperatorButtons && (
        <div
          ref={menuRef}
          className='fixed z-50 bg-white rounded shadow-lg border border-gray-200 py-1 min-w-[160px]'
          style={{
            left: operatorButtonRef.current ? operatorButtonRef.current.getBoundingClientRect().right + 4 : 0,
            top: operatorButtonRef.current ? operatorButtonRef.current.getBoundingClientRect().top : 0
          }}
        >
          <ul className='m-0 p-0 list-none'>
            <li className='flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100' onClick={logout}>
              <span className='flex-shrink-0 min-w-[40px]'>
                <ArrowLeft size={28} />
              </span>
              <span>{localizedVal('Log off', localeCategory)}</span>
            </li>
          </ul>
        </div>
      )}
    </aside>
  );
}
