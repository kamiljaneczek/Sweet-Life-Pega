const Loading = () => {
  return (
    <div className='flex justify-center items-center h-72 lg:h-96'>
      <div className='text-center'>
        <h2 className='text-2xl mb-12 py-12 font-bold'>Loading...</h2>
        <img src='assets/img/loading.gif' alt='loading' />
      </div>
    </div>
  );
};

export default Loading;
