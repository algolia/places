function saveCredentialsForSession({ appId, apiKey }) {
  sessionStorage.setItem('placesAppId', appId);
  sessionStorage.setItem('placesApiKey', apiKey);
}

function getCredentialsFromSession() {
  const appId = sessionStorage.getItem('placesAppId');
  const apiKey = sessionStorage.getItem('placesApiKey');

  if (appId && apiKey) {
    return { appId, apiKey };
  }

  return null;
}

function getCredentialsFromAlgolia() {
  return fetch('https://www.algolia.com/static/current_user', {
    credentials: 'include',
    headers: {},
    referrer: 'https://www.algolia.com/',
    referrerPolicy: 'no-referrer-when-downgrade',
    body: null,
    method: 'GET',
    mode: 'cors',
  })
    .then(x => x.json())
    .then(credentials => {
      const { application_id: appId, search_api_key: apiKey } = credentials;
      if (appId && appId.startsWith('pl') && apiKey) {
        saveCredentialsForSession({ appId, apiKey });
        return { appId, apiKey };
      }

      return null;
    })
    .catch(() => null);
}

function getCredentials() {
  return new Promise((resolve, reject) => {
    const sessionCredentials = getCredentialsFromSession();
    if (!sessionCredentials) {
      getCredentialsFromAlgolia()
        .then(credentials => {
          resolve(credentials || {});
        })
        .catch(reject);
    } else {
      resolve(sessionCredentials || {});
    }
  });
}

function updatePlaceholders({ appId, apiKey }) {
  document.querySelectorAll('.rouge-code > pre > span').forEach(elt => {
    if (elt.textContent.match(/.*YOUR_PLACES_APP_ID.*/)) {
      if (elt.textContent.startsWith(`'`)) {
        // eslint-disable-next-line no-param-reassign
        elt.innerHTML = `'${appId}'`;
      } else {
        // eslint-disable-next-line no-param-reassign
        elt.innerHTML = `"${appId}"`;
      }
    }

    if (elt.textContent.match(/.*YOUR_PLACES_API_KEY.*/)) {
      if (elt.textContent.startsWith(`'`)) {
        // eslint-disable-next-line no-param-reassign
        elt.innerHTML = `'${apiKey}'`;
      } else {
        // eslint-disable-next-line no-param-reassign
        elt.innerHTML = `"${apiKey}"`;
      }
    }
  });
}

function noop() {}

export default function autoPullCredentials() {
  return getCredentials()
    .then(({ appId, apiKey }) => {
      if (appId && apiKey) {
        updatePlaceholders({ appId, apiKey });
      }
    })
    .catch(noop);
}
