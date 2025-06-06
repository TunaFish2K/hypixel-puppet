## hypixel-puppet
### what does it do?
It connects to hypixel, serving as a guild (and party) chat command bot.  
Can provide http API for you send message and requesting your callback server to send your messages it receives.

### Chat Commands
```
# list all commands
!help
# auto /boop
!boop <player>
# send a cute message
!ciallo
# flip a coin
!flip
# roll a dice
!dice
# ask the 8ball
!8ball
# loot a vanguard(spamming alert! only available in party.)
!vg
```
All of the commands can be disabled with environment variables.

### Chat API Protocol
#### Send Message
```
POST http://${API_HOST}:${API_PORT}/send
Content-Type: application/json

{
    "message": "Hello, World!"
}
```
#### Message Callback
```
POST ${API_CALLBACK}/message
Content-Type: application/json

{
    "message": "Hi~",
    "username": "User"
}
```

### how to use?
1. setup environs or use a .env file:  
check the .env.template file in root dir for instructions.

2. start your callback server:  
to test if it works, u may use the `./dist/callbackForTesting.js`.  
otherwise you need to program a server to use with it.

3. start the puppet:
```bash
git clone https://github.com/TunaFish2K/hypixel-puppet
cd hypixel-puppet
npm i
npm run build
node ./dist/index.js
# if you use .env file:
node --env-file /path/to/env/file ./dist/index.js
```