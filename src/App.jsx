import React, { useRef, useState, useEffect } from 'react'
import HomePage from './components/HomePage'
import Header from './components/Header'
import FileDisplay from './components/FileDisplay'
import Information from './components/Information'
import Transcribing from './components/Transcribing'
import { MessageTypes } from './utils/preset'

const App = () => {
   const [file, setFile] = useState(null)
   const [audioStream, setAudioStream] = useState(null)
   const [output, setOutput] = useState(null)
   const [downloading, setDownloading] = useState(false)
   const [loading, setLoading] = useState(false)
   const [finished, setFinished] = useState(false)

   const isAudioAvailable = file || audioStream

   useEffect(() => {
      if (!worker.current) {
         worker.current = new Worker(new URL('./utils/whisper.worker.js', import.meta.url), {
            type: 'module',
         })
      }
      const onMessageReceived = async (e) => {
         switch (e.data.type) {
            case 'DOWNLOADING':
               setDownloading(true)
               console.log('DOWNLOADING')
               break
            case 'LOADING':
               setLoading(true)
               console.log('LOADING')
               break
            case 'RESULT':
               setOutput(e.data.results)
               break
            case 'INFERENCE_DONE':
               setFinished(true)
               console.log('INFERENCE_DONE')
               break
         }
      }
      worker.current.addEventListener('message', onMessageReceived)
      return () => {
         worker.current.removeEventListener('message', onMessageReceived)
      }
   }, [])

   const readAudioFrom = async () => {
      const sampling_rate = 16000
      const audioCTX = new AudioContext({ sampleRate: sampling_rate }) // 16 kHz

      const response = await file.arrayBuffer()
      const audioBuffer = await audioCTX.decodeAudioData(response)
      const audio = audioBuffer.getChannelData(0)
      return audio
   }

   const handleSubmitForm = async (e) => {
      if (!file && !audioStream) return
      let audio = await readAudioFrom(file ? file : audioStream)
      const model_name = `openai/whisper-tiny.en`

      worker.current.postMessage({
         type: MessageTypes.INFERENCE_REQUEST,
         audio,
         model_name,
      })
   }

   function handleResetAudio() {
      setFile(null)
      setAudioStream(null)
   }

   const worker = useRef(null)
   return (
      <>
         <div className='flex flex-col  max-w-[1000px] mx-auto w-full'>
            <section className='min-h-screen flex flex-col'>
               <Header />
               {output ? (
                  <Information />
               ) : loading ? (
                  <Transcribing />
               ) : isAudioAvailable ? (
                  <FileDisplay
                     file={file}
                     audioStream={setAudioStream}
                     handleResetAudio={handleResetAudio}
                  />
               ) : (
                  <HomePage setFile={setFile} setAudioStream={setAudioStream} />
               )}
            </section>
            <footer></footer>
         </div>
      </>
   )
}

export default App
