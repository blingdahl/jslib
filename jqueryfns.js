/**
 * @fileoverview Jquery functions.
 */

var float = {};

float.TOP_LEFT = 'topleft';
float.TOP_RIGHT = 'topright';
float.BOTTOM_LEFT = 'bottomleft';
float.BOTTOM_RIGHT = 'bottomright';

float.LEFT = '150px';
float.RIGHT = '50px';
float.TOP = '60px';
float.BOTTOM = '50px';

jQuery.fn.extend({
  findElementContaining: function(input) {
    var strings;
    if (typeof input == 'string') {
      strings = [input];
    } else {
      strings = input;
    }
    var containsStatements = Array.from(strings, s => ':contains("' + s + '")');
    return this.findAny(containsStatements);
  },
  findAny: function(querySelectors) {
    return this.find(querySelectors.join(','));
  },
  float: function(position) {
    this.addClass('floatingName')
      .css({'position': 'fixed',
            'background-color': 'white',
            'z-index': '10000'});
    switch (position) {
      case float.TOP_LEFT:
        this.css({'top': float.TOP,
                  'left': float.LEFT});
        break;
      case float.TOP_RIGHT:
        this.css({'top': float.TOP,
                  'right': float.RIGHT});
        break;
      case float.BOTTOM_LEFT:
        this.css({'bottom': float.BOTTOM,
                  'left': float.LEFT});
        break;
      case float.BOTTOM_RIGHT:
        this.css({'bottom': float.BOTTOM,
                  'right': float.RIGHT});
        break;
    }
    return this;
  }
});
