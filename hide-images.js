// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function toggleEnabled(event) {
  if (event)
    console.log('toggleEnabled', event);
  if (!document.body)
    return;
  if (document.body.hasAttribute('show-alt'))
    document.body.removeAttribute('show-alt');
  else
    document.body.setAttribute('show-alt', '');
}

function processImage(image) {
  var dataSrcValue = image.src;
  var dataSrc = document.createAttribute('data-imagesrc');
  dataSrc.value = dataSrcValue;
  var brokenSrc = '';

  image.src = brokenSrc;
  image.setAttributeNode(dataSrc);

  image.style.setProperty('min-height', image.height + 'px');
  image.style.setProperty('min-width', image.width + 'px');
  var style = window.getComputedStyle(image, null);
  var contrastRatio =
      axs.utils.getContrastRatioForElementWithComputedStyle(style, image);
  if (contrastRatio != null && axs.utils.isLowContrast(contrastRatio, style)) {
    var bgColor = axs.utils.getBgColor(style, image);
    var fgColor = axs.utils.getFgColor(style, image, bgColor);
    var suggestedColors = axs.utils.suggestColors(bgColor, fgColor, contrastRatio, style);
    var suggestedColorsAA = suggestedColors['AA'];
    image.style.setProperty('color', suggestedColorsAA['fg']);
    image.style.setProperty('background-color', suggestedColorsAA['bg'], 'important');
  }
  if (!image.hasAttribute('alt')) {
    if (image.hasAttribute('_repaired'))
      return;
    var filename = image.src.split('/').pop();
    image.setAttribute('_repaired', filename);
  }
}

var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (!mutation.addedNodes || mutation.addedNodes.length == 0)
      return;
    for (var i = 0; i < mutation.addedNodes.length; i++) {
      var addedNode = mutation.addedNodes[i];
      if (!(addedNode instanceof addedNode.ownerDocument.defaultView.HTMLImageElement))
        continue;
      console.log('addedNode:', addedNode);
      processImage(addedNode);
    }
  });
});
observer.observe(document, { childList: true, subtree: true });

var images = document.querySelectorAll('img');
for (var i = 0; i < images.length; i++) {
  processImage(images[i]);
}

if (!infobarDismissed)
    var infobarDismissed = false;

function createInfobar() {
  if (infobarDismissed)
      return;

  if (!document.body)
    return;

  if (document.querySelector('.show-alt-infobar'))
    return;

  var showAltInfobar = document.createElement('div');
  showAltInfobar.className = 'show-alt-infobar';

  var showAltInfoControls = document.createElement('div');
  showAltInfoControls.className = 'controls';

  var showAltInfoCloseButton = document.createElement('button');
  showAltInfoCloseButton.className = 'close-button-gray';
  showAltInfoCloseButton.addEventListener('click', function() {
    document.body.removeChild(showAltInfobar);
    infobarDismissed = true;
  });

  showAltInfoControls.appendChild(showAltInfoCloseButton);
  showAltInfobar.appendChild(showAltInfoControls);

  var showAltInfoContent = document.createElement('div');
  showAltInfoContent.className = 'content';
  // TODO(aboxhall): i18n
  var showAltInfoText = document.createElement('span');
  showAltInfoText.textContent = 'Images have been replaced by their alt text.';
  showAltInfoText.setAttribute('role', 'status');
  showAltInfoContent.appendChild(showAltInfoText);

  var undoButton = document.createElement('button');
  undoButton.className = 'link-button';
  undoButton.textContent = 'Undo';
  undoButton.addEventListener('click', toggleEnabled);

  var closeButton = document.createElement('button');

  showAltInfoContent.appendChild(undoButton);
  showAltInfobar.appendChild(showAltInfoContent);

  console.log('adding showAltInfobar', showAltInfobar);
  document.body.insertBefore(showAltInfobar, document.body.firstChild);
}
