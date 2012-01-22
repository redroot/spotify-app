var App = (function(window,document,undefined){
  
  var sp = getSpotifyApi(1);
  var m = sp.require('sp://import/scripts/api/models');
  var v = sp.require('sp://import/scripts/api/views');
  var ENAPIKey = "LNV3KE3L8O260B3XO",
      results = $("#results"),
      current_title = $("h1 strong");
  
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
        a = $("<a href='#' data-uri='" + track.uri  +"'>" + artist + " - " + track.name),
        p = $("<p/>").html(artist + " - " + track.name);
    
    li.append(a);
    //li.append(p);
    
    results.append(li);
  }

  playTrack = function(uri) {
     m.player.play(uri);
  }
  
  setCurrent = function(){
    var current = m.player.track.data;
    current_title.html(current.name + " - " + current.artists[0].name);
  }
  
  start = function(){
    sp.trackPlayer.addEventListener("playerStateChanged", function (event) {
        if (event.data.curtrack) {
            setCurrent();
            getSuggestions();
        }
    });
    
    console.log("Booting up app");
    
    // zepto wont let be attach live() to a find() method search result!
    $("#results li a").live("click",function(event){
      playTrack($(this).attr("data-uri"));
    });
    
    
    setCurrent();
    getSuggestions();
  }
  
  return {
    start: start
  }
  
})(window,document);

$(document).ready(function(){
  App.start();
});