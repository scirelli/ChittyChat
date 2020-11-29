window.addEventListener('load', ()=> {
    var output = document.getElementById('output'),
        input = document.getElementById('send-message-input'),
        ws,
        username = 'Unknown';

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

    function sendToServer(msg) {
        if(msg) {
            ws.send(JSON.stringify({
                content: {
                    text: msg
                }
            }));
        }
    }

    function sendMessage(evt) {
        let msg = input.value;
        sendToServer(msg);
        print({username: username, text: input.value});
        input.value = '';
        input.focus();
        evt.target.disabled = false;
    }

    function setUserName(un) {
        username = un;
        ws.send(JSON.stringify({
            create: {
                username: un
            }
        }));
        input.focus();
    }

    document.getElementById('send-message-btn').addEventListener('click', (evt)=> {
        evt.preventDefault();
        if(!input.value) return false;

        evt.target.disabled = true;
        if(!ws) {
            connect().then(()=> {
                sendMessage(evt);
            });
        }else {
            sendMessage(evt);
        }

        return false;
    });

    document.getElementById('username-send').addEventListener('click', (evt)=> {
        evt.preventDefault();
        let username = document.getElementById('username').value;

        if(!username) return false;

        evt.target.disabled = true;
        if(!ws) {
            connect().then(()=> {
                setUserName(username);
                evt.target.disabled = false;
            });
        }else {
            setUserName(username);
            evt.target.disabled = false;
        }
        return false;
    });
});
