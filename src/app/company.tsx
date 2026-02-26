/* eslint-disable react/no-unescaped-entities */
import Header from './components/header';
import Footer from './components/footer';

const Company = () => {
  return (
    <>
      <Header />
      <div className='flex-grow dark:bg-gray-900'>
        <section className='w-full py-12 md:py-16 '>
          <div className='container px-4 md:px-6'>
            <div className='grid gap-6 lg:grid-cols-2 lg:gap-12'>
              <div className='space-y-4'>
                <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 dark:bg-gray-700'>Our Story</div>
                <h2 className='text-3xl font-bold tracking-tighter  md:text-5xl'>The Origin of Sweet Life</h2>
                <p className='max-w-[600px] text-lg text-gray-500 md:text-xl/relaxed  dark:text-gray-400'>
                  Kate and Blake, two sisters, started Sweet Life with a passion for creating high-quality, delicious sweets. They drew inspiration
                  from their family's long-standing tradition of baking and their childhood memories of making treats together.
                </p>
              </div>
              <img
                alt='Sweet Life Founders'
                className='mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full'
                height={200}
                src='https://picsum.photos/id/20/3670/2462'
                width={300}
              />
            </div>
          </div>
        </section>
        <section className='w-full py-12 md:py-16'>
          <div className='container px-4 md:px-6'>
            <div className='grid gap-6 lg:grid-cols-2 lg:gap-12'>
              <div className='space-y-4'>
                <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 dark:bg-gray-700'>Our Growth</div>
                <h2 className='text-3xl font-bold tracking-tighter md:text-5xl'>Present</h2>
                <p className='max-w-[600px] text-lg text-gray-500 md:text-xl/relaxed  dark:text-gray-400'>
                  Sweet Life now operates 3 state-of-the-art factories, allowing them to scale production and meet the growing demand for their
                  products. The factories are equipped with the latest technology and staffed by a team of skilled confectioners.
                </p>
              </div>
              <img
                alt='Sweet Life Founders'
                className='mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full'
                height={200}
                src='https://picsum.photos/id/42/3456/2304'
                width={300}
              />
            </div>
          </div>
        </section>
        <section className='w-full py-12 md:py-16'>
          <div className='container px-4 md:px-6'>
            <div className='grid gap-6 lg:grid-cols-2 lg:gap-12'>
              <div className='space-y-4'>
                <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 dark:bg-gray-700'>Our Vision</div>
                <h2 className='text-3xl font-bold tracking-tighter md:text-5xl'>Who we are and what we do</h2>
                <p className='max-w-[600px] text-lg text-gray-500 md:text-xl/relaxed  dark:text-gray-400'>
                  Sweet Life is committed to using only the finest, freshest ingredients in their products. They believe in sustainable and ethical
                  business practices, supporting local communities, and bringing joy to their customers through their creations. The company's vision
                  is to become a leading provider of premium, handcrafted sweets that are enjoyed by people around the world.
                </p>
              </div>
              <img
                alt='Sweet Life Founders'
                className='mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full'
                height={200}
                src='https://picsum.photos/id/163/2000/1333'
                width={300}
              />
            </div>
          </div>
        </section>

        <section className='w-full py-12 md:py-16'>
          <div className='container grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-6'>
            <div className='space-y-2'>
              <h2 className='text-4xl py-4 font-bold tracking-tighter  md:text-3xl'>More about us</h2>
              <p className='max-w-[600px] text-lg text-gray-500 md:text-xl/relaxed  dark:text-gray-400'>
                With a focus on quality and innovation, Sweet Life Inc. has carved a niche in the premium sweets market, delighting customers with an
                exquisite range of chocolate bon bons. Our dedication to excellence is reflected in our three state-of-the-art factories across the
                globe where our signature treats are meticulously crafted. Employing a diverse team of 600 talented individuals, we take pride in our
                presence in 25 countries, bringing the taste of Sweet Life to connoisseurs worldwide!
              </p>
              <div className='flex my-8 flex-col items-center align-middle center'>
                <img src='assets/img/cupcake.svg' className='w-32 h-32' />
              </div>
              <p className='max-w-[600px] text-lg text-gray-500 md:text-xl/relaxed  dark:text-gray-400'>
                At Sweet Life Inc., we are committed to creating unforgettable experiences through our delectable confections. Our passion for
                crafting the perfect chocolate bon bons drives us to constantly innovate and push the boundaries of flavor and quality. Each bite of
                our sweets is a testament to our dedication to perfection and our unwavering commitment to customer satisfaction. As a company deeply
                rooted in tradition yet constantly evolving, we strive to maintain the highest standards of quality and ethical practices. From
                sourcing the finest ingredients to implementing sustainable production methods, we prioritize both the planet and the people we serve.
                With a rich history and a global presence, Sweet Life Inc. invites you to indulge in the sweet moments that define our brand and
                experience the timeless delight of our handcrafted chocolates.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Company;
