import { useState } from 'react'
import Transcription from './function/Transcription'
import Translation from './function/Translation'

function Information() {
   const [tab, setTab] = useState('transcription')
   return (
      <main className='flex-1  p-4 flex flex-col justify-center gap-3 text-center sm:gap-4 pb-20 max-w-prose w-full mx-auto '>
         <h1 className='font-semibold text-4xl sm:text-5xl md:text-6xl whitespace-nowrap'>
            Your<span className='text-red-400 bold '> Transcription</span>
         </h1>
         <div className='grid grid-cols-2 mx-auto bg-white  shadow rounded-full overflow-hidden items-center '>
            <button
               onClick={() => setTab('transcription')}
               className={
                  'px-4 py-1 font-medium ' +
                  (tab === 'transcription'
                     ? ' bg-rose-600 text-white'
                     : 'text-red-400 hover:text-red-600 duration-200')
               }>
               Transcription
            </button>
            <button
               onClick={() => setTab('translation')}
               className={
                  'px-4 py-1 font-medium ' +
                  (tab === 'translation'
                     ? ' bg-rose-400 text-white'
                     : 'text-red-400 hover:text-red-600 duration-200')
               }>
               Translation
            </button>
         </div>
         {tab === 'transcription' ? <Transcription /> : <Translation />}
      </main>
   )
}

export default Information
