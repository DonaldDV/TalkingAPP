import React, { useState, useEffect } from 'react';
import styles from './UploadForm.module.css';

const UploadForm: React.FC = () => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);

    const checkStatus = async (taskId: string) => {
        try {
            const response = await fetch(`https://awzqa7xlqw9iby-5000.proxy.runpod.net/status/${taskId}`);
            if (!response.ok) {
                throw new Error(`Status check failed: ${response.status}`);
            }
            const data = await response.json();
            if (data.status === 'completed') {
                setVideoUrl(`https://awzqa7xlqw9iby-5000.proxy.runpod.net/result/${taskId}`);
            } else if (data.status === 'failed') {
                throw new Error(data.error || 'Processing failed');
            }
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('An unknown error occurred while checking status.');
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        if (taskId) {
            const interval = setInterval(() => {
                checkStatus(taskId);
            }, 5000); // Poll every 5 seconds

            return () => clearInterval(interval);
        }
    }, [taskId]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setErrorMessage(null);
        setVideoUrl(null);
        const formData = new FormData(event.currentTarget);

        try {
            const response = await fetch('https://awzqa7xlqw9iby-5000.proxy.runpod.net/process', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            if (data.task_id) {
                setTaskId(data.task_id);
            } else {
                throw new Error('No task ID returned from server.');
            }
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('An unknown error occurred.');
            }
            setLoading(false);
        }
    };

    return (
        <div className={styles.uploadForm}>
            <h2>Generate Video</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label htmlFor="image">Image File:</label>
                    <input type="file" name="image" accept="image/*" required />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="audio">Audio File:</label>
                    <input type="file" name="audio" accept="audio/*" required />
                </div>
                <button type="submit" disabled={loading} className={styles.submitButton}>
                    {loading ? 'Uploading and Processing...' : 'Upload and Process'}
                </button>
            </form>
            {loading && <p className={styles.statusMessage}>Processing, please wait...</p>}
            {errorMessage && <p className={styles.errorMessage}>Error: {errorMessage}</p>}
            {videoUrl && (
                <div className={styles.videoContainer}>
                    <p>Processing complete:</p>
                    <video width="256" autoPlay loop>
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            )}
        </div>
    );
};

export default UploadForm;
