const Loading = () => {
  return (
    <div className='mb-auto flex justify-center items-center h-[350px] lg:h-[550px] dark:bg-gray-900'>
      <div className='text-center'>
        <h2 className='text-2xl mb-12 dark:text-white py-12 font-bold'>Loading...</h2>
        <img src='assets/img/loading.gif' alt='loading' />
      </div>
    </div>
  );
};

export default Loading;
