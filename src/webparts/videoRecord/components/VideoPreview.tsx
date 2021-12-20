import * as React from 'react';
import { useRef, useEffect } from 'react';
import styles from './VideoRecord.module.scss';
export const VideoPreview = ({ stream }: { stream: MediaStream | null }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);
    if (!stream) {
        return null;
    }
    return <video ref={videoRef} width={500} height={500} autoPlay controls  className={styles.videoCanvas}/>;
};