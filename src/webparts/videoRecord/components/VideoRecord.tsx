import * as React from 'react';
import styles from './VideoRecord.module.scss';
import { IVideoRecordProps } from './IVideoRecordProps';
import { IVideoRecordState } from './IVideoRecordState';
import { ReactMediaRecorder } from 'react-media-recorder';
import { VideoPreview } from './VideoPreview';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';



export const VideoRecord = () => {

  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.log("enumerateDevices() not supported.");
    return;
  }
  
  // List cameras and microphones.
  
  navigator.mediaDevices.enumerateDevices()
  .then(function(devices) {
    devices.forEach(function(device) {
      console.log(device.kind + ": " + device.label +
                  " id = " + device.deviceId);
    });
  })
  .catch(function(err) {
    console.log(err.name + ": " + err.message);
  });

  return (
  <div>
    <ReactMediaRecorder
      // video={{
      //   deviceId: "50cbfc93f05355a2b2fa67d61d01c0a9dbf9b1a4fa980b86d40cb3df7d64f0df"
      // }}
      video

      onStop={(blobUrl: string, blob: Blob) => {
        console.log("BlobURL", blobUrl);
        console.log("Blob", blob);
      }}
      
      blobPropertyBag={{
        type: 'video/webm'
      }}
      render={({ status, startRecording, stopRecording, mediaBlobUrl, previewStream }) => (
        <div>
{ status == 'recording' && <VideoPreview stream={previewStream} />}
          <p>{status}</p>
          { status != 'recording' && <DefaultButton onClick={startRecording} text="Start Recording"/>}
          { status == 'recording' && <DefaultButton onClick={stopRecording} text="Stop Recording"/>}
          { status == 'stopped' && <video src={mediaBlobUrl} controls autoPlay loop />}

        </div>
      )}
    />
  </div>
)};