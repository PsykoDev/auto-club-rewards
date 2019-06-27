String.prototype.clr = function(hex_color) { return `<font color='#${hex_color}'>${this}</font>`; };

const SettingsUI = require('tera-mod-ui').Settings;

module.exports = function Auto_Club_Rewards(mod) {

    if (mod.proxyAuthor !== 'caali' || !global.TeraProxy) {
        mod.warn('You are trying to use this module on an unsupported legacy version of tera-proxy.');
        mod.warn('The module may not work as expected, and even if it works for now, it may break at any point in the future!');
        mod.warn('It is highly recommended that you download the latest official version from the #toolbox channel in http://tiny.cc/caalis-tera-toolbox');
    }

    const vergos_flame = 154942;
    const elite_supply = 153498;

    let packet_slot_2 = null;
    let packet_slot_5 = null;

    mod.command.add('autoclub', (arg_1) => {
        if (!arg_1) {
            mod.settings.enabled = !mod.settings.enabled;
            mod.command.message(`Auto club rewards is now ${mod.settings.enabled ? 'enabled'.clr('00ff04') : 'disabled'.clr('ff1d00')}.`);
            use_slot(packet_slot_2);
            use_slot(packet_slot_5);
        }
        else if (arg_1 === 'add') {
            mod.settings.names = mod.game.me.name.split();
            mod.command.message(`Club rewards will be claimed on | ${mod.settings.names} | .`.clr('009dff'));
            use_slot(packet_slot_2);
            use_slot(packet_slot_5);
        }
        else if (arg_1 === 'list') {
            mod.command.message(`Club rewards will be claimed on | ${mod.settings.names} | .`.clr('009dff'));
        }
        else if (arg_1 === 'clear') {
            mod.settings.names = [];
            mod.command.message('Character names are successfully removed from the config file.'.clr('00ff04'));
        }
        else if (arg_1 === 'config') {
            if (ui) {
                ui.show();
            }
        }
    });

    mod.hook('S_PREMIUM_SLOT_DATALIST', 2, (event) => {
        for (let set of event.sets) {
            for (let inven of set.inventory) {
                if (inven.id === vergos_flame && inven.amount > 0) {
                    packet_slot_2 = {
                        set: set.id,
                        slot: inven.slot,
                        type: inven.type,
                        id: inven.id
                    };
                    use_slot(packet_slot_2);
                }
                if (inven.id === elite_supply && inven.amount > 0) {
                    packet_slot_5 = {
                        set: set.id,
                        slot: inven.slot,
                        type: inven.type,
                        id: inven.id
                    };
                    use_slot(packet_slot_5);
                }
            }
        }
    });

    const use_slot = (packet_info) => {
        if (!mod.settings.enabled || !mod.settings.names.includes(mod.game.me.name) || !packet_info) return;
        mod.send('C_USE_PREMIUM_SLOT', 1,
            packet_info
        );
        if (packet_info.id === vergos_flame) {
            packet_slot_2 = null;
            mod.command.message(`Successfully claimed | Vergos Flame | from your club bar.`.clr('00ff04'));
        }
        if (packet_info.id === elite_supply) {
            packet_slot_5 = null;
            mod.command.message(`Successfully claimed | Club Supplies | from your club bar.`.clr('00ff04'));
        }
    }

    let ui = null;

    if (global.TeraProxy.GUIMode) {
        ui = new SettingsUI(mod, require('./settings_structure'), mod.settings, {
            alwaysOnTop: true,
            width: 850,
            height: 130
        });
        ui.on('update', settings => {
            if (typeof mod.settings.names === 'string') {
                mod.settings.names = mod.settings.names.split(/\s*(?:,|$)\s*/);
            }
            mod.settings = settings;
            use_slot(packet_slot_2);
            use_slot(packet_slot_5);
        });
        this.destructor = () => {
            if (ui) {
                ui.close();
                ui = null;
            }
        };
    }
};