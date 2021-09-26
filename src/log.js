const log = require("npmlog");

log.level = process.env.LOG_LEVEL;
log.disableColor();

module.exports = log;
