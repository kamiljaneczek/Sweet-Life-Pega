// LeftAlignVerticalTabs does NOT have getPConnect. So, no need to extend from PConnProps

interface LeftAlignVerticalTabsProps {
  // If any, enter additional props that only exist on this component
  label?: string;
  selected?: boolean;
  onClick?: () => void;
}

// LeftAlignVerticalTab is a specialized Tab that has styles to make it
//  left aligned and full width of the container Tabs

export default function LeftAlignVerticalTabs(props: LeftAlignVerticalTabsProps) {
  const { label, selected = false, onClick } = props;

  return (
    <div>
      <button
        type='button'
        role='tab'
        aria-selected={selected}
        className={`w-full cursor-pointer px-4 py-2 text-left text-sm ${selected ? 'border-l-[3px] border-blue-700 font-medium text-blue-700 dark:border-blue-400 dark:text-blue-400' : 'border-l-[3px] border-transparent text-foreground hover:bg-muted'}`}
        onClick={onClick}
      >
        {label}
      </button>
      <hr className='border-border' />
    </div>
  );
}
