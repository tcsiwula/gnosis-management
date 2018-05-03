/* eslint-disable global-require, import/no-dynamic-require, no-console */
const fs = require('fs')
const path = require('path')

module.exports = (env, envVarsConfig = {}, envVarsInterface = {}) => {
  const configsToLoad = ['./config/']

  const envConfigFolder = `./config/environments/${env}`

  const isValidConfigFolder = (
    fs.existsSync(envConfigFolder) &&
    fs.existsSync(path.join(envConfigFolder, 'config.json')) &&
    fs.existsSync(path.join(envConfigFolder, 'interface.config.json'))
  )

  if (!isValidConfigFolder) {
    console.warn(`[WEBPACK]: invalid interface configuration selected: '${env}' - using fallback configuration`)
  } else {
    configsToLoad.push(envConfigFolder)
  }
  console.info(`[WEBPACK]: loaded env configuration: '${env}'`)

  let config = {}
  let interfaceConfig = {}

  configsToLoad.forEach((configPath) => {
    let loadedConfig
    let loadedInterfaceConfig

    try {
      loadedConfig = require(`./${configPath}/config.json`)
    } catch (err) {
      console.error(`Could not load config in ./${configPath}/config.json`)
      console.error(err)
    }

    try {
      loadedInterfaceConfig = require(`./${configPath}/interface.config.json`)
    } catch (err) {
      console.error(`Could not load config in ./${configPath}/config.json`)
      console.error(err)
    }


    config = Object.assign(config, loadedConfig)
    interfaceConfig = Object.assign(interfaceConfig, loadedInterfaceConfig)
  })

  // use env config vars
  Object.assign(config, envVarsConfig) // GNOSIS_CONFIG vars
  Object.assign(interfaceConfig, envVarsInterface) // GNOSIS_INTERFACE vars

  return {
    config,
    interfaceConfig,
  }
}
