import { Utils } from '@pega/react-sdk-components/lib/components/helpers/utils';

// FieldGroupList is one of the few components that does NOT have getPConnect.
//  So, no need to extend PConnProps
interface FieldGroupListProps {
  // If any, enter additional props that only exist on this component
  items: any[] | any;
  onDelete: any;
  onAdd: any;
}

export default function FieldGroupList(props: FieldGroupListProps) {
  let menuIconOverride$ = 'trash';
  if (menuIconOverride$) {
    menuIconOverride$ = Utils.getImageSrc(menuIconOverride$, Utils.getSDKStaticConentUrl());
  }

  return (
    <div className='flex justify-between gap-4'>
      <div className='w-full'>
        <div className='flex flex-col gap-1'>
          {props.items.map((item) => (
            <div className='w-full' key={item.id}>
              <b>{item.name}</b>
              {props.onDelete && (
                <button
                  type='button'
                  style={{ float: 'right' }}
                  className='psdk-utility-button'
                  id={`delete-row-${item.id}`}
                  aria-label='Delete Row'
                  onClick={() => {
                    props.onDelete(item.id);
                  }}
                >
                  <img className='psdk-utility-card-action-svg-icon' src={menuIconOverride$} />
                </button>
              )}
              {item.children}
              <br />
              {props.onAdd && <hr className='border-t border-border' />}
              <br />
            </div>
          ))}
          {props.onAdd && (
            <button type='button' onClick={props.onAdd} className='cursor-pointer text-primary hover:underline text-left'>
              +Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
