!function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var n={};t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:r})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(t.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var o in e)t.d(r,o,function(t){return e[t]}.bind(null,o));return r},t.n=function(e){var n=e&&e.__esModule?function(){return e["default"]}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(){function e(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function t(t){for(var r=1;r<arguments.length;r++){var o=null!=arguments[r]?arguments[r]:{};r%2?e(Object(o),!0).forEach(function(e){n(t,e,o[e])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(o)):e(Object(o)).forEach(function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(o,e))})}return t}function n(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e){return u(e)||i(e)||a(e)||o()}function o(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function a(e,t){if(e){if("string"==typeof e)return c(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?c(e,t):void 0}}function i(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}function u(e){if(Array.isArray(e))return c(e)}function c(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}var l=document.querySelector("#landing-demo"),s=places({appId:"plFMJJT5O9PC",apiKey:"8b126ce956636c64b6e74c8b3f3d0e5e",container:l});l.style.opacity=1;var f=function(e){switch(!0){case e<26:return"data-highlight-fast";case e<46:return"data-highlight-medium";case e<66:return"data-highlight-slow";default:return"data-highlight-fast"}},d=document.querySelector("#json-response"),p=document.querySelector("#json-response-text"),g=document.querySelector("#json-response-timing");s.on("change",function(e){var n=(e.suggestion.postcodes||[]).slice(0,3);n.length!==(e.suggestion.postcodes||[]).length?n=[].concat(r(n),["..."]):0===n.length&&(n=undefined);var o=t(t({},e),{},{suggestion:t(t({},e.suggestion),{},{hit:undefined,hitIndex:undefined,query:undefined,rawAnswer:undefined,postcodes:n}),rawAnswer:undefined,suggestionIndex:undefined}),a=JSON.stringify(o,null,2),i={key:/"(.*)"/g,value:/"(.*)":/g,"float":/([-]?\d+\.\d+)/g,highlight:/(<em>(.*)<\/em>)/g,"default":/[:]/g},u=a.replace(i.value,'<span data-highlight-value>"$1"</span>:').replace(i.key,'<span data-highlight-key>"$1"</span>').replace(i["float"],"<span data-highlight-value>$1</span>").replace(i.highlight,"<span data-highlight-match>&lt;em&gt;$1&lt;/em&gt;</span>").replace(i["default"],"<span data-highlight-default>:</span>");p.innerHTML=u,g.innerHTML="Computed in <span ".concat(f(e.rawAnswer.processingTimeMS),">").concat(e.rawAnswer.processingTimeMS,"ms</span>"),d.classList.add("display")}),s.on("clear",function(){p.textContent="",d.classList.remove("display")})}]);