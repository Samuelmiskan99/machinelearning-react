import { pipeline, Pipeline } from '@xenova/transformers'
import { MessageTypes } from './preset'

class MyTranscriptionPipeline extends Pipeline {
   static task = 'automatic-speech-recognition'
   static mode = 'openai/whisper-tiny.en'
   static instance = null

   static async getInstance(progressCallback = null) {
      if (this.instance === null) {
         this.instance = await pipeline(this.task, null, {
            progressCallback,
         })
      }
      return this.instance
   }
}

self.addEventListener('message', async (e) => {
   const { type, audio } = e.data
   if (type === MessageTypes.INFERENCE_REQUEST) {
      await transcribe(audio)
   }
})

async function transcribe(audio) {
   sendLoadingMessage('loading')
   let pipeline

   try {
      pipeline = await MyTranscriptionPipeline.getInstance(load_model_callback)
   } catch (err) {
      console.error(err)
      return
   }
   sendLoadingMessage('success')

   const stride_length_s = 5
   const generationTracker = new generationTracker(pipeline, stride_length_s)
   await pipeline(audio, {
      top_k: 0,
      do_sample: false
      chunk_length: 30,
      stride_length_s,
      return_timestamps: true,
      callback_function: generationTracker.callbackFunction.bind(generationTracker),
      chunk_callback: generationTracker.chunkCallback.bind(generationTracker),
   })
   generationTracker.sendFinalResult()
}

async function load_model_callback(data){
    const {status} = data
    if (status === 'progress'){
        const {file,progress,loaded,total} = data
        sendDownloadingMessage(file,progress,loaded,total)
    }
}

function sendLoadingMessage(status){
    self.postMessage({
        type: MessageTypes,
        status: status
    })
}

async function sendDownloadingMessage(file, progress, loaded, total) {
    self.postMessage({
        type: MessageTypes.DOWNLOADING,
        file,
        progress,
        loaded,
        total
    })
}
