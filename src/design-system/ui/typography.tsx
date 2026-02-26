import React from 'react';

type TypographyProps = {
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'overline' | 'srOnly' | 'inherit';

  children: React.ReactNode;
};

const Typography = ({ variant, children }: TypographyProps) => {
  switch (variant) {
    case 'h1':
      return <div className='text-4xl'> {children} </div>;
    case 'h2':
      return <div className='text-3xl'> {children} </div>;
    case 'h3':
      return <div className='text-2xl'> {children} </div>;
    case 'h4':
      return <div className='text-xl'> {children} </div>;
    case 'h5':
      return <div className='text-lg'> {children} </div>;
    case 'h6':
      return <div className='text-base'> {children} </div>;

    default:
      return <div className='text-3xl'> {children} </div>;
  }
};

export default Typography;
