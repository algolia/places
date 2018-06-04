/* global clippyPath */

import ClipboardJS from 'clipboard';

export default function activateClipboard(codeSamples) {
  codeSamples.forEach(codeSample => {
    const copyToClipboard = document.createElement('button');
    copyToClipboard.innerHTML = `<img src="${clippyPath}" width="13" />`;
    copyToClipboard.classList.add('clipboard');
    codeSample.appendChild(copyToClipboard);
    const clipboard = new ClipboardJS(copyToClipboard, {
      text: () => codeSample.textContent,
    });

    copyToClipboard.addEventListener('mouseleave', () => {
      copyToClipboard.removeAttribute('aria-label');
      copyToClipboard.classList.remove('hint--top');
    });
    clipboard.on('success', () => {
      copyToClipboard.classList.add('hint--top');
      copyToClipboard.setAttribute('aria-label', 'Copied!');
    });
    // safari: https://clipboardjs.com/#browser-support
    clipboard.on('error', () =>
      copyToClipboard.setAttribute('aria-label', 'Hit ⌘+C to copy')
    );
  });
}
