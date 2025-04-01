import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X, FileText, FolderOpen } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (file: File | File[]) => void;
  acceptedFormats: string[];  // Example: ['.png', '.jpeg', '.jpg'] or ['.npy']
  isFolderUpload?: boolean;   // True → Folder Upload (for Lung Numpy: multiple `.npy` files)
  isSingleNpy?: boolean;      // True → Only Single `.npy` File (for Lung Image)
}

function ImageUploader({ onUpload, acceptedFormats, isFolderUpload = false, isSingleNpy = false }: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | File[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      if (isFolderUpload) {
        // 🚀 **Lung (Numpy) Model** → Folder with `.npy` files ONLY
        if (!acceptedFiles.every(file => file.name.endsWith('.npy'))) {
          setErrorMessage('Error: Folder must contain only .npy files.');
          return;
        }
        if (acceptedFiles.length === 1) {
          setErrorMessage('Error: Select a folder containing multiple .npy files.');
          return;
        }
        setSelectedFile(acceptedFiles);
        setErrorMessage(null);
        onUpload(acceptedFiles);
      } 
      else if (isSingleNpy) {
        // ✅ Ensure only `.npy` file is allowed
        if (acceptedFiles.length !== 1 || !acceptedFiles[0].name.toLowerCase().endsWith('.npy')) {
          setErrorMessage('Error: Only a single .npy file is allowed.');
          return;
        }
        setSelectedFile(acceptedFiles[0]);
        setErrorMessage(null);
        onUpload(acceptedFiles[0]);
      } 
      else {
        // 🚀 **Brain Tumor Model** → `.png`, `.jpeg`, `.jpg` ONLY
        const file = acceptedFiles[0];
        const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

        if (!acceptedFormats.includes(fileExtension)) {
          setErrorMessage(`Invalid file type. Allowed: ${acceptedFormats.join(', ')}`);
          return;
        }

        if (file.size > 10485760) {
          setErrorMessage('File size exceeds 10MB limit.');
          return;
        }

        setSelectedFile(file);
        setErrorMessage(null);
        onUpload(file);
      }
    }
  }, [onUpload, acceptedFormats, isFolderUpload, isSingleNpy]);

  // **💡 Fix `accept` Issue**
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple: isFolderUpload, 
    maxSize: 10485760,
    accept: isFolderUpload || isSingleNpy 
      ? {} // 🔥 Fix: Don't use `accept` for `.npy`, validate inside `onDrop`
      : acceptedFormats.reduce((acc, format) => ({ ...acc, [format]: [] }), {}),  
  });
  

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
        ${isDragActive ? 'border-[var(--medical-green-500)] bg-[var(--medical-green-50)]' : 'border-[var(--medical-green-300)] hover:border-[var(--medical-green-400)] hover:bg-[var(--medical-green-50)]'}
        ${isDragReject || errorMessage ? 'border-red-500 bg-red-50' : ''}
      `}
      role="button"
      tabIndex={0}
      aria-label="Upload medical scan"
    >
      <input {...getInputProps()} {...(isFolderUpload ? { directory: '', webkitdirectory: '' } : {})} />
      <div className="space-y-4">
        {errorMessage ? (
          <>
            <X className="h-12 w-12 text-red-500 mx-auto" />
            <p className="text-red-600 font-medium">{errorMessage}</p>
          </>
        ) : isDragReject ? (
          <>
            <X className="h-12 w-12 text-red-500 mx-auto" />
            <p className="text-red-600 font-medium">Invalid file type or size</p>
          </>
        ) : isDragActive ? (
          <>
            <Upload className="h-12 w-12 text-[var(--medical-green-500)] mx-auto animate-bounce" />
            <p className="text-[var(--medical-green-600)] font-medium">Drop your scan here</p>
          </>
        ) : (
          <>
            {isFolderUpload ? (
              <FolderOpen className="h-12 w-12 text-[var(--medical-green-400)] mx-auto" />
            ) : (
              <ImageIcon className="h-12 w-12 text-[var(--medical-green-400)] mx-auto" />
            )}
            <div>
              <p className="text-[var(--medical-green-600)] font-medium">
                {isFolderUpload 
                  ? 'Upload a folder with multiple .npy files' 
                  : isSingleNpy 
                    ? 'Upload a single .npy file' 
                    : 'Upload your medical scan'}
              </p>
              <p className="text-[var(--medical-green-500)]">
                or <span className="text-[var(--medical-green-600)]">click to browse</span>
              </p>
            </div>
          </>
        )}

        <div className="text-sm text-[var(--medical-green-600)]">
          <p>Supported formats: {acceptedFormats.join(', ')}</p>
          <p>Maximum file size: 10MB</p>
        </div>
      </div>

      {/* Display uploaded file/folder info */}
      {selectedFile && !errorMessage && (
        <div className="mt-4 flex items-center justify-center space-x-2 text-[var(--medical-green-700)]">
          <FileText className="h-6 w-6" />
          <p className="font-medium">
            {Array.isArray(selectedFile) ? `${selectedFile.length} files uploaded` : selectedFile.name}
          </p>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
