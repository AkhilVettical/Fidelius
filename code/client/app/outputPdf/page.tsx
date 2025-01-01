"use client"

import React from 'react'
import { Worker, Viewer } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'

// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

// You can change the path to your PDF file here
const pdfFilePath = '/Sreehari.pdf' // Ensure this file is located in the public folder

const PdfViewer = () => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin()

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-200">
      <header className="py-6 px-4 bg-gray-800">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">PDF Viewer</h1>
          <p className="text-gray-400">View and navigate through PDF documents</p>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
            <Viewer
              fileUrl={pdfFilePath}
              plugins={[defaultLayoutPluginInstance]}
              defaultScale={1}
              theme={{
                theme: 'dark',
              }}
            />
          </Worker>
        </div>
      </main>

      <footer className="py-4 bg-gray-800 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} PDF Viewer. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default PdfViewer