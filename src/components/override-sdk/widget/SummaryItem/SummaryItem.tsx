import { useState, useRef, useEffect } from 'react';
import { Utils } from '@pega/react-sdk-components/lib/components/helpers/utils';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';

import './SummaryItem.css';

interface SummaryItemProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  menuIconOverride$: string;
  menuIconOverrideAction$: any;
  arItems$: any[] | any;
}

export default function SummaryItem(props: SummaryItemProps) {
  let imagePath$ = '';
  let menuIconOverride$;
  menuIconOverride$ = props.menuIconOverride$;
  imagePath$ = Utils.getIconPath(Utils.getSDKStaticConentUrl());
  const item = props.arItems$;
  const srcImg = `${imagePath$}${item.visual.icon}.svg`;
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  if (menuIconOverride$) {
    menuIconOverride$ = Utils.getImageSrc(menuIconOverride$, Utils.getSDKStaticConentUrl());
  }

  function removeAttachment() {
    props.menuIconOverrideAction$(item);
  }

  const handleClick = () => {
    setOpen(prev => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className='psdk-utility-card'>
      <div className='psdk-utility-card-icon'>
        <img className='psdk-utility-card-svg-icon' src={srcImg} />
      </div>
      <div className='psdk-utility-card-main'>
        {item.primary.type !== 'URL' && <div className='psdk-utility-card-main-primary-label'>{item.primary.name}</div>}
        {item.primary.type === 'URL' && (
          <div className='psdk-utility-card-main-primary-url'>
            <button type='button' className='psdk-link-button'>
              {item.primary.name}&nbsp;
              <img className='psdk-utility-card-actions-svg-icon' src={`${imagePath$}${item.primary.icon}.svg`} />
            </button>
          </div>
        )}
        {item.secondary.text && <div style={{ color: item.secondary.error ? 'red' : undefined }}>{item.secondary.text}</div>}
      </div>
      <div className='psdk-utility-action'>
        {menuIconOverride$ && (
          <button type='button' className='psdk-utility-button' aria-label='Delete Attachment' onClick={removeAttachment}>
            <img className='psdk-utility-card-action-svg-icon' src={menuIconOverride$} />
          </button>
        )}
        {!menuIconOverride$ && (
          <div ref={menuRef} className='relative'>
            <button
              type='button'
              id='setting-button'
              className='inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100'
              aria-controls={open ? 'file-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-haspopup='true'
              onClick={handleClick}
            >
              <svg className='h-5 w-5 fill-current text-gray-600' viewBox='0 0 24 24'>
                <circle cx='12' cy='5' r='2' />
                <circle cx='12' cy='12' r='2' />
                <circle cx='12' cy='19' r='2' />
              </svg>
            </button>
            {open && (
              <div
                id='file-menu'
                className='absolute right-0 top-full z-50 mt-1 min-w-[150px] rounded border border-gray-200 bg-white py-1 shadow-lg'
              >
                {item.actions &&
                  item.actions.map(option => (
                    <button
                      type='button'
                      key={option.id || option.text}
                      className='block w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-gray-100'
                      onClick={() => {
                        option.onClick();
                        handleClose();
                      }}
                    >
                      {option.text}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
