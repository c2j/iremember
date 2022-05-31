<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/env';
	import Recorder from 'js-audio-recorder';
	import { Player, encodeWAV } from 'js-audio-recorder';
    import { _ } from 'svelte-i18n'

    import Arweave from 'arweave'
    import fs from 'fs'

	let recorder; // = new Recorder();
	let playTimer = null;
	let drawRecordId = null;
	let drawPlayId = null;
	let ctx = null;
	let oCanvas = null;
	let pCtx = null;
	let pCanvas = null;

    let arweave = null;
    let wallet = null;
    let wallet_address = null;
    let wallet_key = null;
    let wavUrls = [];

    $: console.log(wavUrls);

    const weave_config = {
        'host': 'testnet.redstone.tools',
        'port': 443,
        'protocol': 'https'
    }

	if (browser) {
		console.log("browser");
 		onMount(async () => {
 			//const Recorder = await import("js-audio-recorder");
 			//recorder = new Recorder();
			oCanvas = document.getElementById('canvas');
        	ctx = oCanvas.getContext("2d"); 
			pCanvas = document.getElementById('playChart');
        	pCtx = pCanvas.getContext("2d");
			console.log("Inited recorder");

            arweave = Arweave.init({
                host: weave_config.host,
                port: weave_config.port,
                protocol: weave_config.protocol
                // host: 'testnet.redstone.tools',
                // port: 443,
                // protocol: 'https'
                });
            console.log("Inited arweave");
            // wallet = await arweave.wallets.generate().then((key) => {
            //         wallet_key = key;
            //         console.log(wallet_key);
            //         arweave.wallets.jwkToAddress(key).then((address) => {
            //             wallet_address = address;
            //             console.log("Inited wallet address: " + address);
                            
            //             });
                    
            //     });
            wallet_key = {"kty":"RSA","n":"x8v6vS1j8d3Wn_G-Do1Pby9ioDucQrqK2mngpv7q8Lza8Ij9kpf2ZSunK-aw-LoFG4UxAAWeXb9m-2ZKrchMXFmQ44iLTJFNZbWdSrLaMoxzkimi1071kQdLmE3Dd7jMDGfDs9_AWSlsOi8wMDEys8uPXnTyMgowbfAy0XkrU1r52rtMug0t9mLuLKnV25wJ28C7CpeF7gVHn-R_g8bTSZenBkPohcyPTZOp6gKBAKGvQhm5Tvxj3mcklCOpxwvJJ5D2kyWE9wdBvaWm72JuM2q-WiezWoSWkMfFVnKHpTDJYKRcwBf4hQ249PIYLOu1h0WizuwANNltw9eebFCPbYm7GfKvE08S_P46afdoKqmDdpRTWvPJafwtTczwx22s_pZBIk4WlAy3LoU-jY6kUI9Yn3zfM492BV2Hya-dR51glQ2IL5vH-WtfDu1aMtZFrw813j-HOIeM7le7Nq6kdHFBw_SznBLDVX1YQ6XUWUtejvxxjNcdcNpOKG-x4oftJq7mUkeIdSYs8sLJ8ZzsvdzypTh6zkQJhzNiMYl9PJSXXfS7QQEz05gFDW0aKuRrgqndyQ8XNPBy6tg6a_hVm02AyMH9j4AcSlfrq3YqXwDqb0ZaW9E2Dn5sEJyeQtq0ew3-v7Bs8uQRXfcbkFCqc166deZa3yKkdzxJkcrHVzc","e":"AQAB","d":"We_jTdcp301p-JO8ZxaLRFSDQ_exboRETu9MNkAYCAgrUg2If72yJ3aQCP4OedhaxjmdhhIBaNfpBo_UXAgG_6c9xn7Hnc7mlTs8s8xw1kJNH-VoLR2ZAxDSoZuXusPP7mGjQcwd7MTtt_9X5MmwtiiSwAVKpOXbSRHP_mVZ8GrKgADCGBoor3l3F1nYL8Q819QZHjp5Cl0MEdis4efVYpJGmFZnTBt6AoTO_szjvyIJH2su9HQ-jHXHjHvFSBlxEkN6C2DfSsfUewcfbzDSxIhvaWvnm36FvGSA21ow31Znv_4c1ke0EkjMEk8MPORZ0auyDw1DRob9lyPvZ3iYJv4Q4AkK9NAapBMAQRrA-dQlXPKv8YX4ZXtz11yAYYHVnBeAdzcztjEpVarBzgVqdATg7WYI04STqxy9SqECy3eqLN6m9AM1b2CpUEvsUQaz-NxtCnRycd_QiRc5iIhq1CvLLq_50nRW61m3frQT3VxDHpvllXehQ39bcKssKutRpiyAEsjpKUOgzFgPQ1LzqdfnqO_x_F5OaaNnfY2WDvDA_w5SdxABGvt9NpD8Eus-imdzdM2e_fAc6tHndke6ae6pFmAMBeWCZiLmWwkgAi30o4JyK3PPDeV84_XO5-JvrGSD9mgzzPRp36h7_O72kObVTxDuS2ZVS0zpka-XiTE","p":"6susJ9PADCyQztvm70BXwp5MMsVhsp6GS0ylYvxpfnLD6NNlhyTuEpNt4UbulIB_0ScuZ0mClWXDFw97jWNLb1QaTWEdqz7pgfquRB33O6Lj3VdxqkUNWnPzo7E08v9CFGJ1lExP-kvx4Oqy5FwuZ2iQbvb1C6ReOKloLiaI_8ggvyBvNQfDUjjXf__Vc7OkoPRHp-jZ-V0o3qaM2vJz9qBSWkE8qN84p7LgHYwRrq39b58Q3JGsc40WWbY3S3jHz0qrhK7GgAPVx7O1MTevBjUkzY8Iv_GfP0ca01oYF8igaxC0TyZx32LuV_zWNsEp4h4kCEMQ1rtDNWeetyAOiQ","q":"2dcoE6LuKEF1YLdckoU1OAnWKfC5RluD4c7jOmltvBJSPIKMhgJx5RMKcXwzTXnk5fafP_bremnQrlaSaDDejxpZt1ioPoAaCaZRz8AJ1mG3CHop0kxPYI14HXVuBaduMtfft7ASueBiCO0foydDBaBJPcFkEvQIxuFHDLdRlmfhYFQ0_5GJVvonsn3s5os-Qc2kSFIMli38wsX_AcyQhHzoo2j88Fyh1000Rveg5ChUCKuxB2dvI7W9LckdEgDm9NXBzTtvN3BsiK6e_DGq1XKkcPPQvNi2Zhvlj8KwrlMIdirXROXKOt3Db6ONbdHtjVJuJ5kyHD9FhO-EJhDHvw","dp":"3vc47b1E44qynO3weITWkic23wPXigLGLt2DNOPT3lNnvUJ6aILmXdeJAeQVDgqU1m5pv4XsLqkrQUvfnV2MthTcwVyXCxa8MkV2lZMLQ6Ok1X2DoBjg3GO-G1VdneBOxQLW-1QYouzZrifSZ88t9d8zQVzdSQf2vcIJ_8FyWcuXZUiMsoRDtGHsK04sSipvDLXNEiOqUwZnmD_7BLQ28R4_9ht7WjZYG9BeyVBJPmNVh1k7buobJMP3VIwYKGBzBmO3S1GZiNmbeoAqcamaWL_Ayj-pJHV0L2f7jndA590KkYGUaJFuk57kDcQ5PFfkySisOPhPFktQQHe9HdOgWQ","dq":"fuT2U3n1gT2gQlaNdkxiU-Jm_sdbJcDpcgAyHTSM16FUhisF8Io8DlSpILJYsCjxTYP8ACa1xPketm93mXneKz4ORN9AIig9AqH_xiT3lgoVtLp04ivRkUzXS1G8ZU7Cwps9lqLaRayPbuOyKjgUspJMF80vnlrJQhC4co_W1uZsQtDKjpUYi7Hsrezsst8pxOslZ3tkGZdwRYVQppujE4ovegEOVnWfUOuIKE7XShCz4tkgpk96TjLvoFwmsvYTk0txOTwF7SVwE66krgPAn9XINIPSdC9JEPHvJ28hvGph43PRMjEpPGEyFzYOjIpc9pWt1SNILWwt8uIS-JmNwQ","qi":"tVeGwW_LACHEJTrAf0fnldt3K6RNiKPfUM9PqnOkdB5YSaIzN8zDiz2pQ02zSDS08BbCSQlIWSy7P0SdVFERDM3gujaT_ncGG7RwEZEatBYz8k6E9r88XzIF9dGcASaATgTfQWbXHl2vJ9b2mqyEd5NLlN0InAZToHl0wqu9WI5gJtWv1fB8kss4I0QbmNclXgucSDyAbJ2FTFnXUBIeFeTv7fmuJKNRQOIHE90KUpUR-H4F4v9-slwAZAue6niR2LEEB1CD_zyIdmMzoYtF1PuihTLHmPo-MJjgwiu8SQ7aiSVu6Kwthu-CzUEWq17oMpBmbkxOBKSZYBEXjL3XAA"};
            arweave.wallets.jwkToAddress(wallet_key)
                .then((address) => {
                    wallet_address = address;
                    console.log("Inited wallet address: " + address);
                        
                });
                    
                
            //wallet = JSON.parse(fs.readFileSync('./wallet.json', 'utf-8'));
            
		});
	}

	const state = {
        sampleBit: 16,
        sampleRate: 16000,
        numChannel: 1,
        compiling: false,
        isRecording: false,     // 是否正在录音
		isPlaying: false,       // 是否正在播放
        duration: 0,
        fileSize: 0,
        vol: 0,
    };

	//$: if(state.isRecording){
	//	document.getElementById('startASR').disabled=true;
	//	document.getElementById('stopASR').disabled=false;
	//}else{
	//	document.getElementById('startASR').disabled=false;
	//	document.getElementById('stopASR').disabled=true;
	//};

    const config = {
            sampleBits: state.sampleBit,
            sampleRate: state.sampleRate,
            numChannels: state.numChannel,
            compiling: state.compiling,       // 是否开启边录音边转化（后期改用web worker）
        };
    

	function startRecord() {
        clearPlay();

        if (!recorder) {
            recorder = new Recorder(config);

            recorder.onprogress = (params) => {
                // console.log(recorder.duration);
                // console.log(recorder.fileSize);

                state.duration = params.duration.toFixed(5);
				state.fileSize = params.fileSize;
				state.vol = params.vol.toFixed(2);
                
                // 此处控制数据的收集频率
                if (config.compiling) {
                    console.log('音频总数据：', params.data);
                }
            };
			
            recorder.onplay = () => {
                console.log('%c回调监听，开始播放音频', 'color: #2196f3')
            }
            recorder.onpauseplay = () => {
                console.log('%c回调监听，暂停播放音频', 'color: #2196f3')
            }
            recorder.onresumeplay = () => {
                console.log('%c回调监听，恢复播放音频', 'color: #2196f3')
            }
            recorder.onstopplay = () => {
                console.log('%c回调监听，停止播放音频', 'color: #2196f3')
            }
            recorder.onplayend = () => {
                console.log('%c回调监听，音频已经完成播放', 'color: #2196f3')
                // 播放结束后，停止绘制canavs
                stopDrawPlay();
            }
			
            // 定时获取录音的数据并播放
            config.compiling && (playTimer = setInterval(() => {
                if (!recorder) {
                    return;
                }

                let newData = recorder.getNextData();
                if (!newData.length) {
                    return;
                }
                let byteLength = newData[0].byteLength
                let buffer = new ArrayBuffer(newData.length * byteLength)
                let dataView = new DataView(buffer)

                    // 数据合并
                for (let i = 0, iLen = newData.length; i < iLen; ++i) {
                    for (let j = 0, jLen = newData[i].byteLength; j < jLen; ++j) {
                        dataView.setInt8(i * byteLength + j, newData[i].getInt8(j))
                    }
                }

                // 将录音数据转成WAV格式，并播放
                let a = encodeWAV(dataView, config.sampleRate, config.sampleRate, config.numChannels, config.sampleBits)
                let any = new Blob([ a ], { type: 'audio/wav' });

                blob.arrayBuffer().then((arraybuffer) => {
                    Player.play(arraybuffer);
                });
            }, 3000))
			
        } else {
            recorder.stop();
        }
		
        recorder.start().then(() => {
			state.isRecording = true;
            console.log('开始录音');
        }, (error) => {
            console.log(`异常了,${error.name}:${error.message}`);
        });
        // 开始绘制canvas
        drawRecord();
		
    }

	function clearPlay() {
        if (playTimer) {
            clearInterval(playTimer);
            playTimer = null;
        }
        if (drawRecordId) {
            cancelAnimationFrame(drawRecordId);
            drawRecordId = null;
        }
        stopDrawPlay();
    }

	function stopDrawPlay() {
        drawPlayId && cancelAnimationFrame(drawPlayId);
        drawPlayId = null;
    }

	function drawRecord() {
        // 用requestAnimationFrame稳定60fps绘制
        drawRecordId = requestAnimationFrame(drawRecord);

        // 实时获取音频大小数据
        let dataArray = recorder.getRecordAnalyseData(),
            bufferLength = dataArray.length;

        // 填充背景色
        ctx.fillStyle = 'rgb(200, 200, 200)';
        ctx.fillRect(0, 0, oCanvas.width, oCanvas.height);

        // 设定波形绘制颜色
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(0, 0, 0)';

        ctx.beginPath();

        var sliceWidth = oCanvas.width * 1.0 / bufferLength, // 一个点占多少位置，共有bufferLength个点要绘制
            x = 0;          // 绘制点的x轴位置

        for (var i = 0; i < bufferLength; i++) {
            var v = dataArray[i] / 128.0;
            var y = v * oCanvas.height / 2;

            if (i === 0) {
                // 第一个点
                ctx.moveTo(x, y);
            } else {
                // 剩余的点
                ctx.lineTo(x, y);
            }
            // 依次平移，绘制所有点
            x += sliceWidth;
        }

        ctx.lineTo(oCanvas.width, oCanvas.height / 2);
        ctx.stroke();
    }

	function endRecord() {
        recorder && recorder.stop();
		state.isRecording = false;
        console.log('结束录音');
        drawRecordId && cancelAnimationFrame(drawRecordId);
        drawRecordId = null;
    }

	function startPlay() {
        recorder && recorder.play();
		state.isPlaying = true;
        drawRecordId && cancelAnimationFrame(drawRecordId);
        drawRecordId = null;
        console.log('播放录音');
        recorder && drawPlay();
        // setInterval(() => {
        //     recorder.getPlayTime()
        // }, 500)
    }

	function stopPlay() {
        clearPlay();
        recorder && recorder.stopPlay();
		state.isPlaying = false;
        console.log('停止播放');
        stopDrawPlay();
    }

	function drawPlay() {
        // 用requestAnimationFrame稳定60fps绘制
        drawPlayId = requestAnimationFrame(drawPlay);

        // 实时获取音频大小数据
        let dataArray = recorder.getPlayAnalyseData(),
            bufferLength = dataArray.length;

        // 填充背景色
        pCtx.fillStyle = 'rgb(200, 200, 200)';
        pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);

        // 设定波形绘制颜色
        pCtx.lineWidth = 2;
        pCtx.strokeStyle = 'rgb(0, 0, 0)';

        pCtx.beginPath();

        var sliceWidth = pCanvas.width * 1.0 / bufferLength, // 一个点占多少位置，共有bufferLength个点要绘制
            x = 0;          // 绘制点的x轴位置

        for (var i = 0; i < bufferLength; i++) {
            var v = dataArray[i] / 128.0;
            var y = v * pCanvas.height / 2;

            if (i === 0) {
                // 第一个点
                pCtx.moveTo(x, y);
            } else {
                // 剩余的点
                pCtx.lineTo(x, y);
            }
            // 依次平移，绘制所有点
            x += sliceWidth;
        }

        pCtx.lineTo(pCanvas.width, pCanvas.height / 2);
        pCtx.stroke();
    }

	function downloadWAV() {
        if (recorder) {
            console.log('wav: ', recorder.getWAVBlob());
            recorder.downloadWAV();
        }
    }

    function uploadWAV() {
        let dataArr = recorder.getWAVBlob();
        let reader = new FileReader();
        //let data = null;
        reader.onload = function(evt) {
                console.log("to be upload");
                const data = evt.target.result;
                const content_type = 'audio/wav';
                const url =  uploadWavToArweave(data, content_type);
                //wavUrls.push(url);
            }
        reader.readAsArrayBuffer(dataArr);
        //console.log(typeof data);
        //console.log( data);
        //console.log( dataArr.size, dataArr.type);
        
        //const data = new TextDecoder().decode(dataArr); 
        
    }

    async function uploadWavToArweave(data, content_type){
        //const data = fs.readFileSync(path_name, 'utf-8')

        // create a arweave transaction
        const tx = await arweave.createTransaction({data}, wallet_key);
        console.log("Create Tx", tx);
        
        tx.addTag('Content-Type', content_type); //'text/html'
        
        // sign the transaction with wallet
        await arweave.transactions.sign(tx, wallet_key)
        console.log("Sign Tx", tx);
        
        // post the transaction 
        await arweave.transactions.post(tx)
        console.log("Post Tx", tx);
        
        //console.log(`Upload wav to:  https://testnet.redstone.tools/${tx.id}`)
        //const url = `https://testnet.redstone.tools/${tx.id}`;
        
        const url = `${weave_config.protocol}://${weave_config.host}:${weave_config.port}/${tx.id}`;
        console.log(`Upload wav to:  `, url);
        wavUrls.push(url);
        wavUrls = wavUrls;
        console.log('wavUrls: ', wavUrls.length);
        return url;
    }

    // For internationalization for English and Chinese
    import { dictionary, locale } from 'svelte-i18n';
    dictionary.set({
        en: {
            "tips": "Click on Start Record button to start recording.",
            "startRecord": "Start Record",
            "stopRecord": "Stop Record",
            "recordLengthInSeconds": "Record Length",
            "recordSizeInBytes": "Record Size",
            "recordVolume": "Record Volume",
            "startPlay": "Start Play",
            "stopPlay": "Stop Play",
            "downloadWav": "Download Wave file",
            "uploadWav": "Upload Wave file to Arweave"
            },
            
        zh: {
            "tips": "点击开始录音，开启实时录音",
            "startRecord": "开始录音",
            "stopRecord": "停止录音",
            "recordLengthInSeconds": "录音时长(秒)",
            "recordSizeInBytes": "录音大小(字节)",
            "recordVolume": "当前录音音量百分比(%)",
            "startPlay": "开始播放",
            "stopPlay": "停止播放",
            "downloadWav": "下载音频文件",
            "uploadWav": "语音备忘上链"
            },
        });
    locale.set('en');
