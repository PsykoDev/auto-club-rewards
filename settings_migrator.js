const Default_Settings = {
    "enabled": true,
    "names": ""
};

module.exports = function Migrate_Settings(from_ver, to_ver, settings) {
    if (from_ver === undefined) {
        // Migrate legacy config file
        return Object.assign(Object.assign({}, Default_Settings), settings);
    } else if (from_ver === null) {
        // No config file exists, use default settings
        return Default_Settings;
    } else {
        // Migrate from older version (using the new system) to latest one
        throw new Error("So far there is only one settings version and this should never be reached!");
    }
};