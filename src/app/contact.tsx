import { useState } from 'react';
import { useCreateCaseViaPCore } from '../api/hooks/usePCoreQuery';
import { Button } from '../design-system/ui/button';
import { Input } from '../design-system/ui/input';
import { Textarea } from '../design-system/ui/textarea';
import useConstellation from '../hooks/useConstellation';

import Loading from './components/loading';

const Contact = () => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const isPegaReady = useConstellation();
  const { mutate, isPending, isSuccess, data } = useCreateCaseViaPCore();

  const caseID = data?.data?.caseInfo?.content?.pyID ?? '';

  function createInquiryCase() {
    mutate({
      caseTypeID: 'SL-TellUsMoreRef-Work-Inquiry',
      content: {
        FirstName: 'Adam',
        LastName: 'Smith',
        Email: email,
        InquiryMessage: message
      }
    });
  }

  return (
    <>
      {!isPegaReady && <Loading />}
      <div className='flex-grow bg-white dark:bg-gray-900'>
        <section className={isPegaReady ? '' : 'hidden'}>
          <div className='py-8 lg:py-16 px-4 mx-auto max-w-screen-md'>
            <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white'>Contact Us</h2>
            <p className='mb-8 lg:mb-16 text-center text-gray-500 dark:text-gray-400 text-lg'>
              Want to send feedback about a beta feature? Need details about our Business plan? Let us know.
            </p>
            {!isSuccess ? (
              <form
                onSubmit={(e) => {
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
                    helperText='How can we reach you?'
                    className='block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light'
                    value={email}
                    onChange={(e) => {
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
                    InputProps=''
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    error={false}
                    className='block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light'
                    helperText='Let us know how we can help you'
                    required
                  />
                </div>
                <div className='sm:col-span-2'>
                  <Textarea
                    id='message'
                    rows={6}
                    helperText='Leave us a message...'
                    size='medium'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    label='Your message'
                    variant='outlined'
                    className='block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500'
                    placeholder=''
                    required
                  />
                </div>
                <Button type='submit' variant='default' disabled={isPending}>
                  {isPending ? 'Sending...' : 'Send message'}
                </Button>
              </form>
            ) : (
              <div className='flex flex-col align-middle items-center justify-center'>
                <p className='mb-8 lg:mb-16 font-light text-center text-gray-500 dark:text-gray-400 text-lg'>
                  Case created successfully. Your Case ID is: <span className='font-bold text-gray-600'> {caseID}</span>
                </p>
                <p className='mb-t lg:mt-16 font-light text-center text-gray-500 dark:text-gray-400 text-lg'>
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
    </>
  );
};

export default Contact;
