// polyfill for navigator.language (IE <= 10)
// not polyfilled by https://cdn.polyfill.io/v2/docs/

// Defined: http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#navigatorlanguage
//   with allowable values at http://www.ietf.org/rfc/bcp/bcp47.txt
// Note that the HTML spec suggests that anonymizing services return "en-US" by default for
//   user privacy (so your app may wish to provide a means of changing the locale)
if (!('language' in navigator)) {
  navigator.language =
    // IE 10 in IE8 mode on Windows 7 uses upper-case in
    // navigator.userLanguage country codes but per
    // http://msdn.microsoft.com/en-us/library/ie/ms533052.aspx (via
    // http://msdn.microsoft.com/en-us/library/ie/ms534713.aspx), they
    // appear to be in lower case, so we bring them into harmony with navigator.language.
    (navigator.userLanguage &&
      navigator.userLanguage.replace(
        /-[a-z]{2}$/,
        String.prototype.toUpperCase
      )) ||
    'en-US'; // Default for anonymizing services: http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#navigatorlanguage
}
