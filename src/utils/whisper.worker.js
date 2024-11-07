import { pipeline } from '@xenova/transformers'
import { MessageTypes, LoadingStatus, ModelNames } from './preset'

class MyTranscriptionPipeline {
   static task = 'automatic-speech-recognition'
   static model = ModelNames.WHISPER_TINY_EN // Use model name from constants
   static instance = null

   static async getInstance(progress_callback = null) {
      if (this.instance === null) {
         try {
            console.log('Attempting to load model:', this.model)
            // Load the pipeline asynchronously
            this.instance = await pipeline(this.task, this.model, { progress_callback })
            console.log('Model loaded successfully:', this.model)
         } catch (err) {
            console.error('Error loading model:', err.message)
            if (err.message.includes("Unexpected token '<'")) {
               console.error(
                  'Model loading returned HTML instead of JSON. This might indicate a 404 error or a network issue.'
               )
               console.error(
                  'Check the model path and ensure it is accessible. Model name:',
                  this.model
               )
            } else {
               console.error('Other error encountered:', err)
            }
            sendLoadingMessage(LoadingStatus.ERROR) // Notify error status
            return null
         }
      }
      return this.instance
   }
}

self.addEventListener('message', async (event) => {
   const { type, audio } = event.data
   if (type === MessageTypes.INFERENCE_REQUEST) {
      await transcribe(audio)
   }
})

async function transcribe(audio) {
   sendLoadingMessage(LoadingStatus.LOADING)

   const pipeline = await MyTranscriptionPipeline.getInstance(load_model_callback)

   // Check if pipeline was successfully loaded
   if (!pipeline) {
      console.error('Pipeline failed to load')
      sendLoadingMessage(LoadingStatus.ERROR)
      return
   }

   // Proceed with transcribing if pipeline is valid
   sendLoadingMessage(LoadingStatus.SUCCESS)

   const stride_length_s = 5

   const generationTracker = new GenerationTracker(pipeline, stride_length_s)
   await pipeline(audio, {
      top_k: 0,
      do_sample: false,
      chunk_length: 30,
      stride_length_s,
      return_timestamps: true,
      callback_function: generationTracker.callbackFunction.bind(generationTracker),
      chunk_callback: generationTracker.chunkCallback.bind(generationTracker),
   })
   generationTracker.sendFinalResult()
}

async function load_model_callback(data) {
   const { status } = data
   if (status === 'progress') {
      const { file, progress, loaded, total } = data
      sendDownloadingMessage(file, progress, loaded, total)
   }
}

function sendLoadingMessage(status) {
   self.postMessage({
      type: MessageTypes.LOADING,
      status,
   })
}

async function sendDownloadingMessage(file, progress, loaded, total) {
   self.postMessage({
      type: MessageTypes.DOWNLOADING,
      file,
      progress,
      loaded,
      total,
   })
}

class GenerationTracker {
   constructor(pipeline, stride_length_s) {
      this.pipeline = pipeline
      this.stride_length_s = stride_length_s
      this.chunks = []

      // Check if pipeline and model configuration are defined
      if (!pipeline || !pipeline.model || !pipeline.model.config) {
         console.error('Pipeline or model configuration is missing')
         this.time_precision = 0 // Set default value to avoid undefined errors
      } else {
         this.time_precision =
            pipeline.processor.feature_extractor.config.chunk_length /
            pipeline.model.config.max_source_positions
      }

      this.processed_chunks = []
      this.callbackFunctionCounter = 0
   }

   sendFinalResult() {
      self.postMessage({ type: MessageTypes.INFERENCE_DONE })
   }

   callbackFunction(beams) {
      this.callbackFunctionCounter += 1
      if (this.callbackFunctionCounter % 10 !== 0) {
         return
      }

      const bestBeam = beams[0]
      let text = this.pipeline.tokenizer.decode(bestBeam.output_token_ids, {
         skip_special_tokens: true,
      })

      const result = {
         text,
         start: this.getLastChunkTimestamp(),
         end: undefined,
      }

      createPartialResultMessage(result)
   }

   chunkCallback(data) {
      this.chunks.push(data)
      if (!this.pipeline || !this.pipeline.tokenizer || !this.pipeline.tokenizer._decode_asr) {
         console.error('Tokenizer or decode function is missing')
         return
      }

      const [text, { chunks }] = this.pipeline.tokenizer._decode_asr(this.chunks, {
         time_precision: this.time_precision,
         return_timestamps: true,
         force_full_sequence: false,
      })

      this.processed_chunks = chunks.map((chunk, index) => {
         return this.processChunk(chunk, index)
      })

      createResultMessage(this.processed_chunks, false, this.getLastChunkTimestamp())
   }

   getLastChunkTimestamp() {
      if (this.processed_chunks.length === 0) {
         return 0
      }
      return this.processed_chunks[this.processed_chunks.length - 1].end
   }

   processChunk(chunk, index) {
      const { text, timestamp } = chunk
      const [start, end] = timestamp

      return {
         index,
         text: `${text.trim()}`,
         start: Math.round(start),
         end: Math.round(end) || Math.round(start + 0.9 * this.stride_length_s),
      }
   }
}

function createResultMessage(results, isDone, completedUntilTimestamp) {
   self.postMessage({
      type: MessageTypes.RESULT,
      results,
      isDone,
      completedUntilTimestamp,
   })
}

function createPartialResultMessage(result) {
   self.postMessage({
      type: MessageTypes.RESULT_PARTIAL,
      result,
   })
}
