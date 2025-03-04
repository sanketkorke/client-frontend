import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('https://client-remote-backend.onrender.com'); // Make sure backend is running

export default function Streamer() {
    const localVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const [streaming, setStreaming] = useState(false);

    useEffect(() => {
        socket.on('offer', async (offer) => {
            console.log('Received offer from viewer');
            await peerConnection.current.setRemoteDescription(offer);
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            socket.emit('answer', answer);
        });

        socket.on('candidate', async (candidate) => {
            await peerConnection.current.addIceCandidate(candidate);
        });

        return () => socket.disconnect();
    }, []);

    async function startStreaming() {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;

        peerConnection.current = new RTCPeerConnection();
        stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('candidate', event.candidate);
            }
        };

        setStreaming(true);
    }

    return (
        <div>
            <h1>Remote Camera Streamer</h1>
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '300px', background: '#000' }} />
            {!streaming && <button onClick={startStreaming}>Start Streaming</button>}
        </div>
    );
}
