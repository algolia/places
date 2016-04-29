/* global clippyPath */

import Clipboard from 'clipboard';

export default function activateClipboard(codeSamples) {
  codeSamples.forEach(codeSample => {
    const copyToClipboard = document.createElement('button');
    copyToClipboard.innerHTML = `<img src="${clippyPath}" width="13" />`;
    copyToClipboard.classList.add('clipboard');
    codeSample.appendChild(copyToClipboard);
    const clipboard = new Clipboard(copyToClipboard, {
      text: () => codeSample.textContent
    });

    copyToClipboard.classList.add('hint--top');
    copyToClipboard.addEventListener('mouseleave', () => copyToClipboard.removeAttribute('data-hint'));
    clipboard.on('success', () => copyToClipboard.setAttribute('data-hint', 'Copied!'));
    // safari: https://clipboardjs.com/#browser-support
    clipboard.on('error', () => copyToClipboard.setAttribute('data-hint', 'Hit ⌘+C to copy'));
  });
}
