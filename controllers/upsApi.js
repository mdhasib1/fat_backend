

const UPS_BASE_URL = 'https://wwwcie.ups.com';


async function validateOAuth(clientId) {

  const query = new URLSearchParams({
    client_id: clientId,
    redirect_uri: 'https://fatstogies.shop/',
  }).toString();


  const resp = await fetch(`${UPS_BASE_URL}/security/v1/oauth/validate-client?${query}`, {
    method: 'GET',
  });



  const data = await resp.text();
  console.log(data)
  return data;
}

async function validateAddress(accessToken, addressData) {
  const query = new URLSearchParams({
    regionalrequestindicator: 'string',
    maximumcandidatelistsize: '1',
  }).toString();

  const version = 'v1';
  const requestoption = '1';
  const resp = await fetch(
    `${UPS_BASE_URL}/api/addressvalidation/${version}/${requestoption}?${query}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(addressData),
    }
  );

  const data = await resp.json();
  return data;
}

async function calculateRate(accessToken, shipmentData) {
  // Similar structure as address validation but with different data
  // ...
}

module.exports = {
  validateOAuth,
  validateAddress,
  calculateRate,
};
