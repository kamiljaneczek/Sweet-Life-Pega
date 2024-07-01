/* eslint-disable no-console */
import Header from './components/header';
import { Input } from '../design-system/ui/input';
import { Textarea } from '../design-system/ui/textarea';
import Footer from './components/footer';
import { Button } from '../design-system/ui/button';
import useConstellation from '../hooks/useConstellation';
import { useState } from 'react';

import Loading from './components/loading';

const Contact = () => {
  const [caseID, setCaseID] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const isPegaReady = useConstellation();

  function createInquiryCase() {
    let token = '';
    (async () => {
      const responseToken = await fetch('https://lab0339.lab.pega.com/prweb/PRRestService/oauth2/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `custom-bearer`
        },
        body: 'client_id=11351708984521870813&grant_type=custom-bearer&enable_psyncId=true'
      });
      const dataToken = await responseToken.json();

      console.log('token: ', dataToken.access_token);
      token = dataToken.access_token;

      const caseBody = {
        caseTypeID: 'SL-TellUsMoreRef-Work-Inquiry',
        parentCaseID: '',
        content: {
          FirstName: 'Adam',
          LastName: 'Smith',
          Email: email,
          InquiryMessage: message
        }
      };

      const responseCase = await fetch('https://lab0339.lab.pega.com/prweb/api/application/v2/cases?viewType=none&pageName=', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(caseBody)
      });
      const dataCase = await responseCase.json();
      setCaseID(dataCase.data.caseInfo.content.pyID);

      console.log('dataCase: ', dataCase);
    })();
  }

  return (
    <>
      <Header />
      {isPegaReady ? (
        <div className='flex-grow bg-white dark:bg-gray-900'>
          <section className=''>
            <div className='py-8 lg:py-16 px-4 mx-auto max-w-screen-md'>
              <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white'>Contact Us</h2>
              <p className='mb-8 lg:mb-16 font-light text-center text-gray-500 dark:text-gray-400 sm:text-xl'>
                Want to send feedback about a beta feature? Need details about our Business plan? Let us know.
              </p>
              {caseID === '' ? (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    createInquiryCase();
                  }}
                  className='space-y-8'
                >
                  <div>
                    <Input
                      type='email'
                      id='email'
                      label='Your email'
                      helperText=''
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                      }}
                      placeholder='name@pega.com'
                      InputProps=''
                      error={false}
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
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
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
                      value={message}
                      onChange={e => setMessage(e.target.value)}
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
              ) : (
                <div className='flex flex-row align-middle items-center justify-center'>
                  <p className='mb-8 lg:mb-16 font-light text-center text-gray-500 dark:text-gray-400 sm:text-xl'>
                    Case created successfully. Your Case ID is: <span className='font-bold text-gray-600'> {caseID}</span>
                  </p>
                  <p className='mb-t lg:mt-16 font-light text-center text-gray-500 dark:text-gray-400 sm:text-xl'>
                    Please use Case ID in any following conversation.
                  </p>
                </div>
              )}
            </div>
          </section>
          <div className='flex flex-row align-middle items-center justify-center'>
            <div id='pega-root' />
          </div>
        </div>
      ) : (
        <Loading />
      )}

      <Footer />
    </>
  );
};

export default Contact;
