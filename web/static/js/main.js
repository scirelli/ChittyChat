window.addEventListener('load', ()=> {
    var output = document.getElementById('output'),
        input = document.getElementById('input'),
        ws,
        username = 'Unknown';

    function print(message) {
        var d = document.createElement('div'),
            u = document.createElement('span'),
            m = document.createElement('span');

        d.classList.add('message');
        u.classList.add('user-name');
        m.classList.add('message-text');

        u.textContent = message.username;
        m.textContent = message.text;

        d.appendChild(u);
        d.appendChild(m);
        output.appendChild(d);
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

    function sendMessage() {
        print({username: username, text: input.value});
        ws.send(JSON.stringify({
            content: {
                text: input.value
            }
        }));
        input.value = '';
    }

    function setUserName() {
        username = document.getElementById('username').value;
        ws.send(JSON.stringify({
            create: {
                username: username
            }
        }));
    }

    document.getElementById('open').addEventListener('click', function(evt) {
        evt.peventDefault();

        if(ws) return false;
        connect().then(()=>print({username: 'Server', text: 'Connected'}));

        return false;
    });

    document.getElementById('send').addEventListener('click', (evt)=> {
        evt.preventDefault();
        if(!ws) {
            connect().then(()=> {
                sendMessage();
            });
        }else {
            sendMessage();
        }

        return false;
    });

    document.getElementById('close').addEventListener('click', (evt)=> {
        evt.preventDefault();
        if(!ws) return false;
        ws.close();
        return false;
    });

    document.getElementById('username-send').addEventListener('click', (evt)=> {
        evt.preventDefault();
        if(!ws) {
            connect().then(()=> {
                setUserName();
            });
        }else {
            setUserName();
        }
        return false;
    });
});
