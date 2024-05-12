const Loading = () => {
  return (
    <div className='flex justify-center items-center h-[350px] lg:h-[550px]'>
      <div className='text-center'>
        <h2 className='text-2xl mb-12 py-12 font-bold'>Loading...</h2>
        <img src='assets/img/loading.gif' alt='loading' />
      </div>
    </div>
  );
};

export default Loading;
