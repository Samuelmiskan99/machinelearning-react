import { FaPenNib } from 'react-icons/fa'

const FileDisplay = (props) => {
   const { file, audioStream, handleResetAudio } = props
   return (
      <>
         <main className='flex-1  p-4 flex flex-col justify-center gap-3 text-center sm:gap-4  pb-20 w-71 max-w-full mx-auto sm:w-96'>
            {' '}
            <h1 className='font-semibold text-4xl sm:text-5xl md:text-6xl'>
               Your<span className='text-red-400 bold '> Files</span>
            </h1>
            <div className='flex flex-col  text-left my-4'>
               <h3 className='font-semibold'>Name</h3>
               <p className=''>{file ? file.name : 'Custom Audio'}</p>
            </div>
            <div className='flex items-center justify-between gap-4'>
               <button
                  className='text-slate-400 hover:text-blue-600 duration-200 font-semibold '
                  onClick={handleResetAudio}>
                  Reset
               </button>

               <button className='specialBtn font-semibold p-2 rounded-lg text-red-400 flex items-center gap-2 text-base px-3'>
                  <p>Transcribe</p>
                  <FaPenNib />
               </button>
            </div>
         </main>
      </>
   )
}

export default FileDisplay
