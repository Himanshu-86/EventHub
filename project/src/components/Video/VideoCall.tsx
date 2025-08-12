import React from 'react';
import AgoraUIKit, { Props } from 'agora-react-uikit';

interface VideoCallProps {
  channelName: string;
  setInCall: (inCall: boolean) => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ channelName, setInCall }) => {
  const appId = 'YOUR_AGORA_APP_ID'; // Replace with your App ID
  const token = 'YOUR_AGORA_TOKEN'; // Replace with your temporary token

  if (appId === 'YOUR_AGORA_APP_ID' || !appId) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md">
        <h3 className="font-bold">Agora Credentials Missing</h3>
        <p>Please replace the placeholder Agora App ID and token in <code>src/components/Video/VideoCall.tsx</code> to enable the video call feature.</p>
      </div>
    );
  }

  const rtcProps: Props['rtcProps'] = {
    appId,
    channel: channelName,
    token,
    uid: 0,
  };

  const callbacks: Props['callbacks'] = {
    EndCall: () => setInCall(false),
  };

  return (
    <div className="video-call-container">
      <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
    </div>
  );
};

export default VideoCall;
