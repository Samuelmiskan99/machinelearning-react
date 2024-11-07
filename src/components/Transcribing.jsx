const Transcribing = (props) => {
   const { downloading } = props
   return (
      <div className='flex items-center flex-col justify-center flex-1 text-center gap-10 md:gap-14 pb-24 p-4'>
         <div className='flex flex-col gap-2 sm:gap-4'>
            <h1 className='font-semibold text-4xl sm:text-5xl md:text-6xl'>
               <span className='text-red-400 bold '>Transribing</span>
            </h1>
            <p>{!downloading ? 'Please wait...' : 'Downloading...'}</p>
         </div>
         <div className='flex flex-col gap-2 sm:gap-3 max-w-[500px] mx-auto w-full'>
            {[0, 1, 2].map((val) => {
               return (
                  <div
                     key={val}
                     className={`rounded-full h-2 sm:h-3 bg-slate-500 loading loading${val}`}></div>
               )
            })}
         </div>
      </div>
   )
}

export default Transcribing
