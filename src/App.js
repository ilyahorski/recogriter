import React, { useState, useRef, useEffect } from 'react';
import {Cropper} from 'react-mobile-cropper';
import Dropzone from 'react-dropzone'
import helperFunction from './helperFunctions';
import 'tailwindcss/tailwind.css';
import 'react-mobile-cropper/dist/style.css'

function App() {
    const [image, setImage] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [text, setText] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const cropperRef = useRef(null);

    useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => {
        document.removeEventListener('paste', handlePaste);
        };
        }, []);

    useEffect(() => {
        const recognizeText = async () => {
            if (croppedImage) {
                try {
                    const detectedText = await helperFunction(croppedImage);
                    setText(detectedText.text);
                } catch (error) {
                    console.error("Ошибка при анализе изображения:", error);
                }
            }
        };
    
        recognizeText();
        }, [croppedImage]);

    const handleAnalyze = async () => {
        const cropper = cropperRef.current;
        if (cropper) {
            const canvas = cropper.getCanvas();
            if (canvas) {
                const dataUrl = canvas.toDataURL();
                const base64Image = dataUrl.split(',')[1];
                setCroppedImage(base64Image); 
            }
        }
    }; 
        
    const handleDrop = (acceptedFiles) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            const fileUrl = URL.createObjectURL(file);
            setImage(fileUrl);
        }
    };

    
    const handlePaste = (event) => {
        if (event.clipboardData && event.clipboardData.items) {
            const items = event.clipboardData.items;
            for (const item of items) {
                if (item.type.indexOf('image') === 0) {
                    const file = item.getAsFile();
                    const fileUrl = URL.createObjectURL(file);
                    setImage(fileUrl);
                    break;
                }
            }
        }
    };

    const copyToClipboard = async () => {
        if (text) {
            try {
                await navigator.clipboard.writeText(text);
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 1000); 
            } catch (err) {
                console.error('Не удалось скопировать текст: ', err);
            }
        }
    };

    const handleCancel = () => {
        setImage(null);
        setCroppedImage(null);
        setText('');
    };

    return (
        <div className="container mx-auto p-4">
      <label>
        <Dropzone onDrop={handleDrop} onPaste={handlePaste} noClick={true} maxFiles={1} accept={'image/*'}>
            {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()} className='w-full flex items-center gap-2 p-4 mb-2 h-[56px] border-4 border-dashed border-gray-300 rounded-lg bg-white bg-opacity-50'>
                    <input {...getInputProps()} />
                    <p>Drop image here or click to select or use paste "Ctrl + V"</p>
                </div>
            )}
        </Dropzone>
      </label>
        <div className={image ? 'w-full max-h-[450px] min-h-[400px] border-4 border-dashed border-gray-300 rounded-lg' : 'hidden'}>
            <Cropper
                ref={cropperRef}
                src={image}
                className={'w-full h-[400px]'}
                stencilProps={{
                grid: true
                }}
            />
        </div>
        <div className="flex justify-between my-2">
            <div className="flex space-x-2">
                {image && (
                    <button 
                        onClick={handleAnalyze}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Recognize text
                    </button>
                )}
            </div>

            {image && (
                <button 
                    onClick={handleCancel}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                    Cancel
                </button>
            )}
        </div>


        {text && (
            <div>
                <div className="border-2 border-gray-400 p-2 rounded">
                    {text}
                </div>
                <button 
                    onClick={copyToClipboard}
                    className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded mt-2"
                >
                    Copy text to clipboard
                </button>
            </div>
        )}

        {showAlert && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded mt-4">
                Text copied to clipboard!
            </div>
        )}
        </div>
    );
}

export default App;

