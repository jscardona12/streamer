//this makes sure that our code will work on different browsers
// var RTCPeerConnection = window.webkitRTCPeerConnection;

//Create an account on Firebase, and use the credentials they give you in place of the following
var config = {
    apiKey: "AIzaSyAMgiBZowk9ECboqK9pC8VPgA3GsSFyed8",
    authDomain: "safeco-jscardona.firebaseapp.com",
    databaseURL: "https://safeco-jscardona.firebaseio.com",
    projectId: "safeco-jscardona",
    storageBucket: "safeco-jscardona.appspot.com",
    messagingSenderId: "551219937787"
};
firebase.initializeApp(config);


var database = firebase.database().ref();
var yourVideo = document.getElementById("yourVideo");
var friendsVideo = document.getElementById("friendsVideo");
var yourId = 1;
var servers = {
    'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}, {
        'url': 'turn:numb.viagenie.ca',
        'credential': 'websitebeaver',
        'username': 'websitebeaver@email.com'
    }]
};
var pc = null;

// pc.onicecandidate = (function (event) {
//     sendMessage(yourId, JSON.stringify({'ice': event.candidate}))
//     console.log("sendIce");
// } );


firebase.database().ref('users/' + yourId).set({
    username: 'streamer',
});
var peticion = firebase.database().ref('users/' + yourId + '/petitions');
peticion.on('child_added', readMessage);
function sendMessage(senderId, data) {
    console.log("Envio mensaje..");
    var msg = firebase.database().ref('users/' + senderId + '/petitions').push({sender: senderId, message: data});
    msg.remove()
}

function readMessage(data) {
    console.log("reading");
    console.log(data);
    var sender = data.val().receiverID;

    if (data.val().type == "petition") {
        console.log("0");
        stream(sender);
    }
    if (data.val().message) {
        var msg = JSON.parse(data.val().message);
        if (msg.ice != undefined) {
            console.log("1");
            pc.addIceCandidate(new RTCIceCandidate(msg.ice));
        }

        else if (msg.sdp.type == "answer") {
            console.log("2");
            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }

    }

};

// database.on('child_added', readMessage);


function stream(id) {
    pc = new RTCPeerConnection(servers) || new webkitRTCPeerConnection(servers);
    pc.addStream(document.getElementById("yourVideo").srcObject);

    // pc.onicecandidate = (function (event) {
    //     sendMessage(yourId, JSON.stringify({'ice': event.candidate}))
    //     console.log("sendIce");
    // } );
    pc.createOffer()
        .then(function (offer) {
            console.log(offer);
            pc.setLocalDescription(offer)
        })
        .then(function () {
            sendMessage(id, JSON.stringify({'sdp': pc.localDescription}))
        });
}

function showMyFace() {
    navigator.mediaDevices.getUserMedia({audio: true, video: true})
        .then(function (stream) {
            document.getElementById("yourVideo").srcObject = stream
        })
        .then(function (stream) {
            console.log(stream);
            if(pc)
                // pc.addStream(document.getElementById("yourVideo").srcObject);
            console.log(document.getElementById("yourVideo").srcObject);

        });

}