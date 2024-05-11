import { Button } from '../../../../design-system/ui/button';

// ActionButtons does NOT have getPConnect. So, no need to extend from PConnProps
interface ActionButtonsProps {
  // If any, enter additional props that only exist on this component
  arMainButtons?: any[];
  arSecondaryButtons?: any[];
  onButtonPress: any;
}

export default function ActionButtons(props: ActionButtonsProps) {
  const { arMainButtons = [], arSecondaryButtons = [], onButtonPress } = props;

  const localizedVal = PCore.getLocaleUtils().getLocaleValue;
  const localeCategory = 'Assignment';

  function _onButtonPress(sAction: string, sButtonType: string) {
    onButtonPress(sAction, sButtonType);
  }

  return (
    <div className='mt-4 flex flex-row justify-between'>
      <div className='flex flex-row gap-4'>
        {arSecondaryButtons.map(sButton => (
          <Button
            variant='secondary'
            size='lg'
            onClick={() => {
              _onButtonPress(sButton.jsAction, 'secondary');
            }}
          >
            {localizedVal(sButton.name, localeCategory)}
          </Button>
        ))}
      </div>
      {arMainButtons.map(mButton => (
        <Button
          variant='default'
          size='lg'
          onClick={() => {
            _onButtonPress(mButton.jsAction, 'primary');
          }}
        >
          {localizedVal(mButton.name, localeCategory)}
        </Button>
      ))}
    </div>
  );
}
