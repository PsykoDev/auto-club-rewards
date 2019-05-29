String.prototype.clr = function(hex_color) { return `<font color='#${hex_color}'>${this}</font>`; }

const SettingsUI = require('tera-mod-ui').Settings;

module.exports = function Auto_Club_Rewards(mod) {

    if (mod.proxyAuthor !== 'caali' || !global.TeraProxy) {
        mod.warn('You are trying to use this module on an unsupported legacy version of tera-proxy.');
        mod.warn('The module may not work as expected, and even if it works for now, it may break at any point in the future!');
        mod.warn('It is highly recommended that you download the latest official version from the #toolbox channel in http://tiny.cc/caalis-tera-toolbox');
    }

    const vergos_flame = 154942;
    const elite_supply = 153498;

    let ready_check = false;

    mod.command.add('autoclub', (arg_1) => {
        if (arg_1 === undefined) {
            mod.settings.enabled = !mod.settings.enabled;
            mod.command.message(`Auto club rewards is now ${mod.settings.enabled ? 'enabled'.clr('00ff04') : 'disabled'.clr('ff1d00')}.`);
        }
        else if (arg_1 === 'add') {
            mod.settings.names = mod.game.me.name;
            mod.command.message(`Club rewards will be claimed on | ${mod.settings.names} | .`.clr('009dff'));
        }
        else if (arg_1 === 'list') {
            mod.command.message(`Club rewards will be claimed on | ${mod.settings.names} | .`.clr('009dff'));
        }
        else if (arg_1 === 'clear') {
            mod.settings.names = '';
            mod.command.message('Character names are removed successfully from the config.'.clr('00ff04'));
        }
        else if (arg_1 === 'config') {
            if (ui) {
                ui.show();
            }
        }
    });

    mod.game.on('enter_loading_screen', () => {
        ready_check = false;
    });

    mod.game.on('leave_loading_screen', () => {
        ready_check = true;
    });

    mod.hook('S_PREMIUM_SLOT_DATALIST', 2, (event) => {
        if (!mod.settings.enabled || !ready_check || !mod.settings.names.includes(mod.game.me.name)) return;
        for (let set of event.sets) {
            for (let inven of set.inventory) {
                if (inven.id === vergos_flame && inven.amount > 0) {
                    const packet_data = {
                        set: set.id,
                        slot: inven.slot,
                        type: inven.type,
                        id: inven.id
                    }
                    use_slot(packet_data);
                }
                if (inven.id === elite_supply && inven.amount > 0) {
                    const packet_data = {
                        set: set.id,
                        slot: inven.slot,
                        type: inven.type,
                        id: inven.id
                    }
                    use_slot(packet_data);
                }
            }
        }
    });

    const use_slot = (packet_info) => {
        mod.send('C_USE_PREMIUM_SLOT', 1,
            packet_info
        );
        if (packet_info.id === vergos_flame) {
            mod.command.message(`Successfully claimed | Vergo's Flame | from your club bar.`.clr('00ff04'));
        }
        if (packet_info.id === elite_supply) {
            mod.command.message(`Successfully claimed | Club Supplies | from your club bar.`.clr('00ff04'));
        }
    }

    let ui = null;

    if (global.TeraProxy.GUIMode) {
        ui = new SettingsUI(mod, require('./settings_structure'), mod.settings, {
            alwaysOnTop: true,
            width: 800,
            height: 130
        });
        ui.on('update', settings => {
            mod.settings = settings;
        });
        this.destructor = () => {
            if (ui) {
                ui.close();
                ui = null;
            }
        };
    }
};