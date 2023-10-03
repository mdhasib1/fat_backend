const { v4: uuidv4 } = require('uuid');

const clientId = 'psKTiPAHjxLZVsiMl5yETl4EMMDZkELRxvodeTSh5UEki0Zo';
const clientSecret = '3nqgwgR3i35cbJfV1mCSzzVylTQBZu02Wjs70I3A2w6nvObB4XGGGl3wGA8PzyfA';


async function authCode() {
  try {
    const formData = {
      grant_type: 'client_credentials',
    };

    const authHeader = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://wwwcie.ups.com/security/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: authHeader,
      },
      body: new URLSearchParams(formData).toString(),
    });

    if (response.status === 200) {
      const tokenData = await response.json();
      return tokenData.access_token;
    } else {
      const errorData = await response.json();
      throw new Error(`Error requesting access token: ${errorData.error}`);
    }
  } catch (error) {
    throw error;
  }
}

async function getUPSAccountAddress(token) {
  try {
    const response = await fetch('https://wwwcie.ups.com/ship/v1/addresses/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      const addressData = await response.json();
      return addressData.address;
    } else {
      const errorData = await response.json();
      throw new Error(`Error retrieving UPS account address: ${errorData.error}`);
    }
  } catch (error) {
    throw error;
  }
}


async function getShippingRate(token,userAddress,selectedServiceCode) {
  const version = 'v1';
  const requestOption = 'Rate';


  const transId = uuidv4();

  const transactionSrc = 'shipping-website';

  

  const query = new URLSearchParams({
    additionalinfo: 'timeintransit',
  }).toString();

  const resp = await fetch(
    `https://wwwcie.ups.com/api/rating/${version}/${requestOption}?${query}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'transId': transId,
        'transactionSrc': transactionSrc,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        "RateRequest": {
          "Request": {
            "SubVersion": "1701",
            "TransactionReference": {
              "CustomerContext": " "
            }
          },
          "Shipment": {
            "ShipmentRatingOptions": {
              TPFCNegotiatedRatesIndicator: 'Y'
            },
            "Shipper": {
              "Name": "Fat Stogies",
              "ShipperNumber": "E28D93",
              "Address": {
                "AddressLine": "601 General Washington Avenue",
                "City": "Norristown",
                "StateProvinceCode": "PA",
                "PostalCode": "19403",
                "CountryCode": "US"
              }
            },
            "ShipTo": {
              "Name": userAddress.name,
              "Address": {
                "AddressLine": userAddress.address,
                "City": userAddress.city,
                "StateProvinceCode": userAddress.state,
                "PostalCode": userAddress.zipCode,
                "CountryCode":userAddress.countryCode
              },
              "ResidentialAddressIndicator": "True" 
            },
            "ShipFrom": {
              "Name": "Fat Stogies",
              "Address": {
                "AddressLine": "601 General Washington Avenue",
                "City": "Norristown",
                "StateProvinceCode": "PA",
                "PostalCode": "19403",
                "CountryCode": "US"
              }
            },
            "PaymentDetails": {
              "ShipmentCharge": {
                "Type": '01',
                "BillShipper": {
                  "AccountNumber": 'E28D93'
                }
              }
            },
            "Service": {
              "Code": selectedServiceCode,
              "Description": "Ground"
            },
            "NumOfPieces": '1',
            "ShipmentTotalWeight": {
              "UnitOfMeasurement": {
                "Code": "LBS",
                "Description": "Pounds"
              },
              "Weight": "1"
            },
            "Package": {
              "LargePackageIndicator": 'X',
              "PackagingType": {
                "Code": "02",
                "Description": "Package"
              },
              "Dimensions": {
                "UnitOfMeasurement": {
                  "Code": "IN"
                },
                "Length": "10",
                "Width": "7",
                "Height": "2"
              },
              "PackageWeight": {
                "UnitOfMeasurement": {
                  "Code": "LBS"
                },
                "Weight": "1"
              }
            },
            "OversizeIndicator": 'X',
            "MinimumBillableWeightIndicator": 'X',
            "DeliveryTimeInformation": {
              "PackageBillType": "03",
              "DeliveryDayInformation": {
                "DayOfWeek": "MON",
                "PackageBillType": "PREPAID"
              }
            },
            
          }
        }
      }      
      ),
    }
  );

  if (resp.status === 200) {
    const data = await resp.json();
    return data;
  } else {
    const errorData = await resp.json();
    throw new Error(`Error getting shipping rate: ${errorData.response.errors[0].message}`);
  }
}

async function getUserShippingRate(req, res) {
  try {
    const token = await authCode();
    const userAddress = {
      name:req.body.address.fullName,
      address:req.body.address.address,
      city: req.body.address.selectedCity,
      state: req.body.address.selectedState,
      zipCode: req.body.address.zipCode,
      countryCode: req.body.address.selectedCountry,
    };
    const selectedServiceCodes = ["03", "02", "13", "01", "14","12"];
    const shippingRates = [];

    for (const selectedServiceCode of selectedServiceCodes) {
      const shippingRateData = await getShippingRate(token, userAddress, selectedServiceCode);

      const serviceCodeToNameMap = {
        '03': 'Ground Service',
        '02': '2nd Day Air',
        '13': 'Next Day Air Saver',
        '01': 'Next Day Air',
        '14': 'Next Day Air Early AM',
        '12': '3 Day Select',
      };
      

      const totalCharges = shippingRateData.RateResponse.RatedShipment.TotalCharges;
      const serviceName = serviceCodeToNameMap[selectedServiceCode] || 'Unknown';


      const rate = {
        serviceCode: selectedServiceCode,
        serviceName,
        totalCharges,
      };

      shippingRates.push(rate);
    }



   return res.status(200).json(shippingRates);

  } catch (error) {
    return res.status(500).json({ error: 'Error handling user shipping rate request', details: error.message });
  }
}


module.exports = {
  getUserShippingRate,
};


