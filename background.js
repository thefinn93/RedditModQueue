UserAgent = "Finn's Awesome Chrome Extension thing (thefinn93@thefinn93.com)";

xhr = {"pending":[]};
ToBeDisplayed = [];
checkerinterval = null;

function check() {
    xhr['redditModQueue'] = new XMLHttpRequest;
    xhr['redditModQueue'].onload = redditModQueue;
    //xhr['redditModQueue'].setRequestHeader("User-Agent", UserAgent);
    xhr['redditModQueue'].open("GET","https://pay.reddit.com/r/mod/about/modqueue.json",true);
    xhr['redditModQueue'].send(null)
}


function redditModQueue() {
    result = JSON.parse(xhr['redditModQueue'].responseText);
    alreadySeenJSON = localStorage.getItem("RedditModQueue");
    alreadySeen = []
    if(alreadySeenJSON != null) {
        alreadySeen = JSON.parse(alreadySeenJSON)
    }

    for(i = 0; i < result.data.children.length; i++) {
        if(alreadySeen.indexOf(result.data.children[i].data.id) == -1) {
            if(localStorage['firstRun'] == "0") {
                var notification = webkitNotifications.createHTMLNotification("notification.html");
                notification.show();
                data = result.data.children[i];
                data['uh'] = result.data.modhash;
                ToBeDisplayed.push(data);
            }
            alreadySeen.push(result.data.children[i].data.id);
        }
    }
    if(localStorage['firstRun'] != "0") {
        localStorage['firstRun'] = "0";
    }
    localStorage["RedditModQueue"] = JSON.stringify(alreadySeen);
}

function getMessage() {
    data = ToBeDisplayed.pop();
    return data;
    console.log(data);
}

function mark(as, id, uh, notification) {
    if(as == 0) {
        req = {"xhr":new XMLHttpRequest,"info":{"id":id,"uh":uh}, "window": notification}
        params = "id=" + id + "&spam=true&uh=" + uh + "&renderstyle=html";
        req['xhr'].open("POST", "https://pay.reddit.com/api/remove", true);
        req['xhr'].setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req['xhr'].onload = markCB;
        xhr['pending'].push(req);
        req['xhr'].send(params);
    } else if(as == 1) {
        req = {"xhr":new XMLHttpRequest,"info":{"id":id,"uh":uh}, "window": notification}
        params = "id=" + id + "&spam=false&uh=" + uh + "&renderstyle=html";
        req['xhr'].open("POST", "https://pay.reddit.com/api/remove", true);
        req['xhr'].setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req['xhr'].onload = markCB;
        xhr['pending'].push(req);
        req['xhr'].send(params);
    } else {
        req = {"xhr":new XMLHttpRequest,"info":{"id":id,"uh":uh}}
        params = "id=" + id + "&uh=" + uh + "&renderstyle=html";
        req['xhr'].open("POST", "https://pay.reddit.com/api/approve", true);
        req['xhr'].setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req['xhr'].onload = markCB;
        xhr['pending'].push(req);
        req['xhr'].send(params);
    }
    notification.close();
}

function markCB() {
    console.log("done");
}

function setCheckerInterval() {
    timeout = 60;
    options = {"subreddits":{}, "timeout":"60"};
    if(localStorage["options"] != undefined) {
        options = JSON.parse(localStorage["options"]);
    }
    timeout = options['timeout']
    
    localStorage["options"] = JSON.stringify(options);
    checkerinterval = setInterval(check, timeout*1000);
}

check()
setCheckerInterval()
