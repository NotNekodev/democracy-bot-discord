const fs = require('fs');

var config = null;

function load_config() {
    if (config != null) {
        return;
    }

    var file_contents = fs.readFileSync("config.json").toString();

    config = JSON.parse(file_contents);
}

function reserialize_config() {
    fs.writeFileSync("config.json", JSON.stringify(config));
}

module.exports = {
    get_config: () => config,
    load_config: load_config,
    reserialize_config: reserialize_config
}