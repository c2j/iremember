# iRemember App

User can record the voice and upload to web3 permanent storage. Laterly, user can playback the recorded voice.

## Build

Once you've installed dependencies with `npm install` , then start a development server:

```bash
git clone https://github.com/c2j/iremember.git
cd iremember
git checkout master
npm install
npm run build
npx svelte-kit preview --host 192.168.3.49 --https true

```

## Testnet recharge

In index.svelte, these lines specified to testnet:
```
    const weave_config = {
        'host': 'testnet.redstone.tools',
        'port': 443,
        'protocol': 'https'
    }
```

and run this command to recharge:
```
curl   https://testnet.redstone.tools/mint/E5w3544WcXjJ28A8E6VZObTjgCBXPpnieX5wu6-CXDU/10000000000000000
```




## Preview
Open browser and go to https://192.168.3.49:3000/

