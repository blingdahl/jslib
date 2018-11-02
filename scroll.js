/**
 * @fileoverview Scroll listener.
 */

var scroll = {};

scroll.viewportOffset = 300;

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
 * @return {boolean} Whether the item is in the viewport.
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
 * Gets the eligible items.
 *
 * @param {object!} item The item.
 * @return {boolean} Whether it is eligible.
 **/
scroll.ScrollListener.prototype.isEligible = function(item) {
  return this.eltFn(item).is(':visible');
};

/**
 * Gets the eligible items.
 *
 * @return {Array.<object!>!} The eligible items.
 **/
scroll.ScrollListener.prototype.getEligibleItems = function() {
  var eligibleItems = [];
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    if (this.isEligible(item)) {
      eligibleItems.push(item);
    }
  }
  return eligibleItems;
};

/**
 * Scrolls to a relative offset.
 *
 * @param {number} offset The offset from the current item.
 * @return {scroll.ScrollListener!} this.
 **/
scroll.ScrollListener.prototype.scrollToRelativeItem = function(offset) {
  var eligibleItems = this.getEligibleItems();
  if (!eligibleItems) {
    return this;
  }
  var item;
  for (var i = 0; i < eligibleItems.length; i++) {
    if (eligibleItems[i] === this.itemInViewport) {
      item = eligibleItems[i + offset];
    }
  }
  if (!item) {
    if (offset == 1) {
      item = eligibleItems[0];
    } else if (offset == -1) {
      item = eligibleItems[eligibleItems.length - 1];
    }
  }
  this.eltFn(item).get(0).scrollIntoView();
  return this;
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
  var _this = this;
  _this.parentElt.scroll(function(e) {
    if (_this.itemChangeCallback) {
      var curr = _this.whatIsInViewport();
      if (curr !== _this.itemInViewport) {
        _this.itemInViewport = curr;
        _this.itemChangeCallback(curr);
      }
    }
    if (_this.scrollCallback) {
      _this.scrollCallback(_this.parentElt.scrollTop());
    }
  });
  return this;
};
