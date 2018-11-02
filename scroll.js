/**
 * @fileoverview Scroll listener.
 */

var scroll = {};

scroll.viewportOffset = 250;

/**
 * Gets the offset parent.
 *
 * @param {element!} elt The element.
 * @return {element!} The offset parent.
 **/
scroll.getScrollableParent = function(elt) {
  var curr = elt;
  var i = 0;
  while (curr.length &&
         curr.css('overflow') != 'auto') {
    if (i++ > 10) {
      return elt.offsetParent();
    }
    curr = curr.offsetParent();
  }
  return curr;
};

/**
 * Gets the position within the viewport.
 *
 * @param {element!} elt The element.
 * @return {number} The offset from the top.
 **/
scroll.getPositionInViewport = function(elt) {
  return elt.offset().top - scroll.getScrollableParent(elt).offset().top;
};

/**
 * Gets the position within the viewport.
 *
 * @param {element!} elt The element.
 * @return {boolean} Whether the person is in the viewport.
 **/
scroll.isInViewport = function(elt) {
  return elt.is(':visible') &&
      scroll.getPositionInViewport(elt) <= scroll.viewportOffset;
};

/**
 * Gets the position within the viewport.
 *
 * @param {Array.<object!>!} items The items.
 * @param {function(object!): element!} eltFn Function to get the element.
 * @param {function(object!)} itemChangeCallback Function to call on change.
 * @param {function()} scrollCallback Function to call on scroll.
 * @param {element!} parentElt The element.
 **/
scroll.ScrollListener = function(
    items, eltFn, itemChangeCallback, scrollCallback, parentElt) {
  this.items = items;
  this.eltFn = eltFn;
  this.itemChangeCallback = itemChangeCallback;
  this.itemInViewport = null;
  this.scrollCallback = scrollCallback;
  this.parentElt = parentElt;
};

/**
 * Adds an item.
 *
 * @param {object!} item The item currently in the viewport.
 **/
scroll.ScrollListener.prototype.addItem = function(item) {
  this.items.push(item);
};

/**
 * Gets the position within the viewport.
 *
 * @return {object!} The item currently in the viewport.
 **/
scroll.ScrollListener.prototype.whatIsInViewport = function() {
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[this.items.length - i - 1];
    if (scroll.isInViewport(this.eltFn(item))) {
      return item;
    }
  }
  return null;
};

/**
 * Gets the position within the viewport.
 *
 * @param {number} scrollTop The scroll top.
 * @return {scroll.ScrollListener!} this.
 **/
scroll.ScrollListener.prototype.setScrollTop = function(scrollTop) {
  this.parentElt.scrollTop(scrollTop);
  return this;
};

/**
 * Add a scroll listener to the element.
 *
 * @return {scroll.ScrollListener!} this.
 **/
scroll.ScrollListener.prototype.listen = function() {
  var self = this;
  self.parentElt.scroll(function(e) {
    if (self.itemChangeCallback) {
      var curr = self.whatIsInViewport();
      if (curr !== self.itemInViewport) {
        self.itemInViewport = curr;
        self.itemChangeCallback(curr);
      }
    }
    if (self.scrollCallback) {
      self.scrollCallback(self.parentElt.scrollTop());
    }
  });
  return this;
};
