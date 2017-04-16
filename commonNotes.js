function loadjs(filename){    
 var script=document.createElement('script')
 script.src=filename	
 document.getElementsByTagName('head')[0].appendChild(script);
}
function Note(resource,desc,link,e1,e2,e3,e4,e5){
 this.resource=resource; // determine the goal/resource
 this.desc=desc;
 if(!link){ // so that can set reminders. Won't screw up extra since different array
	 // added window.location to fix htmlpreview issue
	link=window.location+"?alert="+encodeURIComponent(desc);
 }
 this.link=link;  // not link for extra
 this.e1=e1; 	
 this.e2=e2; 
 this.e3=e3; 
 this.e4=e4; 
 this.e5=e5; 
}
function NotesProcessor(initFn, processAndStopFn, postFn){
  this.initFn=initFn;
  this.processAndStopFn=processAndStopFn;
  this.postFn=postFn;
}
var processors=[];
//////////////////////////// template /////////////////////////////////////
processors.push(
  new NotesProcessor(
function(search){
	this.out="";
	this.currTemplate=""; 
}
, function(note){
 if(note.resource.substring(0,9)==("template-")){
      if(this.currTemplate != note.resource){
        this.currTemplate=note.resource;
        this.out+="<b><u>"+this.currTemplate+"</b></u> <a href='' onclick=openAll('"+this.currTemplate+"')>open all</a><br/>";
      }
      this.out+="<a rel='noreferrer' target='_blank' style='text-decoration:none;' href='" + note.link +"'>" + note.desc +"</a><br/>"
      return true;
 }
 return false;
}
, function(){
 document.getElementById('templatesDiv').innerHTML=this.out;
}));
///////////////////////// scheduled ///////////////////////////////
processors.push(
  new NotesProcessor(
function(search){
 // day is 0-6, convert 0 to 7 since sunday usually 7. Convert to string for indexOf
 today=new Date();
 this.dayOfWeek=""+today.getDay();
 if(this.dayOfWeek == "0"){ this.dayOfWeek = "7"}
 // day of month is 1-31, text since split by ,
 this.dateOfMonth=""+today.getDate();
 // month date of year eg 0318. Jan is 0
 this.monthDateOfYear= (today.getMonth()+1 < 10? "0"+ (today.getMonth()+1) : today.getMonth()+1)+""+(today.getDate() <10 ? "0"+today.getDate() : today.getDate());

 this.arrToday=[];
}
, function(note){
 if(note.resource.substring(0,10)=="scheduled-"){
	 // ignore daily or exists
    if(note.resource.substring(0,15)==("scheduled-daily") || this.arrToday.indexOf(note.resource) != -1){      
      return true;
    }else if(note.resource.substring(0,11)=="scheduled-w"){ // day of week 1-7
       var endSpace=note.resource.indexOf(" ",11);              
       var extracted=(endSpace == -1) ? note.resource.substring(11) : note.resource.substring(11, endSpace);              
       if(extracted.split(",").indexOf(this.dayOfWeek) != -1){       
         this.arrToday.push(note.resource);	
       }       
    }else if(note.resource.substring(0,11)=="scheduled-m"){ // dd 1-31
       var endSpace=note.resource.indexOf(" ",11);              
       var extracted=(endSpace == -1) ? note.resource.substring(11) : note.resource.substring(11, endSpace);              
       if(extracted.split(",").indexOf(this.dateOfMonth) != -1){       
          this.arrToday.push(note.resource);	
       }       
    }else if(note.resource.substring(0,11)=="scheduled-y"){ // MMdd 0101 to 1231
       var endSpace=note.resource.indexOf(" ",11);              
       var extracted=(endSpace == -1) ? note.resource.substring(11) : note.resource.substring(11, endSpace);              
       if(extracted.split(",").indexOf(this.monthDateOfYear) != -1){       
          this.arrToday.push(note.resource);	
       }       
    }
    return true;
 }
 return false;
}
, function(){ 
 if(this.arrToday.length==0){
    document.getElementById('scheduledTodayDiv').innerHTML="Nothing else scheduled today";
 }else{  
    var outScheduled="";
    for(i in this.arrToday){      
      var n=this.arrToday[i];
      outScheduled+="<input type='button' style='background:yellow' value='"+n+"' onclick=\"openAll('"+n+"')\">"  
      outScheduled+="<input type='button' value='share(change title)' onclick=\"window.open('?alert="+n+"')\"><br/>"  
    }
    document.getElementById('scheduledTodayDiv').innerHTML=outScheduled;
  }
}));
/////////////////////////////// SEARCH NOTES VIEW //////////////////////
function queryBoxCallback(){
 var search = document.getElementById('searchNotes').value.trim();
 var linkOpen=false;
 if(search.length == 0){
  document.getElementById('notesResult').innerHTML = "";
  document.getElementById('notesSearchDiv').innerHTML="";
  generateNotesView(notes);
 }else{
  linkOpen=generateNotesSearchView(notes, search); 	 
  // to del since not really useful
  //saveRecent(search);
}
//loadRecentToDiv();

return linkOpen;
}
function generateNotesView(notes){
 var notesModel = [];
 for(var i=0; i<notes.length; i++){
  var note = notes[i];
  if(notesModel[note.resource] == null){
   notesModel[note.resource] = [];
  }
  notesModel[note.resource].push(note);
 }
 var output = "";
 for(var key in notesModel){
  var nArr = notesModel[key];
  var nItem= nArr[Math.floor(Math.random()*nArr.length)];
  var keyStr = "<a id='noteHdr"+key+"' href='javascript:processNote(\""+key+"\");void(0)'>" + key + "(" + nArr.length + ")</a>";
  output += "<b>" + keyStr + "</b> :: "+generateNoteView(nItem)+"<br/>";
  output += "<div style='display:none' id='notes"+key+"'>";
  for(var nIndex in nArr){
   nItem = nArr[nIndex];
   output += "<b style='color:red'>></b>&nbsp;" + generateNoteView(nItem) + "<br/>";
  }
  output += "</div>";
 }
 $('notes').innerHTML = output;
}
function generateNotesSearchView(notes, search){ 
	var out = "";
	var outSearch="";
	var onlyLink;
	var prevNoteResource;
	var linkOpen=false;
	search = search.toLowerCase();
	count=0;	
		
	for(i in notes){
	 var note=notes[i];
	 // no link if empty (only 1 line);
	 // can remove since set as desc if no link?
	 //if(!note.link){ note.link=".";    }else 
	 if(note.link.indexOf("%s") != -1){
		if(prevNoteResource!=note.resource){
			outSearch+="[<a href=\"javascript:openSearches('"+search+"','"+note.resource+"');void(0)\">"+ note.resource+"</a>]<br/>";
			prevNoteResource=note.resource;
		}
		outSearch+=" <li><a href='"+ note.link.replace(/%s/g,search) +"' rel='noreferrer' target='_blank'>"+note.desc +"</a><br/> ";
		
	 }
	 
	 if(note.link.toLowerCase().indexOf(search) >= 0 || 
	  note.desc.toLowerCase().indexOf(search) >= 0 ||
	  note.resource.toLowerCase().indexOf(search) >= 0){ 
	   out+= "<li style='margin-left: -1.2em;'>" + generateNoteView(note,search);
	   // in case only 1 result
	   onlyLink=note.link;
	   count++;
	 }
	}
	if(out==""){  
		// can probably don't loop earlier. Just put since complicated coding now
		if(search.substring(0,4)=="http" || search.substring(0,7)=="mailto:" || search.substring(0,5)=="file:"){
			window.open(search);
			out="opening link";
			linkOpen=true;
		}else{
			out="<b>No result found!</b><hr/>"
		}
	}else{
	 out = "<b>Found "+count + " out of " + notes.length+"</b><ol>" + out + "</ol>";
	 // auto open since only 1 result and not search
	 if(count == 1){
	   if(onlyLink.indexOf("%s") == -1){
	     window.open(onlyLink);
	     linkOpen=true;
	   }
	 }
	}
	document.getElementById('notes').innerHTML = "";
	if(outSearch !=""){ outSearch ="<b>Search '"+search+"' in</b><br/>"+outSearch;}
	document.getElementById('notesSearchDiv').innerHTML=outSearch;
	document.getElementById('notesResult').innerHTML = out;
	
	return linkOpen;
} // end generateNoteSearch

