import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

// AlertBanner is one of the few components that does NOT have getPConnect.
//  So, no need to extend PConnProps
interface AlertBannerProps {
  // If any, enter additional props that only exist on Date here
  id: string;
  variant: string;
  messages: string[];
  onDismiss?: any;
}

const VARIANT_STYLES = {
  urgent: 'border-red-500 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200',
  warning: 'border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
  success: 'border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200',
  info: 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
};

const VARIANT_ICONS = {
  urgent: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info
};

export default function AlertBanner(props: AlertBannerProps) {
  const { id, variant, messages, onDismiss } = props;

  const Icon = VARIANT_ICONS[variant] || Info;
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.info;

  return (
    <div id={id}>
      {messages.map(message => (
        <div key={message} className={`flex items-center gap-2 rounded border px-4 py-3 mb-2 ${variantStyle}`}>
          <Icon className='h-5 w-5 flex-shrink-0' />
          <span className='flex-1'>{message}</span>
          {onDismiss && (
            <button type='button' onClick={onDismiss} className='flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10'>
              <X className='h-4 w-4' />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
