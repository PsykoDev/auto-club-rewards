String.prototype.clr = function(hex_color) { return `<font color='#${hex_color}'>${this}</font>`; };

const SettingsUI = require('tera-mod-ui').Settings;

module.exports = function Auto_Club_Rewards(mod) {

    let command = mod.command;
    let config = mod.settings;
    let data = mod.game.data;
    let player = mod.game.me;

    if (!['eu', 'na', 'ru'].includes(mod.clientInterface.info.region)) {
        config.enabled = false;
        mod.warn('The region you are playing on is not supported. The module will be disabled now.');
        return;
    }

    const daily_rewards_1 = [154942, 169892, 216944];
    const daily_rewards_2 = [153498, 160839, 216943];

    let packet_slot_1 = null;
    let packet_slot_2 = null;

    command.add('autoclub', (arg_1, arg_2) => {
        if (!arg_1) {
            config.enabled = !config.enabled;
            command.message(`${config.enabled ? '[Settings] The module is now enabled.'.clr('00ff04') : '[Settings] The module is now disabled.'.clr('ff1d00')}`);
            use_slot(packet_slot_1);
            use_slot(packet_slot_2);
        }
        else if (arg_1 === 'add' && arg_2) {
            const name_index = config.name_list.indexOf(arg_2);
            if (name_index === -1) {
                config.name_list.push(arg_2);
                command.message(`[Settings] Character | ${arg_2} | has been added to the name list.`.clr('009dff'));
                use_slot(packet_slot_1);
                use_slot(packet_slot_2);
            } else {
                command.message(`[Warning] Character | ${arg_2} | is already added to the name list.`.clr('ff00ff'));
            }
        }
        else if (arg_1 === 'remove' && arg_2) {
            const name_index = config.name_list.indexOf(arg_2);
            if (name_index != -1) {
                config.name_list.splice(name_index, 1);
                command.message(`[Settings] Character | ${arg_2} | has been removed from the name list.`.clr('009dff'));
                use_slot(packet_slot_1);
                use_slot(packet_slot_2);
            } else {
                command.message(`[Warning] Character | ${arg_2} | can not be found in the name list.`.clr('ff00ff'));
            }
        }
        else if (arg_1 === 'clear') {
            if (config.name_list.length) {
                config.name_list = [];
                command.message('[Settings] The name list is now cleared and can be reconfigured again to your liking.'.clr('009dff'));
            } else {
                command.message(`[Warning] Add an name to the name list before trying to clear an empty name list.`.clr('ff00ff'));
            }
        }
        else if (arg_1 === 'show') {
            if (config.name_list.length) {
                command.message(`[Info] Found | ${config.name_list} | in the name list.`.clr('ffff00'));
            } else {
                command.message(`[Warning] Add an name to the name list before trying to show an empty name list.`.clr('ff00ff'));
            }
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
        if (!config.enabled || !config.name_list.includes(player.name) || !packet_info) return;
        mod.send('C_USE_PREMIUM_SLOT', 1, packet_info);
        if (daily_rewards_1.includes(packet_info.id)) {
            packet_slot_1 = null;
            command.message(`[Info] Claimed | ${data.items.get(packet_info.id).name} | from your club bar.`.clr('ffff00'));
        }
        else if (daily_rewards_2.includes(packet_info.id)) {
            packet_slot_2 = null;
            command.message(`[Info] Claimed | ${data.items.get(packet_info.id).name} | from your club bar.`.clr('ffff00'));
        }
    }

    const check_config_file = () => {
        if (!Array.isArray(config.name_list)) {
            config.name_list = [];
            mod.error('Invalid name list settings detected default settings will be applied.');
        }
    };

    let ui = null;

    if (global.TeraProxy.GUIMode) {
        ui = new SettingsUI(mod, require('./settings_structure'), config, {
            alwaysOnTop: true,
            width: 850,
            height: 130
        });
        ui.on('update', settings => {
            if (typeof config.name_list === 'string') {
                config.name_list = config.name_list.split(/\s*(?:,|$)\s*/);
            }
            config = settings;
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