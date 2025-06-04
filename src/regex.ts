export const GUILD_MESSAGE =  /^Guild > (\[.*])?\s*(\w{2,17}).*?(\[.{1,15}])?: .+$/
export const GUILD_COMMAND =
    /^Guild > (\[.*])?\s*(\w{2,17}).*?(\[.{1,15}])?: \!(\w+)(.+)?$/;
export const PARTY_COMMAND = /^Party > (\[.*])?\s*(\w{2,17}): \!(\w+)(.+)?$/;
export const PARTY_MESSAGE = /^Party > (\[.*])?\s*(\w{2,17}): .+$/;
