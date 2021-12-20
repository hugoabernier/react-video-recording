import * as React from 'react';
import { useState } from 'react';
import styles from './VideoRecord.module.scss';
import * as strings from 'VideoRecordWebPartStrings';
import { IVideoRecordProps } from './IVideoRecordProps';
import { ReactMediaRecorder } from 'react-media-recorder';
import { VideoPreview } from './VideoPreview';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { css } from "@uifabric/utilities/lib/css";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/attachments";
import "@pnp/sp/site-users/web";
import { IItemAddResult } from "@pnp/sp/items";
import { ISiteUserInfo } from '@pnp/sp/site-users/types';
import { Placeholder } from "@pnp/spfx-controls-react/lib/Placeholder";

export const VideoRecord = (props: IVideoRecordProps) => {
  const [hasRecorded, setHasRecorded] = useState(false);
  const [hasSymptoms, setHasSymptoms] = useState(false);
  const [isVaccinated, setIsVaccinated] = useState(false);
  const [hadContact, setHadContact] = useState(false);


  if (props.list === undefined ) {
    return (<Placeholder iconName='Edit'
    iconText={strings.ConfigureIconText}
    description={strings.ConfigureInstructions}
    buttonLabel={strings.ConfigureButtonLabel}
    onConfigure={props.onConfigure} />);
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.log("enumerateDevices() not supported.");
    return;
  }

  // List cameras and microphones.

  navigator.mediaDevices.enumerateDevices()
    .then((devices) => {
      devices.forEach((device) => {
        console.log(device.kind + ": " + device.label +
          " id = " + device.deviceId);
      });
    })
    .catch((err) => {
      console.log(err.name + ": " + err.message);
    });

  return (
    <div className={styles.videoRecord}>
      {!hasRecorded && <Stack>
        <Label>
          <p>Have  you had one or more of these symptoms in the past 10 days? </p>
          <ul>
            <li>Fever or chills</li>
            <li>Cough</li>
            <li>Shortness of breath or difficulty breathing</li>
            <li>New loss of taste or smell</li>
            <li>Fatigue</li>
            <li>Muscle or body aches</li>
            <li>Headache</li>
            <li>Sore throat</li>
            <li>Congestion or runny nose</li>
            <li>Nausea or vomiting</li>
            <li>Diarrhea</li>
          </ul>
        </Label>
        <Toggle label="I did experience some of the symptoms above" onText="Yes" offText="No" role="checkbox" checked={hasSymptoms} onChange={(_event: React.MouseEvent<HTMLElement>, checked?: boolean) =>{
          setHasSymptoms(checked);
        } } />
        <Toggle label="Are you fully vaccinated against COVID-19 (you are fully vaccinated 2 weeks after your second dose in a 2-dose series, or 2 weeks after your first dose of a single-dose vaccine)?"  checked={isVaccinated}  onText="Yes" offText="No" role="checkbox"  onChange={(_event: React.MouseEvent<HTMLElement>, checked?: boolean) =>{
          setIsVaccinated(checked);
        } } />
        <Toggle label="Have you had close contact with someone with COVID-19 in the past 14 days?"  checked={hadContact}  onText="Yes" offText="No" role="checkbox"  onChange={(event: React.MouseEvent<HTMLElement>, checked?: boolean) =>{
          setHadContact(checked);
        } } />
        <ReactMediaRecorder
          video={{
                deviceId: { exact: "50cbfc93f05355a2b2fa67d61d01c0a9dbf9b1a4fa980b86d40cb3df7d64f0df" }
          }}
          onStop={async (blobUrl: string, blob: Blob) => {
            setHasRecorded(true);
            console.log("BlobURL", blobUrl);
            console.log("Blob", blob);

            const today = new Date();
            const time =  today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + '-' + today.getHours() + '-' + today.getMinutes() + '-' + today.getSeconds();

            let userProps: ISiteUserInfo = await sp.web.currentUser.get();

            // add an item to the list
            const iar: IItemAddResult = await sp.web.lists.getById(props.list).items.add({
              Title: `${userProps.Title}'s attestation`,
              ExperiencedSymptoms: hasSymptoms,
              IsVaccinated: isVaccinated,
              HadContact: hadContact
            });

            await iar.item.attachmentFiles.add(`${time}.webm`, blob);
          }}

          blobPropertyBag={{
            type: 'video/webm'
          }}
          render={({ status, startRecording, stopRecording, mediaBlobUrl, previewStream }) => (
            <div>
              {status == 'recording' && <VideoPreview stream={previewStream} />}
              {status == 'recording' && (<div><FontIcon aria-label={strings.RecordingLabel} iconName="CircleShapeSolid" className={styles.recordingStatus} /> {strings.RecordingLabel}</div>)}
              {status == 'stopped' && (<div><FontIcon aria-label={strings.PlaybackLabel} iconName="Play" className={styles.playbackStatus} /> {strings.PlaybackLabel}</div>)}
              {status != 'recording' && <DefaultButton onClick={startRecording} text={strings.RecordButtonLabel} iconProps={{ iconName: 'CircleShapeSolid' }} />}
              {status == 'recording' && <DefaultButton onClick={stopRecording} text={strings.StopButtonLabel} iconProps={{ iconName: 'StopSolid' }} />}
              {status == 'stopped' && <video src={mediaBlobUrl} controls autoPlay loop className={styles.videoCanvas} />}
            </div>
          )}
        />
      </Stack>
      }
      {hasRecorded && <div className={styles.success}>
        <div>{strings.SuccessMessageLabel}</div>
        <div className={styles.svgBox}>
                <svg className={css(styles.circular,styles.greenStroke)}>
                    <circle className={styles.path} cx="75" cy="75" r="50" fill="none" stroke-width="5" stroke-miterlimit="10"/>
                </svg>
                <svg className={css(styles.checkmark, styles.greenStroke)}>
                    <g transform="matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-489.57,-205.679)">
                        <path fill="none" d="M616.306,283.025L634.087,300.805L673.361,261.53"/>
                    </g>
                </svg>
            </div>
        </div>}

    </div>
  );
};