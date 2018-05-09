/* globals fetch */
import qs from 'querystring'
import { getConfiguration } from 'utils/features'

const config = getConfiguration()

const API_URL = `${config.gnosisdb.protocol}://${config.gnosisdb.host}/api`

export const requestFromRestAPI = async (endpoint, queryparams) => {
  const url = `${API_URL}/${endpoint}?${qs.stringify(queryparams)}`

  console.log(`API_URL = ${API_URL}`)
  console.log(`endpoint = ${endpoint}`)
  console.log(`queryparams = ${qs.stringify(queryparams)}`)
  console.log(`url = ${url}`)


  const response = await fetch(url)

  if (response.status > 400) {
    throw new Error('GnosisDB: Couldn\'t fetch (invalid statuscode)')
  }

  try {
    return response.json()
  } catch (e) {
    throw new Error('GnosisDB: Couldn\'t fetch (format error)')
  }
}

// queryparams = creator=
//   1B77f3EbB5587c682CD6ca4c7676B9Ea0Cc01513
// %2C8d95e863B4021db28ce6E4E58Ab4A15Bde727aa1
// %2Cb2e87b8ce41184e0688027f370a972a436abe77e
// %2Cb00a24c899f88e5514583cfa8c40e4cdab6c473e
// %2C65039084cc6f4773291a6ed7dcf5bc3a2e894ff3
// %2C1df62f291b2e969fb0849d99d9ce41e2f137006e
// %2C4b07f5a08639bcde3b7275a98dae265cbda608ca
// %2Ce7e3272a84cf3fe180345b9f7234ba705eb5e2ca
