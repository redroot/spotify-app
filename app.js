var Util = {};

Util.msToTime = function(ms){
  var res = {}, 
      x = 0;
      
  x = ms / 1000
  res.seconds = parseInt(x % 60);
  x /= 60
  res.minutes = parseInt(x % 60);
  x /= 60
  res.hours = parseInt(x % 24);
  x /= 24
  res.days = parseInt(x);
  
  if(res.hours < 10) res.hours = "0" + res.hours;
  if(res.minutes < 10) res.minutes = "0" + res.minutes;
  if(res.seconds < 10) res.seconds = "0" + res.seconds;
  
  return res;
}

// App

var App = (function(window,document,undefined){
  
  var sp = getSpotifyApi(1);
  var m = sp.require('sp://import/scripts/api/models');
  var v = sp.require('sp://import/scripts/api/views');
  var ENAPIKey = "LNV3KE3L8O260B3XO",
      LASTFMKEY = "0c91469513a51b26e7b73406944ff416"
      results = $("#results"),
      info = $("#info"),
      current_title = $("h1 strong");
      
  // SUGGESTIONS
  
  getSuggestions = function(){
    var current_track = m.player.track;
    
    console.log("Getting suggestions for " + current_track)
    
    results.find("li").remove();
    
    if(current_track === null) return false;
    
    fetchSuggestions(current_track.data.artists[0].name,15);
  }
  
  fetchSuggestions = function(artist,size){

    var url = "http://developer.echonest.com/api/v4/playlist/basic?api_key="+ENAPIKey+"&type=artist-radio&artist=" + artist +"&results=" + size;
    
    $.getJSON(url, function(data){
      for(var i = 0, length = data.response.songs.length; i < length; i++){
        getSpotifyTrack(data.response.songs[i]);
      }
    });
    
  }
  
  getSpotifyTrack = function(track){
    
    var query = track.artist_name + " " + track.title;
    var search = new m.Search(query,function(results) {

      for (var i= 0, length = results.results.length; i < length;i++) {
        
        var sptrack = results.results[i].data;
        
        // tidy up
        var name = sptrack.name.replace("&apos;","'");
       
        if((track.artist_name == sptrack.artists[0].name) && (track.title == name) && sptrack.availableForPlayback){
          
          renderTrack(sptrack);
          
          
          // done here so break it off
          break;
        }
      }
    });
  }
  
  renderTrack = function(track){
    var artist = track.artists[0].name;
    
    var li = $("<li />").css("background-image","url("+track.album.cover+")"),
        a = $("<a href='#' data-uri='" + track.uri  +"'><span>" + track.name + "</span>" + artist + "</a>");
    
    li.append(a);
    
    results.append(li);
  }

  playTrack = function(uri) {
     m.player.play(uri);
  }
  
  setCurrent = function(){
    var current = m.player.track.data;
    current_title.html(current.name + " - " + current.artists[0].name);
  }
  
  // INFO bits
  
  getInfo = function(){
    var base_url = "http://ws.audioscrobbler.com/2.0/?method=track.getinfo&&format=json&api_key=" + LASTFMKEY,
        track = m.player.track.data;
        
    var url = base_url + "&artist=" + track.artists[0].name.toLowerCase()  + "&track=" + track.name;
    
    console.log("Getting info from " + url);
    
    $.getJSON(url, function(data){
      renderInfo(data.track);
    });
  }
  
  renderInfo = function(track){
    console.log(track);
    
    // listeners, playcount, duration, tags(join)
    var time = Util.msToTime(parseInt(track.duration)),
        tags = [];
   
    info.find("#duration span").text(time.hours + ":" + time.minutes + ":" + time.seconds);
    info.find("#listeners span").text(track.listeners);
    info.find("#playcount span").text(track.playcount);
    
    if(tracks.toptags.tag){
      track.toptags.tag.forEach(function(el){
        tags.push("<a href='" + el.url + "'>" + el.name + "</a>");
      });
    }
    
    info.find("#tags span").html(tags.join(""));
    
    // wiki if it exist
    info.find("#wiki").remove();
    
    if(track.wiki){
      var div = $("<div></div>").attr("id","wiki");
      div.html(track.wiki.summary);
      info.append(div);
    }
  }
  
  
  // BOOTSTRAP
  
  start = function(){
    sp.trackPlayer.addEventListener("playerStateChanged", function (event) {
        if (event.data.curtrack) {
            setCurrent();
            getSuggestions();
            getInfo();
        }
    });
    
    console.log("Booting up app");
    
    // zepto wont let be attach live() to a find() method search result!
    $("#results li a").live("click",function(event){
      playTrack($(this).attr("data-uri"));
    });
    
    
    setCurrent();
    getSuggestions();
    getInfo();
  }
  
  return {
    start: start
  }
  
})(window,document);

$(document).ready(function(){
  App.start();
});