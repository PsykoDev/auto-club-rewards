String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }

const config = require('./config.json')
const _ = require('lodash')

module.exports = function Clubrewards(mod) {

  const rewards = {
    2: "Dragon's Flame", 	//Since Patch 74 it counts after mount confirmed on Europe Server == 2 !
    5: "TERA Club Supplies" //Since Patch 74 it counts after mount confirmed on Europe Server == 5 !
  }

  let playerName
  let playerNames = config.names.slice()
  let isReady = false

  mod.hook('S_LOGIN', 10, (event) => {
    playerName = event.name
  })

  mod.hook('S_LOAD_TOPO', 3, (event) => {
    isReady = false
  })

  mod.hook('C_LOAD_TOPO_FIN', 1, (event) => {
    isReady = true
  })

  mod.hook('S_PCBANGINVENTORY_DATALIST', 1, (event) => {
    if (!playerNames.includes(playerName) || !isReady) return
    event.inventory.forEach(function(item, index) {
      if (rewards[item.slot] && item.amount == 1) {
        claimRewards(item.slot)
      }
    })
  })

  const claimRewards = _.debounce(function(slot) {
    mod.command.message(' (Club-Rewards) Claiming ' + rewards[slot] + ' from Tera Club bar.'.clr('00FF33'))
    mod.send('C_PCBANGINVENTORY_USE_SLOT', 1, {
      slot: slot
    })
  }, 1000)
}
