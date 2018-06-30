
/* Time */
var deviceTime = document.querySelector('.status-bar .time');
var messageTime = document.querySelectorAll('.message .time');
deviceTime.innerHTML = moment().format('h:mm');

setInterval(function() {
	deviceTime.innerHTML = moment().format('h:mm');
}, 1000);

for (var i = 0; i < messageTime.length; i++) {
	messageTime[i].innerHTML = moment().format('h:mm A');
}

/* Message */

var form = document.querySelector('.conversation-compose');
var conversation = document.querySelector('.conversation-container');
var input = document.getElementById("input-msg");
var youStatus = document.getElementById("youStatus");
	
//form.addEventListener('submit', newMessage);

function newMessage() {
	// remove var e
	//var input = e.target.input;
	if (input.value) {
		var message = buildMessage(input.value,'sent');
		conversation.appendChild(message);
		animateMessage(message);
	}

	input.value = '';
	conversation.scrollTop = conversation.scrollHeight;

	return false;
	//e.preventDefault();
}

/*
 * type - sent or received
 */
function buildMessage(text,type) {
	var element = document.createElement('div');
	element.classList.add('message', type);

	var finalText = text +
		'<span class="metadata">' +
			'<span class="time">' + moment().format('h:mm A') + '</span>';

	if(type != "received"){
		finalText = finalText +	
			'<span class="tick tick-animation">' +
				'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" id="msg-dblcheck" x="2047" y="2061"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#92a58c"/></svg>' +
				'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" id="msg-dblcheck-ack" x="2063" y="2076"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#4fc3f7"/></svg>' +
			'</span>';
	}
	
	finalText = finalText+ '</span>';

	element.innerHTML =finalText;
	return element;
}

/**
 * @return expected delay
 */
function animateMessage(message) {
	setTimeout(function() {
		var tick = message.querySelector('.tick');
		tick.classList.remove('tick-animation');
	}, 500);
}

function addCharacter(message,index){
	if(index< message.length){
		input.value=input.value+(message.charAt(index));
		input.scrollLeft = input.scrollWidth;
	}
	// ignore == so got a slight delay
	if(index > message.length){
		newMessage();
		clearInterval(timerAnimateNewId);
	}
}

function receivingMessage(message){
	delay=message.length*100+1000;
	
	setTimeout(function(){
		youStatus.innerText="typing..."
		setTimeout(function(){
			var msg=buildMessage(message,'received');
			conversation.appendChild(msg);
			youStatus.innerText="online";
			conversation.scrollTop = conversation.scrollHeight;
		}, message.length*100)
	}, 1000);
	return delay;
}

/**
 * @return expected delay. added extra 50 for buffer as clearing interval when 2 Me at the same time.
 */
var timerAnimateNewId;
function animateNewMessage(message){
	var index=0;
	timerAnimateNewId=setInterval(function(){
		addCharacter(message,index++);
	}, 50);
	return 50*message.length+50;
}

var timerStoryId;
function nextStoryLine(storyLines,index){
	var delay = 0;
	if(index >= storyLines.length){
		delay = -1;
	}
	if(storyLines[index]){
		var meStart=meStr.value+": ";
		var youStart=youStr.value+": ";
			
		if(storyLines[index].startsWith(meStart)){
			delay=animateNewMessage(storyLines[index].substring(meStart.length));
		}else if(storyLines[index].startsWith(youStart)){
			delay=receivingMessage(storyLines[index].substring(youStart.length));
		}
	}
	// valid delay to continue
	//alert(storyLines.length+"/"+index+"/"+delay);
	if(delay>=0){
		setTimeout(function(){
			nextStoryLine(storyLines, ++index);
		}, delay);
	}
}

function parseStory(){
	var storyLines=document.getElementById("story").value.split("\n");
	youStatus.scrollIntoView();
	setTimeout(function(){
		nextStoryLine(storyLines, 0);
	}, 1000);
	document.getElementById("outerJSBox").style.display="none";
}
