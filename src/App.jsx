import React, { useState } from 'react'
import HomePage from './components/HomePage'
import Header from './components/Header'
import FileDisplay from './components/FileDisplay'

const App = () => {
   const [file, setFile] = useState(null)
   const [audioStream, setAudioStream] = useState(null)

   const isAudioAvailable = file || audioStream

   function handleResetAudio() {
      setFile(null)
      setAudioStream(null)
   }
   return (
      <>
         <div className='flex flex-col  max-w-[1000px] mx-auto w-full'>
            <section className='min-h-screen flex flex-col'>
               <Header />
               {isAudioAvailable ? (
                  <FileDisplay
                     file={file}
                     audioStream={setAudioStream}
                     handleResetAudio={handleResetAudio}
                  />
               ) : (
                  <HomePage setFile={setFile} setAudioStream={setAudioStream} />
               )}
            </section>
            <h1 className=''></h1>
            <footer></footer>
         </div>
      </>
   )
}

export default App