</script>

<svelte:head>
	<title>iRemember Recorder</title>
	<meta name="description" content="iRemember app" />
</svelte:head>

<div class="container bcontent">
	<div class="row">
		<label class="form-label" for="customFile">{$_('tips')}</label>
		<br />
		<button id="startASR"
			on:click={startRecord} disabled={state.isRecording || state.isPlaying}>
			<span class="glyphicon glyphicon-record" aria-hidden="true"></span>{$_('startRecord')}
		</button>
		<button id="stopASR"
			on:click={endRecord} 
			disabled={!state.isRecording || state.isPlaying}>
			<span class="glyphicon glyphicon-stop" aria-hidden="true"></span>{$_('stopRecord')}
		</button>
	</div>

	<div class="ui three statistics" style="width:100%">
		<div class="ui statistic"><div class="value">{ state.duration }</div><div class="label">{$_('recordLengthInSeconds')}</div></div>
		<div class="ui statistic"><div class="value">{ state.fileSize }</div><div class="label">{$_('recordSizeInBytes')}</div></div>
		<div class="ui statistic"><div class="value">{ state.vol }</div><div class="label">{$_('recordVolume')}</div></div></div>
	<div class="row">
		<canvas id="canvas" style="width:100%;height:42px;"></canvas>		
	</div>

	<div class="row">
		<button id="startPlay"
			on:click={startPlay} disabled={state.isRecording || state.duration==0 || state.isPlaying}>
			<span class="glyphicon glyphicon-play" aria-hidden="true"></span>{$_('startPlay')}
		</button>
		<button id="stopPlay"
			on:click={stopPlay} 
			disabled={!(!state.isRecording && state.duration>0 && state.isPlaying)}>
			<span class="glyphicon glyphicon-stop" aria-hidden="true"></span>{$_('stopPlay')}
		</button>
	</div>
	<div class="row">
		<canvas id="playChart" style="width:100%;height:42px;"></canvas>
	</div>

	<div class="row">
		<button id="downloadWAV"
			on:click={downloadWAV} disabled={state.isRecording || state.duration==0 || state.isPlaying}>
			<span class="glyphicon glyphicon-download" aria-hidden="true"></span>{$_('downloadWav')}
		</button>
		<button id="uploadWAV"
			on:click={uploadWAV} disabled={state.isRecording || state.duration==0 || state.isPlaying}>
			<span class="glyphicon glyphicon-upload" aria-hidden="true"></span>{$_('uploadWav')}
		</button>
		
	</div>
    <div class="row">
        {#each wavUrls as url}
            <a href={url} target="_blank"><span class="glyphicon glyphicon-play" aria-hidden="true"></span>{url}</a>
        {/each}
    </div>
</div>

<style>
	.container{
		margin-left: 10px;
		margin-right: 10px;
        max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto; 
		width: 100vw;
		height: 100vh;
		padding: 0.5rem;
	}

	.bcontent {
		margin-top: 10px;
	}

	a:link {
		text-decoration: none;
	}

	a:hover {
		text-decoration: none;
		cursor: hand;
	}

	.ui.statistic>.value, .ui.statistics .statistic>.value{
		-webkit-text-size-adjust: 100%;
    -webkit-box-direction: normal;
    box-sizing: inherit;
    font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;
    font-weight: 400;
    line-height: 1em;
    color: #1b1c1d;
    text-transform: uppercase;
    text-align: center;
    font-size: 3rem!important;
	}

	.ui.statistic>.label, .ui.statistics .statistic>.label{
		-webkit-text-size-adjust: 100%;
    line-height: 1.4285em;
    -webkit-box-direction: normal;
    box-sizing: inherit;
    font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;
    font-size: 0.5em;
    font-weight: 700;
    color: rgba(0,0,0,.87);
    text-transform: uppercase;
    text-align: center;
    margin-top: 0;
	}

	.ui.three.statistics .statistic{
		-webkit-text-size-adjust: 100%;
    font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;
    font-size: 14px;
    line-height: 1.4285em;
    color: rgba(0,0,0,.87);
    box-sizing: inherit;
    display: inline-flex;
    -webkit-box-flex: 0;
    flex: 0 1 auto;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    flex-direction: column;
    min-width: 30%;
    margin: 0 0 1em;
	}
</style>