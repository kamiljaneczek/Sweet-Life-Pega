import './Banner.css';

// AlertBanner is one of the few components that does NOT have getPConnect.
//  So, no need to extend PConnProps

interface BannerProps {
  // If any, enter additional props that only exist on this component
  a: any;
  b: any;
  banner: {
    variant: any;
    backgroundColor: any;
    title: any;
    message: any;
    backgroundImage: any;
    tintImage: any;
  };
  variant: any;
}

export default function Banner(props: BannerProps) {
  const { a, b, banner, variant } = props;
  const { title, message, backgroundImage } = banner;
  const variantMap = {
    'two-column': ['col-span-6', 'col-span-6'],
    'narrow-wide': ['col-span-4', 'col-span-8'],
    'wide-narrow': ['col-span-8', 'col-span-4']
  };
  const colClasses = variantMap[variant] || variantMap['two-column'];
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div className='background-image-style' style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className='background-style content'>
          <div>
            <h1 className='title'>{title}</h1>
            <p className='message'>{message}</p>
          </div>
        </div>
      </div>
      <div className='banner-layout grid grid-cols-12 gap-1'>
        <div className={`${colClasses[0]} p-4`}>{a}</div>
        <div className={`${colClasses[1]} p-4`}>{b}</div>
      </div>
    </div>
  );
}
