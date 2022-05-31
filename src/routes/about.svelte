<script>
	import { onMount } from 'svelte';
	import { browser, dev } from '$app/env';

	import Arweave from 'arweave';
	//import fs from 'fs'

	let arweave = null;
	let address = null;
	let balance = null;
	let wallet_json = null;

	if (browser) {
 		onMount(async () => {
			console.log("Arweave will init");
			
			arweave = Arweave.init({
				host: 'testnet.redstone.tools',
				port: 443,
				protocol: 'https'
			});
			console.log("Arweave inited");
			
			//Generate a wallet
			const wallet = await arweave.wallets.generate();
			console.log("Wallet inited");
			
			//Get the address of our wallet
			address = await arweave.wallets.getAddress(wallet);
			console.log("Address inited");
			
			//Save wallet to file
			//fs.writeFileSync('wallet.json', JSON.stringify(wallet))
			wallet_json = JSON.stringify(wallet);

			//Lets print out the address
			console.log('address: ', address);

			//Lets mint some AR on testnet
			const tokens = arweave.ar.arToWinston('10');
			await arweave.api.get(`/mint/${address}/${tokens}`);
			balance = await arweave.wallets.getBalance(address);
			console.log('balance in AR', balance) ;
			
		 });
	}
	 

	
</script>

<svelte:head>
	<title>About iRemember</title>
	<meta name="description" content="About iRemember app" />
</svelte:head>

<div class="content">
	Address: {address}
	<br/>
	Balance: {balance}
	<br/>
	Wallet: {wallet_json}
</div>

<style>
	.content {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
	}
</style>
