String.prototype.clr = function (hexColor) { return `<font color='#${hexColor}'>${this}</font>` };

const SettingsUI = require('tera-mod-ui').Settings;
const _ = require('lodash')

module.exports = function Auto_Club_Rewards(mod) {

    if (mod.proxyAuthor !== 'caali' || !global.TeraProxy) {
        mod.warn('You are trying to use this module on an unsupported legacy version of tera-proxy.');
        mod.warn('The module may not work as expected, and even if it works for now, it may break at any point in the future!');
        mod.warn('It is highly recommended that you download the latest official version from the #proxy channel in http://tiny.cc/caalis-tera-proxy');
    }

    const rewards = {
        2: 'Vergos Flame',
        5: 'Tera Club Supplies'
    };

    let ready_check = false;

    mod.command.add('club', (arg_1) => {
        if (arg_1 === 'rewards') {
            mod.settings.enabled = !mod.settings.enabled;
            mod.command.message(`Auto club rewards is now ${mod.settings.enabled ? 'enabled'.clr('00ff04') : 'disabled'.clr('ff0000')}.`);
        }
        else if (arg_1 === 'add') {
            mod.settings.names = mod.game.me.name;
            mod.command.message(`Club rewards will be claimed on ${mod.settings.names}.`);
        }
        else if (arg_1 === 'list') {
            mod.command.message(`Club rewards will be claimed on ${mod.settings.names}.`);
        }
        else if (arg_1 === 'clear') {
            mod.settings.names = '';
            mod.command.message('Character names are removed successfully from the config.');
        }
        else if (arg_1 === 'config') {
            if (ui) {
                ui.show();
            }
        }
    });

    mod.hook('S_LOAD_TOPO', 3, (event) => {
        ready_check = false;
    });

    mod.hook('C_LOAD_TOPO_FIN', 1, (event) => {
        ready_check = true;
    });

    mod.hook('S_PCBANGINVENTORY_DATALIST', 1, (event) => {
        if (mod.settings.names.includes(mod.game.me.name) && mod.settings.enabled && ready_check) {
            event.inventory.forEach(function(item, index) {
                if (rewards[item.slot] && item.amount === 1) {
                    claim_rewards(item.slot);
                }
            });
        }
    });

    const claim_rewards = _.debounce(function(slot) {
        mod.command.message(`Claiming ${rewards[slot]} from your club bar.`);
        mod.send('C_PCBANGINVENTORY_USE_SLOT', 1, {
            slot: slot
        });
    }, 1000);

    let ui = null;
    if (global.TeraProxy.GUIMode) {
        ui = new SettingsUI(mod, require('./settings_structure'), mod.settings, { height: 155 }, { alwaysOnTop: true });
        ui.on('update', settings => { mod.settings = settings; });

        this.destructor = () => {
            if (ui) {
                ui.close();
                ui = null;
            }
        };
    }
};
