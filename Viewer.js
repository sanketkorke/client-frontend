import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('https://client-remote-backend.onrender.com');

export default function Viewer() {
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);

    useEffect(() => {
        peerConnection.current = new RTCPeerConnection();

        peerConnection.current.ontrack = (event) => {
            remoteVideoRef.current.srcObject = event.streams[0];
        };

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('candidate', event.candidate);
            }
        };

        async function requestStream() {
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            socket.emit('offer', offer);

            socket.on('answer', async (answer) => {
                await peerConnection.current.setRemoteDescription(answer);
            });

            socket.on('candidate', async (candidate) => {
                await peerConnection.current.addIceCandidate(candidate);
            });
        }

        requestStream();

        return () => socket.disconnect();
    }, []);

    return (
        <div>
            <h1>Remote Camera Viewer</h1>
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '300px', background: '#000' }} />
        </div>
    );
}
