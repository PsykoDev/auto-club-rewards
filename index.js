String.prototype.clr = function(hex_color) { return `<font color='#${hex_color}'>${this}</font>`; };

const SettingsUI = require('tera-mod-ui').Settings;

module.exports = function Auto_Club_Rewards(mod) {

    if (!['eu', 'na', 'ru'].includes(mod.clientInterface.info.region)) {
      mod.settings.enabled = false;
      mod.warn('The region you are playing on is not supported the module will be disabled now.');
      return;
    }

    const daily_rewards_1 = [154942, 169892, 216944];
    const daily_rewards_2 = [153498, 160839, 216943];

    let packet_slot_1 = null;
    let packet_slot_2 = null;

    mod.command.add('autoclub', (arg_1) => {
        if (!arg_1) {
            mod.settings.enabled = !mod.settings.enabled;
            mod.command.message(`${mod.settings.enabled ? '[Settings] The module is now enabled.'.clr('00ff04') : '[Settings] The module is now disabled.'.clr('ff1d00')}`);
            use_slot(packet_slot_1);
            use_slot(packet_slot_2);
        }
        else if (arg_1 === 'add') {
            mod.settings.names = mod.game.me.name.split();
            mod.command.message(`[Settings] Club rewards will be claimed on | ${mod.settings.names} | now.`.clr('009dff'));
            use_slot(packet_slot_1);
            use_slot(packet_slot_2);
        }
        else if (arg_1 === 'list') {
            mod.command.message(`[Settings] Club rewards will be claimed on | ${mod.settings.names} | now.`.clr('009dff'));
        }
        else if (arg_1 === 'clear') {
            mod.settings.names = [];
            mod.command.message('[Settings] Character names are successfully removed from the config file.'.clr('009dff'));
        }
        else if (arg_1 === 'config') {
            if (ui) {
                ui.show();
            }
        }
    });

    mod.game.on('enter_game', () => {
        check_config_file();
    });

    mod.hook('S_PREMIUM_SLOT_DATALIST', 2, (event) => {
        for (let set of event.sets) {
            for (let inven of set.inventory) {
                if (daily_rewards_1.includes(inven.id) && inven.amount > 0) {
                    packet_slot_1 = {
                        set: set.id,
                        slot: inven.slot,
                        type: inven.type,
                        id: inven.id
                    };
                    use_slot(packet_slot_1);
                }
                if (daily_rewards_2.includes(inven.id) && inven.amount > 0) {
                    packet_slot_2 = {
                        set: set.id,
                        slot: inven.slot,
                        type: inven.type,
                        id: inven.id
                    };
                    use_slot(packet_slot_2);
                }
            }
        }
    });

    const use_slot = (packet_info) => {
        if (!mod.settings.enabled || !mod.settings.names.includes(mod.game.me.name) || !packet_info) return;
        mod.send('C_USE_PREMIUM_SLOT', 1, packet_info);
        if (daily_rewards_1.includes(packet_info.id)) {
            packet_slot_1 = null;
            mod.command.message(`[Info] Successfully claimed | ${mod.game.data.items.get(packet_info.id).name} | from your club bar.`.clr('ffff00'));
        }
        else if (daily_rewards_2.includes(packet_info.id)) {
            packet_slot_2 = null;
            mod.command.message(`[Info] Successfully claimed | ${mod.game.data.items.get(packet_info.id).name} | from your club bar.`.clr('ffff00'));
        }
    }

    const check_config_file = () => {
        if (!Array.isArray(mod.settings.names)) {
            mod.settings.names = [];
            mod.error('Invalid name list settings detected default settings will be applied.');
        }
    };

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
            use_slot(packet_slot_1);
            use_slot(packet_slot_2);
        });
        this.destructor = () => {
            if (ui) {
                ui.close();
                ui = null;
            }
        };
    }
};