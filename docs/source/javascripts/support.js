const defaultIp = 'Find it on https://api.ipify.org';
const defaultCoords = 'Find it on https://jsfiddle.net/qmjet97b/';
const link = document.querySelector('#support-google-form');
const getFormURL = (ip, coords) => `https://docs.google.com/forms/d/13r_7B72v6u6326atqzKZpv0fs_3OUOJFR-6QDipHl3Y/viewform?entry.1560244398&entry.1894094686&entry.1809496416&entry.2029760924&entry.1442423869&entry.1714224469&entry.1070945708=${encodeURIComponent(ip)}&entry.2019626860=${encodeURIComponent(coords)}`;
link.setAttribute('href', getFormURL(defaultIp, defaultCoords));
link.addEventListener('click', clickEvent => {
  clickEvent.preventDefault();
  try {
    navigator.geolocation.getCurrentPosition(
      ({coords}) => // success
        window.location.href = getFormURL(
          window.userip ? `${window.userip} (detected)` : defaultIp,
          `${coords.latitude},${coords.longitude}  (detected)`
        ),
      () => window.location.href = clickEvent.target.href // error
    );
  } catch (geoNotAvailable) {
    window.location.href = clickEvent.target.href;
  }
});
