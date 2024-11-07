const express = require('express')
const axios = require('axios')
const app = express()
const PORT = 3001 // You can change the port if needed

// Endpoint to proxy requests to Hugging Face
app.get('/proxy-model', async (req, res) => {
   try {
      const modelUrl = 'https://huggingface.co/path/to/your/model' // Replace with actual model URL
      const response = await axios.get(modelUrl, {
         headers: {
            Authorization: `Bearer YOUR_HUGGING_FACE_TOKEN`, // Replace with your Hugging Face token
         },
      })
      res.json(response.data) // Send the model data back to your app
   } catch (error) {
      console.error('Error fetching model data:', error)
      res.status(500).json({ error: 'Failed to fetch model data' })
   }
})

app.listen(PORT, () => {
   console.log(`Proxy server running on http://localhost:${PORT}`)
})
