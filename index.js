const SettingsUI = require('tera-mod-ui').Settings;

const _ = require('lodash')

module.exports = function Autoclubrewards(mod) {

    if (mod.proxyAuthor !== 'caali' || !global.TeraProxy) {
        mod.warn('You are trying to use this module on an unsupported legacy version of tera-proxy.');
        mod.warn('The module may not work as expected, and even if it works for now, it may break at any point in the future!');
        mod.warn('It is highly recommended that you download the latest official version from the #proxy channel in http://tiny.cc/caalis-tera-proxy');
    }

    const rewards = {
        2: "Dragon's Flame",
        5: "Tera Club Supplies"
    };

    let readycheck = false,
        nameclaim;

    mod.command.add('clubconfig', () => {
        if (ui) {
            ui.show();
        }
    });

    mod.command.add('clublist', () => {
        mod.command.message(`Club rewards will be claimed on ${mod.settings.names}.`);
    });

    mod.command.add('clubreward', () => {
        mod.settings.enabled = !mod.settings.enabled;
        mod.command.message(`Auto club rewards is now ${mod.settings.enabled ? "enabled" : "disabled"}.`);
    });

    mod.command.add('clubadd', (id) => {
        if (mod.settings.names.length === 0) {
            mod.settings.names = id.replace(/^.{1-9}/g, '');
            mod.command.message(`Club rewards will be claimed on ${mod.settings.names}.`);
        } else {
            mod.settings.names = mod.settings.names + ',' + id.replace(/^.{1-9}/g, '');
            mod.command.message(`Club rewards will be claimed on ${mod.settings.names}.`);
        }
    });

    mod.command.add('clubremove', () => {
        mod.settings.names = '';
        mod.command.message('Character names are removed successfully from the config.');
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
        if (!mod.settings.names.includes(nameclaim) || !mod.settings.enabled || !readycheck) return;
        event.inventory.forEach(function(item, index) {
            if (rewards[item.slot] && item.amount == 1) {
                claimrewards(item.slot);
            }
        });
    });

    const claimrewards = _.debounce(function(slot) {
        mod.command.message('Claiming ' + rewards[slot] + ' from Tera Club bar.');
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
