window.addEventListener('load', ()=> {
    var output = document.getElementById('output'),
        input = document.getElementById('send-message-input'),
        userNameElem = document.getElementById('username'),
        usernameSendBtn = document.getElementById('username-send'),
        sendMsgBtnElm = document.getElementById('send-message-btn'),
        ws,
        username = 'Unknown';

    window.ChittyChat = {
        get ws() {
            return ws;
        },
        close: function() {
            if(ws) ws.close();
        }
    };

    function print(message) {
        var d = document.createElement('div'),
            u = document.createElement('span'),
            m = document.createElement('pre');

        d.classList.add('message');
        u.classList.add('user-name');
        m.classList.add('message-text');

        u.textContent = message.username;
        m.textContent = message.text.trim();

        d.appendChild(u);
        d.appendChild(m);
        output.appendChild(d);
        d.scrollIntoView();
    }

    function connect() {
        if(ws) return Promise.resolve(ws);

        return new Promise((resolve)=> {
            if(window.location.protocol.indexOf('s') >= 0) {
                ws = new WebSocket(`wss://${window.location.host}/room/1`);
            }else{
                ws = new WebSocket(`ws://${window.location.host}/room/1`);
            }

            ws.onopen = function() {
                resolve(ws);
            };
            ws.onclose = function() {
                print({username: 'Server', text: 'CLOSE'});
                username = '';
                ws = null;
            };
            ws.onmessage = function(evt) {
                let data = JSON.parse(evt.data);
                print({username: data.username || 'Server', text: data.text});
            };
            ws.onerror = function(evt) {
                let data = JSON.parse(evt.data);
                print({username: 'ERROR', text: data.text});
            };
        });
    }

    function sendChatMsgToServer(msg) {
        if(!msg) return Promise.reject();

        return connect().then((ws)=> {
            ws.send(JSON.stringify({
                content: {
                    text: msg
                }
            }));
        });
    }

    function sendMessage() {
        let msg = input.value,
            promiseOfUserName = Promise.resolve(username);
        sendMsgBtnElm.disabled = true;

        if(!username) {
            promiseOfUserName = setUserName(userNameElem.value);
        }

        return promiseOfUserName.then((username)=> {
            return sendChatMsgToServer(msg).then(()=>{
                print({username: username, text: input.value});
                input.value = '';
                input.focus();
                sendMsgBtnElm.disabled = false;
            });
        }).catch((e)=> {
            console.error(e);
            sendMsgBtnElm.disabled = false;
            input.focus();
            print({username: 'Server', text: 'Failed to send message.'});
        });
    }

    function sendUserNameToServer(un) {
        if(!un) return Promise.reject();

        return connect().then((ws)=> {
            ws.send(JSON.stringify({
                create: {
                    username: un
                }
            }));
            return un;
        });
    }

    function setUserName(un) {
        usernameSendBtn.disabled = true;
        return sendUserNameToServer(un).then((un)=> {
            username = un;
            input.focus();
            usernameSendBtn.disabled = false;
            return un;
        }).catch((e)=>{
            userNameElem.focus();
            username = '';
            print({username: 'Server', text: 'Failed to set user name. Try again.'});
            console.error(e);
            return Promise.reject(e);
        });
    }

    sendMsgBtnElm.addEventListener('click', (evt)=> {
        evt.preventDefault();
        if(!input.value) return false;
        sendMessage();
        return false;
    });

    usernameSendBtn.addEventListener('click', (evt)=> {
        evt.preventDefault();
        if(!userNameElem.value) return false;
        setUserName(userNameElem.value);
        return false;
    });
});
