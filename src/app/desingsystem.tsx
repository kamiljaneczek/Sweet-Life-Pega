import { useEffect } from 'react';

import { Button } from '../design-system/ui/button';

import useConstellation from '../hooks/useConstellation';

export default function DesingSystem() {
  // const [isPegaReady, setIsPegaReady] = useState(false);
  const isPegaReady = useConstellation();

  console.log('bIsPegaReady', isPegaReady);

  useEffect(() => {
    if (isPegaReady) {
      //   const sdkConfig = await getSdkConfig();
      //   console.log('sdkConfig: ', sdkConfig);
      console.log('PCore: ', PCore);
      console.log('PCore.getPCoreVersion(): ', PCore.getPCoreVersion());

      const activeContext = PCore.getContainerUtils().getRootContainerName();
      console.log('activeContext', activeContext);
      const activeContainerContext = PCore.getContainerUtils().getActiveContainerItemContext('app/primary');
      console.log('activeContainerContext', activeContainerContext);
      PCore.getContainerUtils().getContainerData('app/primary');
    }
  }, [isPegaReady]);

  async function handleCreateCase() {
    /*         const target = getPConnect().getTarget();
        console.log('target', target);
        const { containerName = 'primary' } = getPConnect().getContainerName();
        console.log('containerName', containerName);
        const context = getPConnect().getContextName();
        console.log('context', context); */
  }

  return (
    <div className='min-h-screen bg-white text-black'>
      <main>
        <section className='text-center py-24'>
          <div className='container mx-auto px-4'>
            <h2 className='text-2xl font-bold'>Any problems?</h2>
            <p className='text-lg text-gray-700 mt-4 mb-8'>We can help you.</p>
            <div>
              <Button onClick={handleCreateCase} className='bg-[#bd1e59] text-white px-6 py-2 rounded-md hover:bg-[#a1194f]'>
                Run action
              </Button>
            </div>
            <div id='pega-root' className='flex justify-center space-x-4' />
          </div>
        </section>
      </main>
    </div>
  );
}
