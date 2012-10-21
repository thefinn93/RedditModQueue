baseDomain = "http://www.reddit.com/";

id = null;
uh = null;
linkinfo = null;

function init() {
    data = chrome.extension.getBackgroundPage().getMessage();
    if(data != undefined) {
        id = data.data.name;
        uh = data.uh;
        if(data.kind == "t3") { // If it's a link/selfpost
        
            commentelements = document.getElementsByClassName("comment");
            for(i = 0; i < commentelements.length; i++) {
                commentelements[i].style.display = "none";
            }
            
            document.getElementById("post-title").innerHTML = "<a href=\"" + baseDomain + data.data.permalink + "\">" + data.data.title + "</a> <small>(<a href=\"" + baseDomain + "/domain/" + data.data.domain + "\">" + data.data.domain + "</a>)</small>";
            
            /*
             * background-position: -0px -370px;
             * background-repeat: no-repeat;
             */
            if(data.data.thumbnail != "default" && data.data.thumbnail != "self") {
                document.getElementById("img").setAttribute("src", data.data.thumbnail);
            }
            
            document.getElementById("post-subreddit").innerHTML = data.data.subreddit;
            document.getElementById("post-subreddit").setAttribute("href", baseDomain + "/r/" + data.data.subreddit);
            
            document.getElementById("post-user").innerHTML = data.data.author;
            document.getElementById("post-user").setAttribute("href", baseDomain + "/user/" + data.data.author);
            
            document.getElementById("post-time").innerHTML = timesince(data.data.created);
            
            document.getElementById("comments").innerHTML = data.data.num_comments + " comment";
            if(data.data.num_comments != 1) {document.getElementById("comments").innerHTML += "s";} // Proper grammer FTW
            document.getElementById("comments").setAttribute("href", baseDomain + data.data.permalink);
            
            document.getElementById("link").setAttribute("href", data.data.url);
        } else {

            postelements = document.getElementsByClassName("post");
            for(i = 0; i < postelements.length; i++) {
                postelements[i].style.display = "none";
            }
            
            
            document.getElementById("comment-link-title").innerHTML = data.data.link_title;
            
            
            document.getElementById("comment-subreddit").innerHTML = "/r/" + data.data.subreddit;
            document.getElementById("comment-subreddit").setAttribute("href", baseDomain + "/r/" + data.data.subreddit);
            
            document.getElementById("comment-author").innerHTML = data.data.author;
            document.getElementById("comment-author").setAttribute("href", baseDomain + "/user/" + data.data.author);
            
            document.getElementById("comment-score").innerHTML = (data.data.ups-data.data.downs) + " points";
            
            document.getElementById("comment-time").innerHTML = timesince(data.data.created);
            
            document.getElementById("comment").innerHTML = data.data.body_html.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
            
            fullcomments = baseDomain + "r/" + data.data.subreddit + "/comments/" + data.data.link_id.replace("t3_","")
            permalink = fullcomments + "/title/" + data.data.id;
            
            document.getElementById("permalink").setAttribute("href", permalink);
            document.getElementById("fullcomments").setAttribute("href", fullcomments);
            document.getElementById("context").setAttribute("href",permalink + "?context=3");
            
            document.getElementById("comment-link-title").setAttribute("href", fullcomments);
            
            linkinfo = new XMLHttpRequest;
            linkinfo.onload = showLinkInfo;
            linkinfo.open("GET", "https://pay.reddit.com/r/" + data.data.subreddit + "/comments/" + data.data.link_id.replace("t3_","") + "/title/" + data.data.id + ".json", true);
            linkinfo.send(null)
        }
        
        if(data.data.num_reports > 0) {
            document.getElementById("reports").innerHTML = data.data.num_reports + " reports";
        } else {
            document.getElementById("reports").style.display = "none";
        }

        document.getElementById("spam").onclick = spam;
        document.getElementById("remove").onclick = remove;
        document.getElementById("approve").onclick = approve;
        elements = document.getElementsByTagName("a");
        for(i = 0; i < elements.length; i++) {
            elements[i].onclick = function() {
                window.open(this.getAttribute("href"));
                window.close();
            }
        }
    } else {
        window.close();
    }
}

function showLinkInfo() {
    info = JSON.parse(linkinfo.responseText);
    document.getElementById("comment-link-title").setAttribute("href", info[0].data.children[0].data.url);
    
    document.getElementById("comment-link-user").setAttribute("href", baseDomain + "user/" +  info[0].data.children[0].data.author);
    document.getElementById("comment-link-user").innerHTML =  info[0].data.children[0].data.author;
}

function timesince(then) {
    now = Math.round((new Date()).getTime() / 1000);
    time = now-then;
    
    
    number = Math.round(time);
    unit = "second";
    
    if(time > 60)	{
        number = Math.round(time/60);
        unit = "minute";
    }
    if(time > 360) {
        number = Math.round(time/3600);
        unit = "hour";
    }
    if(time > 86400) {
        number = Math.round(time/86400);
        unit = "day";
    }
    if(time > 604800) { 
        number = Math.round(time/604800);
        unit = "week";
    }
    if(time > 2.62974e6) {
        number = Math.round(time/2.62974e6);
        unit = "month";
    }
    if(time > 3.15569e7) {
        number = Math.round(time/3.15569e7);
        unit = "year";
    }
    if(number != 1) {
        unit += "s";
    }
    
    return number + " " + unit + " ago";
}

function spam() {
    chrome.extension.getBackgroundPage().mark(0, id, uh, window);
}

function remove() {
    chrome.extension.getBackgroundPage().mark(1, id, uh, window);
}

function approve() {
    chrome.extension.getBackgroundPage().mark(2, id, uh, window);
}

init()
