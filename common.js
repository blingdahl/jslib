/**
 * @fileoverview Common functionality and libraries.
 */

var common = {};

/**
 * Toggles the cursor position between the candidate line and the summary line.
 *
 * @param {string} expectedHash The hash prefix itf it matches.
 * @param {string} testFileName The name of the associated test file.
 * @param {string} pageTypeName The plain English name of the page type.
 **/
common.UrlChecker = function(expectedHash, testFileName, pageTypeName) {
  this.checkUrl = function(href, hash) {
    if (hash.startsWith('#' + expectedHash)) {
      console.log(pageTypeName + ' script active for hash '+ hash);
      return true;
    }
    var filename = href.substring(href.lastIndexOf('/') + 1);
    if (filename.indexOf('#') > 0) {
      filename = filename.substring(0, filename.indexOf('#'));
    }
    if (filename == testFileName) {
      if (hash.startsWith('#norun')) {
        console.log('No-run test case');
        return false;
      }
      console.log(pageTypeName + ' script active in test mode');
      return true;
    }
    console.log(pageTypeName + ' script inactive for ' +
                'hash=' + hash + '/href=' + href + '/filename=' + filename);
    return false;
  };
};

/**
 * Processes the page if it is ready.
 *
 * @param {object} urlChecker The URL checker.
 * @param {function()} makeProcessorFn The function that creates the processor,
 * or returns null if not ready.
 * @param {function()} cleanUpFn The function that cleans up.
 * @private
 **/
common.possiblyProcess_ = function(urlChecker, makeProcessorFn, cleanUpFn) {
  if (!urlChecker.checkUrl(window.location.href, window.location.hash)) {
    if (cleanUpFn) {
      cleanUpFn();
    }
    return;
  }

  var processor = makeProcessorFn();
  if (processor) {
    processor.process();
  } else {
    console.log('Page not ready');
    setTimeout(() => common.possiblyProcess_(urlChecker,
                                             makeProcessorFn,
                                             cleanUpFn),
        1000);
  }
};

/**
 * Toggles the cursor position between the candidate line and the summary line.
 *
 * @param {object} urlChecker The URL checker.
 * @param {function()} makeProcessorFn The function that creates the processor,
 * or returns null if not ready.
 * @param {function()} cleanUpFn The function that cleans up.
 **/
common.possiblyProcess = function(urlChecker, makeProcessorFn, cleanUpFn) {
  $(window).bind('hashchange', () => possiblyProcess_(urlChecker,
                                                     makeProcessorFn,
                                                     cleanUpFn));
  common.possiblyProcess_(urlChecker, makeProcessorFn, cleanUpFn);
};

common.BACKSPACE_KEY = 8;
