//Where JavaScript for front end is going to live
const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

var peer = new Peer(undefined, {
    // path: '/peerjs',
    //host: '/',
    //port: '443'
    secure: true, 
    host: '0.peerjs.com',
    port: '443'
});

let myVideoStream 
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true 
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream); 

    peer.on('call', call => {
        call.answer(stream); 
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
        })
    })

    //someone else gets connected
    socket.on('user-connected', (userId) => {
        connecToNewUser(userId, stream);
    })


    //Dealing with chat messages and functions
    // $ is the shorthand for JQUERY
    let text = $("input")

    //e is the event of typing on the keyboard
    // 13 is the code for the enter key, and we don't want to send an empty message
    $('html').keydown((e) => {
        if (e.which == 13 && text.val().length !== 0) {
            socket.emit('message', text.val());
            //after pressing enter we want to clear the text box
            text.val('')
        }
    })

    socket.on("createMessage", message => {
        //after every message we will append to the ul which will have class message
        $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
        scrollToBottom()
    })

    socket.on("user-disconnected", (id) => {
        console.log(peer);
        if (peer[id]) peer[id].close();
    });


})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

//when a new user is connected
const connecToNewUser = (userId, stream) => {
    //call the connected user and send my stream
    const call = peer.call(userId, stream)
    //create a new video element for him
    const video = document.createElement('video')
    //recieve someone elses stream and add that video stream 
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream; 
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

//function which ensures the chat will not go off the page
const scrollToBottom = () => {
    var d = $('.main__chat__window');
    d.scrollTop(d.prop("scrollHeight"));
}


//function which enables/disables the mute button
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }
    else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
        <i class="mute fa-solid fa-microphone"></i>
        <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
        <i class="unmute fa-solid fa-microphone-slash"></i>
        <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}


//function which enables/disables the stop video button 
const playStop = () => {
    console.log('object')
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    }
    else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setPlayVideo = () => {
    const html = `
        <i class=" play fa-solid fa-video-slash"></i>
        <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `
        <i class="stop fa-solid fa-video"></i>
        <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

