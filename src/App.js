import React, { useEffect, useRef, useState } from 'react';
import socket from 'socket.io-client';
import Peer from 'peerjs';


const ROOM_ID = '167272c3-0872-42cd-8796-5b7e081c680a';
const CAPTURE_OPTIONS = {
  audio: true,
  video: true,
};





function App() {
  const [users, setUsers] = useState({});
  const refs = {};

  const connectToNewUser = (userId, stream, peer) => {
    const call = peer.call(userId, stream);
    

    call.on('stream', userVideoStream => {
      setUsers(users => ({ ...users, [userId]: { stream: userVideoStream } }));
      // addVideoStream(video, userVideoStream)
    });
  }

  useEffect(() => {
    const sock = socket.connect('http://localhost:3000/', {
      secure: false, 
      withCredentials: true,
      reconnectionAttempts: 2
    });

    const peer = new Peer(undefined, {
      host: '/',
      port: '3001',
      secure: false
    });

    peer.on('open', id => {
      console.log('asd')
      sock.emit('join-room', ROOM_ID, id)
    });

    navigator
      .mediaDevices
      .getUserMedia(CAPTURE_OPTIONS)
      .then(stream => {

        peer.on('call', call => {
          call.answer(stream)

          call.on('stream', userVideoStream => {
            setUsers(users => ({ ...users, [peer.id]: { stream: userVideoStream } }));
          })
        })
    
        sock.on('user-connected', userId => {
          console.log('user')
          connectToNewUser(userId, stream, peer)
        })
      });
    

    peer.on('open', id => {
      console.log('asd')
      sock.emit('join-room', ROOM_ID, id)
    });

    sock.on('user-connected', userId => {
      console.log('user')
    })

    return () => {
      peer?.close()
    }
  }, []);

  function handleCanPlay(id) {
    if (users[id].ref) {
      users[id].ref.current.play();
    }
  }

  return (
    <div className="App">
      <h1>VideoCall</h1>
      {Object.keys(users).map(userId => (
         <video
          ref={vidRef => {
            if (vidRef) {
              vidRef.srcObject = users[userId].stream;
              refs[userId] = vidRef;
            }
          }}
          onCanPlay={() => handleCanPlay(userId)}
          autoPlay
          playsInline
          muted
        />
      ))}
    </div>
  );
}

export default App;