function generateNotesView(notes){
 var notesModel = [];
 for(var i=0; i<notes.length; i++){
  var note = notes[i];
  if(notesModel[note.resource] == null){
   notesModel[note.resource] = [];
  }
  notesModel[note.resource].push(note);
 }
 
 var output = "";
 for(var key in notesModel){
  var nArr = notesModel[key];
  var nItem= nArr[Math.floor(Math.random()*nArr.length)];
  var keyStr = "<a id='noteHdr"+key+"' href='javascript:processNote(\""+key+"\");void(0)'>" + key + "(" + nArr.length + ")</a>";
  output += "<b>" + keyStr + "</b> :: "+generateNoteView(nItem)+"<br/>";
  output += "<div style='display:none' id='notes"+key+"'>";
  for(var nIndex in nArr){
   nItem = nArr[nIndex];
   output += "<b style='color:red'>></b>&nbsp;" + generateNoteView(nItem) + "<br/>";
  }
  output += "</div>";
 }
 document.getElementById('notes').innerHTML = output;
}
function generateNoteView(nItem,search){
 //return generateNoteViewWin8Tile(nItem);
 return generateNoteViewGoogResult(nItem,search);
}
function niceLinkDesc(link, maxLen){
 if(!link){ return ""; }
 // remove prefix
 if(link.indexOf("http://www.") == 0){
  link = link.substring(11);
 }else if(link.indexOf("http://") == 0){
  link = link.substring(7);
 }else if(link.indexOf("https://") == 0){
  link = link.substring(8);
 }else if(link.indexOf("file:/") == 0){
  // assume last char is / and remove
  link = link.substring(6,link.length-1);
  var lastSlash = link.lastIndexOf("/");  
  var firstWord = link.substring(0,lastSlash).replace(/%20/g," ") ;
  if(firstWord.length >= maxLen){
	  firstWord = firstWord.substring(0,maxLen);
  }
  // replace %20 with space for display
  return firstWord + " > "+ link.substring(lastSlash+1).replace(/%20/g," ");
 }
 
 var lastSlash = link.lastIndexOf("/");
 var firstSlash = link.indexOf("/");
 if(lastSlash+1 == link.length){
  link = link.substring(0, link.length-1);  
  lastSlash = link.lastIndexOf("/");
 }
 
 // ignore middle if got something after lastSlash and something in between
 if(lastSlash+1 != link.length && firstSlash != lastSlash){  
  //link = link.substring(0,firstSlash) + "/.." + link.substring(lastSlash);
  link = link.substring(0,firstSlash) + " > " + link.substring(lastSlash+1);
 }
 
 if(maxLen){
  return link.substring(0,maxLen);
 }
 
 return link;
}
function generateNoteViewGoogResult(nItem,search){
 // based on google search result
 var desc=nItem.desc.replace(new RegExp('()(' + search + ')()','ig'), '$1<b>$2</b>$3');       
 return "<a rel='noreferrer' target='_blank' style='text-decoration:none;' href='" + nItem.link +"'><u>" + desc + "</u>"
  + " <cite style='color:rgb(0, 128, 42)'>" +niceLinkDesc(nItem.link,80) + " ("+nItem.resource+")</cite></a>" 
}
function openSearches(search,resource){
	for(i in notes){
		var note=notes[i];
		if(note.resource==resource && note.link.indexOf("%s") != -1){
			window.open(note.link.replace(/%s/g,search));
		}
	}
}


function openDaily(){
 for(i in notes){
    var note=notes[i];    
    if(note.resource.substring(0,15)=="scheduled-daily"){      
      window.open(note.link);
    }
  }
}
function openAll(resource){
  for(i in notes){
    var note=notes[i];    
    if(note.resource==resource){      
      window.open(note.link);
    }
  }
}



function a(resource, desc, link){
notes.push(new Note(resource,desc,link));
}
// assume 6 extra first (including link which no need be link for extra)
function aExtra(resource, desc, link, e1, e2, e3, e4, e5){
notesExtra.push(new Note(resource,desc, link, e1, e2, e3, e4, e5));
}

var notes=[];
var notesExtra=[];

// must implement runExtra()
loadjs('all.js');
// dirty way since can be from same folder (above), outside folder (vegmap)
loadjs('../all.js'); 
