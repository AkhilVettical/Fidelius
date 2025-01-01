"use client";

import React, { useState } from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import { Upload, Check, X, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation'

interface HeaderControl {
  visible: boolean;
  mode: "mask" | "obfuscate" | null;
  prompt: string;
}

interface SubmitData {
  fileName: string;
  headers: {
    name: string;
    mode: "mask" | "obfuscate" | null;
    prompt: string;
  }[];
}

export default function HeaderControl() {
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [jsonOutput, setJsonOutput] = useState<string>("");
  const [backendColumns, setBackendColumns] = useState<string[]>([]);
  const [headerControls, setHeaderControls] = useState<Record<string, HeaderControl>>({});
  const [submitResponse, setSubmitResponse] = useState<string | null>(null);

  const router = useRouter();
  
  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const fileType = file.name.split('.').pop()?.toLowerCase();
    setFileName(file.name);
    setIsUploading(true);

    try {
      let response;
      if (fileType === 'csv') {
        response = await fetch("http://localhost:5000/getcsvheader", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filePath: file.path }),
        });
      } else if (fileType === 'pdf') {
        response = await fetch("http://localhost:5000/getpdfheader", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filePath: file.path }),
        });
      } else {
        throw new Error("Unsupported file type");
      }

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      const headers: string[] = result.headers.slice(1); // Remove the first element which is a description
      setBackendColumns(headers);

      const initialControls: Record<string, HeaderControl> = headers.reduce((acc, col) => {
        acc[col] = { visible: true, mode: null, prompt: "" };
        return acc;
      }, {} as Record<string, HeaderControl>);
      setHeaderControls(initialControls);

      setIsUploading(false);
    } catch (error) {
      console.error("Error:", error);
      setIsUploading(false);
    }
  };

  const dropzoneOptions: DropzoneOptions = { onDrop };
  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  const toggleColumnVisibility = (columnId: string) => {
    setHeaderControls((prev) => ({
      ...prev,
      [columnId]: { ...prev[columnId], visible: !prev[columnId].visible },
    }));
  };

  const setMode = (columnId: string, mode: "mask" | "obfuscate" | null) => {
    setHeaderControls((prev) => ({
      ...prev,
      [columnId]: { ...prev[columnId], mode },
    }));
  };

  const setPrompt = (columnId: string, prompt: string) => {
    setHeaderControls((prev) => ({
      ...prev,
      [columnId]: { ...prev[columnId], prompt },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const selectedHeaders = Object.entries(headerControls)
      .filter(([_, control]) => control.visible)
      .map(([key, control]) => ({
        name: key.replace(/^\d+\.\s/, ""), // Remove numbering
        mode: control.mode,
        prompt: control.prompt,
      }));

    const output: SubmitData = {
      fileName: fileName,
      headers: selectedHeaders,
    };
    console.log("Output:", selectedHeaders);
    setJsonOutput(JSON.stringify(output, null, 2));

    try {
      const response = await fetch("http://localhost:5000/maskobfcsv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(output),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      setSubmitResponse(result["output"]);
      if (result["output"] === "csv")
        router.push("/outputCsv"); // Redirect to the /outputCsv page
      else if (result["output"] === "pdf")
        router.push("/outputPdf"); // Redirect to the /outputPdf page

    } catch (error) {
      console.error("Error:", error);
      setSubmitResponse("Error submitting data to server");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className='container mx-auto p-4 max-w-4xl'>
      <header className='mb-8 text-center'>
        <h1 className='text-3xl font-bold mb-2'>CSV Header Control</h1>
        <p className='text-gray-600'>
          Upload your CSV file to manage header controls
        </p>
      </header>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-green-500 bg-green-200"
            : "border-gray-300 hover:border-green-500 hover:bg-green-200"
        }`}>
        <input {...getInputProps()} />
        <div className='flex flex-col items-center justify-center space-y-4'>
          {isUploading ? (
            <Loader2 className='w-12 h-12 text-blue-500 animate-spin' />
          ) : (
            <Upload className='w-12 h-12 text-gray-400' />
          )}
          {isUploading ? (
            <p className='text-lg font-medium'>Processing file...</p>
          ) : isDragActive ? (
            <p className='text-lg font-medium'>Drop the file here ...</p>
          ) : (
            <>
              <p className='text-lg font-medium text-gray-500'>
                Drag 'n' drop a CSV file here, or click to select a file
              </p>
              <p className='text-sm text-gray-500'>Supported file type: CSV</p>
            </>
          )}
        </div>
      </div>

      {fileName && (
        <div className='mb-6 text-center'>
          <p className='text-sm text-gray-600'>
            Uploaded file:{" "}
            <span className='font-medium text-gray-400'>{fileName}</span>
          </p>
        </div>
      )}

      {backendColumns.length > 0 && (
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>Header Controls</h2>
          <div className='overflow-x-auto'>
            <table className='min-w-full'>
              <thead>
                <tr>
                  <th className='px-4 py-2 text-left text-sm font-medium text-gray-200'>
                    Check
                  </th>
                  <th className='px-4 py-2 text-left text-sm font-medium text-gray-200'>
                    Header
                  </th>
                  <th className='px-4 py-2 text-left text-sm font-medium text-gray-200'>
                    Mode
                  </th>
                  <th className='px-4 py-2 text-left text-sm font-medium text-gray-200'>
                    Prompt
                  </th>
                </tr>
              </thead>
              <tbody>
                {backendColumns.map((column) => {
                  const control = headerControls[column];
                  return (
                    <tr
                      key={column}
                      className={control.visible ? "" : "opacity-50"}>
                      <td className='px-4 py-2 text-sm text-gray-900'>
                        <button
                          onClick={() => toggleColumnVisibility(column)}
                          className='p-1 rounded-full hover:bg-gray-200'
                          aria-label={
                            control.visible ? "Hide column" : "Show column"
                          }>
                          {control.visible ? (
                            <Check className='w-5 h-5 text-green-500' />
                          ) : (
                            <X className='w-5 h-5 text-red-500' />
                          )}
                        </button>
                      </td>
                      <td className='px-4 py-2 text-sm text-gray-200'>
                        {column.replace(/^\d+\.\s/, "")}
                      </td>
                      <td className='px-4 py-2 text-sm text-gray-200'>
                        <div className='flex items-center space-x-4'>
                          <label className='flex items-center'>
                            <input
                              type='radio'
                              checked={control.mode === "mask"}
                              onChange={() => setMode(column, "mask")}
                              className='form-radio h-4 w-4 text-blue-600'
                            />
                            <span className='ml-2'>Mask</span>
                          </label>
                          <label className='flex items-center'>
                            <input
                              type='radio'
                              checked={control.mode === "obfuscate"}
                              onChange={() => setMode(column, "obfuscate")}
                              className='form-radio h-4 w-4 text-blue-600'
                            />
                            <span className='ml-2'>Obfuscate</span>
                          </label>
                        </div>
                      </td>
                      <td className='px-4 py-2 text-sm text-gray-900'>
                        <input
                          type='text'
                          value={control.prompt}
                          onChange={(e) => setPrompt(column, e.target.value)}
                          placeholder='Enter prompt'
                          className='w-full px-2 py-1 text-sm border rounded'
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className='flex justify-end'>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
          {jsonOutput && (
            <div className='mt-4'>
              <h3 className='text-lg font-semibold mb-2'>JSON Output:</h3>
              <pre className='p-4 rounded overflow-x-auto text-gray-200 bg-gray-800'>
                {jsonOutput}
              </pre>
            </div>
          )}
          {submitResponse && (
            <div className='mt-4'>
              <h3 className='text-lg font-semibold mb-2'>Server Response:</h3>
              <pre className='p-4 rounded overflow-x-auto text-gray-200 bg-gray-800'>
                {submitResponse}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}