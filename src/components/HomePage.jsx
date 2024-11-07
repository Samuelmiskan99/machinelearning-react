import { useState, useEffect, useRef } from 'react'

import { SiAudiobookshelf } from 'react-icons/si'

const HomePage = (props) => {
   const { setFile, setAudioStream } = props

   const [recordingStatus, setRecordingStatus] = useState('inactive')
   const [audioChunks, setAudioChunks] = useState([])
   const [duration, setDuration] = useState(0)
   const [selectedDeviceId, setSelectedDeviceId] = useState(null)
   const [audioDevices, setAudioDevices] = useState([])
   const [isDropdownOpen, setIsDropdownOpen] = useState(false) // State untuk mengontrol dropdown

   const mediaRecorder = useRef(null)
   const mimeType = 'audio/webm'

   // Fungsi untuk memulai perekaman
   const startRecording = async () => {
      let tempStream
      console.log('Start Recording')

      try {
         const streamData = await navigator.mediaDevices.getUserMedia({
            audio: {
               deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            },
            video: false,
         })
         tempStream = streamData
      } catch (err) {
         console.error('Could not start audio source:', err.message)
         return
      }
      setRecordingStatus('recording')

      const media = new MediaRecorder(tempStream, { mimeType })
      mediaRecorder.current = media

      mediaRecorder.current.start()
      let localAudioChunks = []
      mediaRecorder.current.ondataavailable = (event) => {
         if (event.data && event.data.size > 0) {
            localAudioChunks.push(event.data)
         }
      }
      setAudioChunks(localAudioChunks)
   }

   // Fungsi untuk menghentikan perekaman
   const stopRecording = async () => {
      setRecordingStatus('inactive')
      console.log('Stop Recording')

      mediaRecorder.current.stop()
      mediaRecorder.current.onstop = () => {
         const audioBlob = new Blob(audioChunks, { type: mimeType })
         setAudioStream(audioBlob)
         setAudioChunks([])
         setDuration(0)
      }
   }

   // Mengupdate durasi saat perekaman berlangsung
   useEffect(() => {
      if (recordingStatus !== 'recording') {
         return
      }
      const interval = setInterval(() => {
         setDuration((curr) => curr + 1)
      }, 1000)

      return () => clearInterval(interval)
   }, [recordingStatus])

   // Fungsi untuk meng-handle input file
   const handleInput = (e) => {
      const tempFile = e.target.files[0]
      setFile(tempFile)
   }

   // Mengambil daftar perangkat audio saat komponen pertama kali dimuat
   useEffect(() => {
      const getAudioDevices = async () => {
         try {
            const devices = await navigator.mediaDevices.enumerateDevices()
            const audioInputDevices = devices.filter((device) => device.kind === 'audioinput')
            setAudioDevices(audioInputDevices)
         } catch (err) {
            console.error('Error fetching audio devices:', err.message)
         }
      }
      getAudioDevices()
   }, [])

   return (
      <main className='relative flex-1 p-4 flex flex-col justify-center gap-3 text-center sm:gap-4 '>
         <h1 className='font-semibold text-5xl sm:text-6xl md:text-7xl'>
            Free<span className='text-red-400 bold '>Scribe</span>
         </h1>
         <h3 className='font-medium md:text-lg'>
            Record <span className='text-blue-400'> &rarr;</span> Transcribe
            <span className='text-blue-400'> &rarr;</span> Translate
         </h3>

         {/* Button for Dropdown in Top Right Corner */}

         <div className='absolute top-1 right-6 '>
            <button
               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
               className='p-2 bg-white rounded-full  hover:bg-gray-200 focus:outline-none w-'>
               <SiAudiobookshelf className='text-gray-700 w-6 h-6' />
            </button>

            {isDropdownOpen && (
               <div className='absolute mt-2 right-0 bg-gray-900 border border-gray-300 rounded-md shadow-lg w-48 z-10 mr flex flex-col'>
                  <label className=' text-sm font-semibold text-white px-4 pt-2 mb-2 flex'>
                     Select Audio Source:
                  </label>
                  <select
                     className='w-full p-2 text-sm border-none focus:outline-none text-indigo-900'
                     onChange={(e) => {
                        setSelectedDeviceId(e.target.value)
                        setIsDropdownOpen(false) // Menutup dropdown setelah memilih
                     }}
                     value={selectedDeviceId || ''}>
                     <option value=''>Default</option>
                     {audioDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                           {device.label || `Microphone ${device.deviceId}`}
                        </option>
                     ))}
                  </select>
               </div>
            )}
         </div>

         <button
            className='flex items-center text-base justify-between gap-4 mx-auto w-72 max-w-full my-4 specialBtn px-4 py-2 rounded-xl'
            onClick={recordingStatus === 'recording' ? stopRecording : startRecording}>
            <p className='text-red-400'>
               {recordingStatus === 'inactive' ? 'Start Recording' : 'Stop Recording'}
            </p>
            <div className='flex items-center gap-2'>
               {duration !== 0 && <p className='text-sm'>{duration}s</p>}
               <i
                  className={
                     'fa-solid fa-microphone duration-200' +
                     (recordingStatus === 'recording' ? ' text-rose-300' : '')
                  }></i>
            </div>
         </button>

         <p className='text-base'>
            Or{' '}
            <label className='text-blue-400 cursor-pointer hover:text-blue-600 duration-200'>
               Upload{' '}
               <input
                  onChange={(e) => handleInput(e)}
                  type='file'
                  className='hidden'
                  accept='.mp3,.wave'
               />
            </label>
            mp3 file
         </p>
         <p className='italic text-slate-400'>Do whatever you want</p>
      </main>
   )
}

export default HomePage
