
// Fade Scroll
$(function(){
var documentEl = $(document);
fadeElem = $('.fade-scroll');

documentEl.on('scroll', function(){
  var currScrollPos = documentEl.scrollTop();

fadeElem.each(function () {
  var $this = $(this),
    elemOffsetTop = $this.offset().top;
    if (currScrollPos > elemOffsetTop) $this.css ('opacity', 1 - (currScrollPos-elemOffsetTop)/400);
})

});
});

// Toggles hamburger icon 
$('.menu-handle').on('click', function(){
    $('nav ul').toggleClass('showing');
});
