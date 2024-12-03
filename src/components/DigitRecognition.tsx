/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";

const DigitRecognition: React.FC = () => {
    const [model, setModel] = useState<any>(null);
    const [prediction, setPrediction] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);

    const webcamRef = useRef<any>(null);

    useEffect(() => {
        const loadModel = async () => {
            setLoading(true);
            await tf.ready();
            await tf.setBackend("webgl");
            const mobilenet = await import("@tensorflow-models/mobilenet");
            const model = await mobilenet.load();
            setModel(model);
            setLoading(false);
        };
        loadModel();
    }, []);

    const captureFrame = async () => {
        setPrediction("");
        if (webcamRef.current && model) {
            const screenshot = webcamRef.current.getScreenshot();
            if (screenshot) {
                const imgElement = new Image();
                imgElement.src = screenshot;
                imgElement.onload = async () => {
                    const tensor = tf.browser.fromPixels(imgElement);
                    const predictions = await model.classify(tensor);
                    if (predictions.length > 0) {
                        setPrediction(predictions[0].className);
                    }
                };
            }
        }
    };

    return (
        <div className="h-svh max-w-[500px] w-full mx-auto ">
            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="w-12 h-12 border-4 border-green-500 border-solid rounded-full border-t-transparent animate-spin"></div>
                </div>
            ) : (
                <div className="relative flex flex-col justify-between h-full gap-6 my-auto sm:justify-normal">
                    {/* Камера */}
                    <div className="p-2 mt-0 sm:p-0 sm:mt-28">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width="100%"
                            videoConstraints={{
                                facingMode: "environment",
                            }}
                            className="w-full border rounded-[8px] mb-4"
                        />

                        <p className="font-mono text-lg text-center mx-h-[28px]">
                            {prediction ? (
                                <span className="text-green-500">
                                    {prediction}
                                </span>
                            ) : (
                                <span className="text-white">...</span>
                            )}
                        </p>
                    </div>
                    <div className="absolute bottom-0 w-full p-2 sm:relative sm:p-0">
                        <button
                            onClick={captureFrame}
                            className="px-4 py-3 bg-black bg-opacity-[4%] hover:bg-opacity-[8%] d rounded-[8px] w-full">
                            <p className="font-mono font-semibold">
                                Распознать
                            </p>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DigitRecognition;
