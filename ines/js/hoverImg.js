$(document).ready(function(){
    $("button").hover(function(){
        var backImage = $(this).attr("url-img");
      $(this).css({
            "background": 'url(' + backImage + ")",
            "-webkit-background-size" : "cover",
            "-moz-background-size" : "cover",
            "-o-background-size" : "cover",
            "background-size" : "cover",
        });
      }, function(){
        if ($(this).hasClass("active") == false) {
          $(this).css("background", "none");
        }
    });
});