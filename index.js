const SettingsUI = require('tera-mod-ui').Settings;
const _ = require('lodash')

module.exports = function Autoclubrewards(mod) {

    if (mod.proxyAuthor !== 'caali' || !global.TeraProxy) {
        mod.warn('You are trying to use this module on an unsupported legacy version of tera-proxy.');
        mod.warn('The module may not work as expected, and even if it works for now, it may break at any point in the future!');
        mod.warn('It is highly recommended that you download the latest official version from the #proxy channel in http://tiny.cc/caalis-tera-proxy');
    }

    const rewardsofficial = {
        2: 'Vergos Flame',
        5: 'Tera Club Supplies'
    };

    const rewardsclassic = {
        7: 'Serens Gift Box',
        8: 'Vergos Flame'
    };

    let readycheck = false,
        nameclaim;

    mod.command.add('club', (arg_1, arg_2) => {
        if (arg_1 === 'rewards') {
            mod.settings.enabled = !mod.settings.enabled;
            mod.command.message(`Auto club rewards is now ${mod.settings.enabled ? 'enabled' : 'disabled'}.`);
        }
        else if (arg_1 === 'add') {
            mod.settings.names = arg_2;
            mod.command.message(`Club rewards will be claimed on ${mod.settings.names}.`);
        }
        else if (arg_1 === 'list') {
            mod.command.message(`Club rewards will be claimed on ${mod.settings.names}.`);
        }
        else if (arg_1 === 'remove') {
            mod.settings.names = '';
            mod.command.message('Character names are removed successfully from the config.');
        }
        else if (arg_1 === 'config') {
            if (ui) {
                ui.show();
            }
        }
    });

    mod.hook('S_LOGIN', 12, (event) => {
        nameclaim = event.name;
    });

    mod.hook('S_LOAD_TOPO', 3, (event) => {
        readycheck = false;
    });

    mod.hook('C_LOAD_TOPO_FIN', 1, (event) => {
        readycheck = true;
    });

    mod.hook('S_PCBANGINVENTORY_DATALIST', 1, (event) => {
        if (mod.settings.names.includes(nameclaim) && mod.settings.enabled && readycheck) {
            event.inventory.forEach(function(item, index) {
                if (mod.platform === 'classic') {
                    if (rewardsclassic[item.slot] && item.amount === 1)
                        claimrewards(item.slot);
                } else {
                    if (rewardsofficial[item.slot] && item.amount === 1)
                        claimrewards(item.slot);
                }
            });
        }
    });

    const claimrewards = _.debounce(function(slot) {
        if (mod.platform === 'classic') {
            mod.command.message('Claiming ' + rewardsclassic[slot] + ' from Tera Club bar.');
        } else {
            mod.command.message('Claiming ' + rewardsofficial[slot] + ' from Tera Club bar.');
        }
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
