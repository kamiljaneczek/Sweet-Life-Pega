/* eslint-disable no-console */
import Header from './components/header';
import { Input } from '../design-system/ui/input';
import { Textarea } from '../design-system/ui/textarea';
import Footer from './components/footer';
import { Button } from '../design-system/ui/button';
import useConstellation from '../hooks/useConstellation';
import { useEffect, useState } from 'react';
import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';
import Loading from './components/loading';
import classNames from 'classnames';

const Contact = () => {
    const [showPega, setShowPega] = useState('Info'); // Info, Pega, Confirmation
  const isPegaReady = useConstellation();
  console.log('isPegaReady', isPegaReady);

  useEffect(() => {
     setShowPega('Pega');
    getSdkConfig().then(sdkConfig => {
        let mashupCaseType = sdkConfig.serverConfig.appMashupCaseType;
      if (!mashupCaseType) {
        const caseTypes = PCore.getEnvironmentInfo().environmentInfoObject.pyCaseTypeList;
        mashupCaseType = caseTypes[1].pyWorkTypeImplementationClassName;
      }

      const options: any = {
        pageName: 'pyEmbedAssignment',
        startingFields: {}
      };
      (PCore.getMashupApi().createCase(mashupCaseType, PCore.getConstants().APP.APP, options) as any).then(() => {
        console.log('createCase rendering is complete');
      });
    });
  });



  return (
    <>
      <Header />
            <Header />
      {isPegaReady ? (
      <div className='flex-grow bg-white dark:bg-gray-900'>
        <section className=''>
          <div className='py-8 lg:py-16 px-4 mx-auto max-w-screen-md'>
            <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white'>Contact Us</h2>
            <p className='mb-8 lg:mb-16 font-light text-center text-gray-500 dark:text-gray-400 sm:text-xl'>
              Want to send feedback about a beta feature? Need details about our Business plan? Let us know.
            </p>
            <form action='#' className='space-y-8'>
              <div>
                <Input
                  type='email'
                  id='email'
                  label='Your email'
                  helperText=''
                  placeholder='name@pega.com'
                  InputProps=''
                  error={false}
                  className='shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light'
                  required
                />
              </div>
              <div>
                <Input
                  type='text'
                  id='subject'
                  label='Subject'
                  helperText=''
                  InputProps=''
                  error={false}
                  className='block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light'
                  placeholder='Let us know how we can help you'
                  required
                />
              </div>
              <div className='sm:col-span-2'>
                <Textarea
                  id='message'
                  rows={6}
                  helperText=''
                  size='medium'
                  label='Your message'
                  variant='outlined'
                  className='block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500'
                  placeholder='Leave a comment...'
                />
              </div>
              <Button type='submit' variant='default'>
                Send message
              </Button>
            </form>
          </div>
        </section>     <div className='flex flex-row align-middle items-center justify-center'>
                  <div id='pega-root' className={classNames('flex-grow w-full max-w-3xl', { hidden: showPega !== 'Pega' })} />
                </div></div>) : (
        <Loading />
      )}

      <Footer />
    </>
  );
};

export default Contact;
