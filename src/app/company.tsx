/* eslint-disable react/no-unescaped-entities */
import Header from './components/header';
import Footer from './components/footer';
import { Button } from '../design-system/ui/button';

const Company = () => {
  return (
    <>
      <Header />
      <section className='w-full py-12 md:py-24 lg:py-32'>
        <div className='container px-4 md:px-6'>
          <div className='grid gap-6 lg:grid-cols-2 lg:gap-12'>
            <div className='space-y-4'>
              <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800'>Our Story</div>
              <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>The Origin of Sweet Life</h2>
              <p className='max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400'>
                Kate and Blake, two sisters, started Sweet Life with a passion for creating high-quality, delicious sweets. They drew inspiration from
                their family's long-standing tradition of baking and their childhood memories of making treats together.
              </p>
            </div>
            <img
              alt='Sweet Life Founders'
              className='mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full'
              height={310}
              src='/placeholder.svg'
              width={550}
            />
          </div>
        </div>
      </section>
      <section className='w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800'>
        <div className='container px-4 md:px-6'>
          <div className='grid gap-6 lg:grid-cols-2 lg:gap-12'>
            <img
              alt='Sweet Life Factory'
              className='mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full'
              height={310}
              src='/placeholder.svg'
              width={550}
            />
            <div className='space-y-4'>
              <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800'>Our Growth</div>
              <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>Scaling Sweet Life</h2>
              <p className='max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400'>
                Sweet Life now operates 3 state-of-the-art factories, allowing them to scale production and meet the growing demand for their
                products. The factories are equipped with the latest technology and staffed by a team of skilled confectioners.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className='w-full py-12 md:py-24 lg:py-32'>
        <div className='container px-4 md:px-6'>
          <div className='grid gap-6 lg:grid-cols-2 lg:gap-12'>
            <div className='space-y-4'>
              <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800'>Our Vision</div>
              <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>Bringing Joy Through Sweets</h2>
              <p className='max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400'>
                Sweet Life is committed to using only the finest, freshest ingredients in their products. They believe in sustainable and ethical
                business practices, supporting local communities, and bringing joy to their customers through their creations. The company's vision is
                to become a leading provider of premium, handcrafted sweets that are enjoyed by people around the world.
              </p>
            </div>
            <img
              alt='Sweet Life Products'
              className='mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full'
              height={310}
              src='/placeholder.svg'
              width={550}
            />
          </div>
        </div>
      </section>
      <section>
        <h1>About Sweet Life</h1>
        <p>
          Welcome to Sweet Life, where dreams are made of sugar and the sweetest moments are created. Founded by sisters Jane and Kate, Sweet Life is
          a culmination of our passion for crafting delightful sweets that bring joy to people's lives.
        </p>
        <p>
          Driven by our love for confectionery and dedication to quality, Sweet Life is on a mission to spread happiness and create delicious memories
          through our delectable treats.
        </p>
        <h2>Meet the Founders</h2>
        <div className='founders'>
          <div className='founder'>
            <img src='jane.jpg' alt='Jane - Co-founder' />
            <h3>Jane Doe</h3>
            <p>Co-founder, Chief Baker</p>
          </div>
          <div className='founder'>
            <p>Co-founder & Creative Director</p>
          </div>
        </div>
        <h2>Our Values and Mission:</h2>
        <p>
          At Sweet Life, we believe in creating confectionery masterpieces with the highest quality ingredients and a dash of love in every recipe.
          Our mission is to sweeten your life with indulgent treats that not only satisfy your taste buds but also warm your heart.
        </p>
        <p>
          With a commitment to innovation, excellence, and customer satisfaction, Sweet Life is dedicated to crafting a world filled with sweetness
          and happiness, one candy at a time.
        </p>
      </section>

      <section className='w-full py-12 md:py-24 lg:py-32'>
        <div className='container grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10'>
          <h2 className='text-2xl font-bold'>We will make your life sweet!</h2>
          <p className='text-lg text-gray-700 mt-4 mb-8'>Sweet Life company is committed to bring joy and happiness into your life.</p>
          <p>
            Welcome to Sweet Life Inc., home to the finest chocolate bon bons in the world. Established in 1937 in the United States by John Mayers,
            Sweet Life Inc. has been a pioneer in the confectionery industry for over eight decades. Today, the company is proudly owned and managed
            by sisters Jane and Gabbie Mayers, who continue to uphold the legacy of their founding father.
          </p>
          <div className='flex justify-center space-x-4'>
            <Button className='bg-[#bd1e59] text-white px-6 py-2 rounded-md hover:bg-[#a1194f]'>Get started</Button>
            <Button className='bg-transparent text-[#bd1e59] px-6 py-2 rounded-md border border-[#bd1e59] hover:bg-[#bd1e59] hover:text-white'>
              Learn more
            </Button>
          </div>
          <img src='assets/img/cupcake.svg' className='w-32 h-32' />
        </div>
      </section>

      <section className='w-full py-12 md:py-24 lg:py-32'>
        <div className='container grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10'>
          <div className='space-y-3'>
            <h2 className='text-3xl font-bold tracking-tighter sm:text-2xl md:text-3xl'>More about us</h2>
            <p className='mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400'>
              With a focus on quality and innovation, Sweet Life Inc. has carved a niche in the premium sweets market, delighting customers with an
              exquisite range of chocolate bon bons. Our dedication to excellence is reflected in our three state-of-the-art factories across the
              globe where our signature treats are meticulously crafted. Employing a diverse team of 600 talented individuals, we take pride in our
              presence in 25 countries, bringing the taste of Sweet Life to connoisseurs worldwide!
            </p>
            <p className='mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400'>
              At Sweet Life Inc., we are committed to creating unforgettable experiences through our delectable confections. Our passion for crafting
              the perfect chocolate bon bons drives us to constantly innovate and push the boundaries of flavor and quality. Each bite of our sweets
              is a testament to our dedication to perfection and our unwavering commitment to customer satisfaction. As a company deeply rooted in
              tradition yet constantly evolving, we strive to maintain the highest standards of quality and ethical practices. From sourcing the
              finest ingredients to implementing sustainable production methods, we prioritize both the planet and the people we serve. With a rich
              history and a global presence, Sweet Life Inc. invites you to indulge in the sweet moments that define our brand and experience the
              timeless delight of our handcrafted chocolates.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Company;
