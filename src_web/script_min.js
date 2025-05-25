var	mde = 'l',
	$Q = {										
		'pool':{
			'nme':'pool.xmr.soontm.xyz',										//also sets the cookie prefix
		},
		'clr':{
			'main':'7a7a7a',										//C1
			'secondary':'818181',									//C2
			'back-l':'e8e8e8',										//C0 - light
			'back-d':'313131'	   									//C0 - dark
		},
		'cur':{
			'nme':'Monero',						
			'sym':'XMR',
			'blk':2,												//blocktime in minutes
			'reg':/^[4|8|9]{1}([A-Za-z0-9]{105}|[A-Za-z0-9]{94})$/	//address regex
		},	
        'news':false,												//enable news (motd) alerts on homepage
		'email':true,												//enable email notifications
		'timer':20,													//refresh timer in seconds
		'graph':{
			'hrs':8,												//max chart length in hours
			'pplns':false,											//show pplns window on chart
			'blockmin':50											//min number of blocks to show (blocks take their own time scale) max 100
		},
		'pay':{
			'min_inst':0.2,										//minimum for instant pay
			'min_auto':0.2,											//minimum for automatic threshold
			'dec_auto':6											//decimal places for threshold
		}
	},
	$$ = {
		'calc':{
			'1':'Per Day',
			'7':'Per Week',
			'30':'Per Month',
			'365':'Per Year',
		},
		'hlp':{
			'head':'Welcome to '+$Q['pool']['nme'],
			'text':'Getting started is easy. '
		},
		'msg':{
			'welcome':{'head':'Welcome to '+$Q['pool']['nme'], 'text':'Visit the <u class="nav C1" data-tar="help">help section</u> to get setup, then enter your '+$Q['cur']['nme']+' address below. While you are mining your stats will appear here, soon.'},
			'addr_invalid':{'head':'Invalid '+$Q['cur']['nme']+' Address', 'text':'Double check that your address is complete.'},
			'addr_notfound':{'head':'Address Not Found', 'text':'If you\'ve submitted your first share, be patient, it may take a minute or two to update. If your shares are being rejected, visit the <u class="nav C1" data-tar="help">help section.</u>'},
			'addr_nodata':{'head':'No Data', 'text':''}
		},
		'nav':{
			'home':'Home',
			'blocks':'Blocks',
			'payments':'Payments',
			'help':'Help'
		},
		'pay':{
			'DashPending':{'lbl':$Q['cur']['sym']+' Pending', 'var':'due'},
			'DashPaid':{'lbl':$Q['cur']['sym']+' Paid', 'var':'paid'}
		},
		'sts':{
			'MinerWorkerCount':{'lbl':'Worker count', 'var':'worker_count'},
			'MinerHashes':{'lbl':'Current Hashrate', 'var':'hashes'},
			'MinerShares':{'lbl':'Total Shares', 'def':'--', 'var':'shares'}
		},
		'tbl':{
			'poolpay':{
				'tme':{'lbl':'Payment Sent', 'cls':'condte'},
				'payees':{'lbl':'Payees', 'cls':'consmall'},
				'amnt':{'lbl':'Amount ('+$Q['cur']['sym']+')', 'cls':'consmall'},
				'fee':{'lbl':'Fee ('+$Q['cur']['sym']+')', 'cls':'right'}
			},
            'payments':{
				'timestamp':{'lbl':'Payment Sent', 'cls':'condte'},
				'amount':{'lbl':'Amount ('+$Q['cur']['sym']+')', 'cls':'consmall'}
			},
			'blockhistory':{
				'tme':{'lbl':'Block Mined', 'cls':'condte'},
				'togo':{'lbl':'Maturity', 'cls':'consmall'},
				'eff':{'lbl':'Effort', 'cls':'continy'},
				'reward':{'lbl':'Reward ('+$Q['cur']['sym']+')', 'cls':'consmall'},
				'height':{'lbl':'Height', 'cls':'consmall'},
				'hash':{'lbl':'Transaction', 'cls':'right', 'hsh':'y'}	
			},
			'blocks':{
				'timestamp':{'lbl':'Block Mined', 'cls':'condte'},
				'reward':{'lbl':'Reward ('+$Q['cur']['sym']+')', 'cls':'consmall'},
				'height':{'lbl':'Height', 'cls':'consmall'}
			},
			'miner':{
				'timestamp':{'lbl':'Payment Sent', 'cls':'condte'},
				'amount':{'lbl':'Amount ('+$Q['cur']['sym']+')', 'cls':'center'}
			}
		},
		'trn':{
			'vwpy':'View Your Payments'
		}
        
	};

/*--------------------------------------*/
/*-----End of Customization Section------- (You can customize the rest, but shouldn't need to) */
/*--------------------------------------*/
//new data input

document.addEventListener("DOMContentLoaded", () => {
    const mode = localStorage.getItem("mode");
    if (mode === "darkmode" || mode === "lightmode") {
        document.body.classList.add(mode);
    } else {
        document.body.classList.add("darkmode");
    }

    TimerLoading("on");
    setStatsLoading();
    upd();
setInterval(() => {
    TimerLoading("on");
    setStatsLoading();
    upd();
}, $Q.timer * 1000);
});

function upd() {

api('stats').then(async function(){
                  await new Promise(r => setTimeout(r, 500));    

        if(parseInt($D['connected_miners']) > 0){updateElement("miners", "Miners: " + Num($D['connected_miners']));}
        else{updateElement("miners", "Miners: --");}

        const poolHashrate = formatHashrate($D['pool_hashrate']);
        const globalHash = (parseInt($D['network_difficulty']) && parseInt($D['Globalhashrate']) > 0) ? (parseInt($D['network_difficulty']) / 120) : 1;
        const globalHashrate = formatHashrate(globalHash);

        updateElement("poolHashrate", `Pool Hashrate: ${poolHashrate}`);
        updateElement("globalHashrate", `Global Hashrate: ${globalHashrate}`);
                
        if(parseInt($D['pool_blocks_found']) > 0){
        updateElement("lastBlock", `Last Block: ${timeAgo($D['last_block_found'])}`);
        }

        updateTimer = $Q.timer;
        if ($C.TimerText) $C.TimerText.innerText = updateTimer;
  
        setTimeout(() => {
            g = document.getElementById('MinerDash');
            if(g !== null){Graph_Miner();}         
            Graph_Pool();
            Graph_Global();
            window.dispatchEvent(new Event('resize'));
        }, 500);

        TimerLoading("off");
        LoadTimer();
    }).catch(() => null);
}

function setStatsLoading() {
    updateElement("miners", "");
    updateElement("poolHashrate", "");
    updateElement("globalHashrate", "");
    updateElement("lastBlock", "");
}

function timeAgo(timestamp) {
    let now = Math.floor(Date.now() / 1000);
    let diff = now - timestamp;
    let days = Math.floor(diff / 86400);
    diff %= 86400;
    let hours = Math.floor(diff / 3600);
    diff %= 3600;
    let minutes = Math.floor(diff / 60);

    let result = '';
    if (days > 0) result += `${days} day${days > 1 ? "s" : ""} `;
    if (hours > 0) result += `${hours} hour${hours > 1 ? "s" : ""} `;
    if (minutes > 0) result += `${minutes} min${minutes > 1 ? "s" : ""} `;
    return result.trim() || "just now";
}

function showStatsFallback(msg) {
    const statsEl = document.getElementById("GraphStats");
    if (statsEl) statsEl.innerHTML = `<span>${msg}</span>`;
}

function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value ?? "--";
}

function formatHashrate(h) {
    if (!h || isNaN(h)) return "--";
    let units = ["H/s", "KH/s", "MH/s", "GH/s", "TH/s", "PH/s"], i = 0;
    while (h >= 1000 && i < units.length - 1) h /= 1000, i++;
    return `${h.toFixed(2)} ${units[i]}`;
}

function formatNumber(n) {
    return n ? n.toLocaleString("en-US") : "--";
}

var addr = UrlVars()['addr'] || '',
	pref = 'LNA',
	cookieprefix = $Q['pool']['nme'].replace(/[ ,;]/g, ''),
	resizeTimer,
	updateTimer = $Q['timer'],
	updateCounter,
	outoffocus = 0,
	now = Rnd((new Date()).getTime() / 1000),
	width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
	netpop_open = '',
	$A = {},			//Account Memory
	$C = {				//Selector Cache
		'TogMode':'',
		'Timer':'',
		'NetGraph':'',
		'Addr':'',
		'Stage':'',
        'Stage2':'',
        'Stage3':'',
		'DashPayBtn':'',
		'AddrField':'',
		'TimerPie':'',
		'TimerText':'',
		'TimerRefresh':''
	},
	$U = {				//Update Times
		'net':0,
		'netheight':0,
		'pool':0,
		'poolstats':0,
		'news':0
	},
	$L ={				//Localization
		'perc':'9 %',
		'thou':',',
		'dec':'.',
		'tme':'G:i'
	},
	$D = {				//Data Digests
		'news':{},
        'miner':{},
        'connected_miners':0,
		'block':{},
        'blocks':{},
		'blockhistory':{},
        'hashes':0,
        'hash_plot':[],
        'last_block_found':0,
        'miner_balance':0,		
        'miner_shares':0,  
        'net':{},
        'network_difficulty':0,
		'pool':{},
        'pool_hashrate':0,
        'pool_plot':[],
		'poolstats':{},
        'Globalhashrate':0,
        'Globalplot':[],
		'pay':{},
        'pay_addr':{},
        'payments':{},
		'poolpay':{},
        'pool_blocks_found':0,
		'netheight':'',
		'hashconv':{
			'GH':1000000000,
			'MH':1000000,
			'KH':1000,
			'H':1
		},
        'worker_count':0,

	},
	$I = {				//Icons
		'l':'<svg viewBox="0 0 99 99"><circle opacity=".6" cx="49.5" cy="49.5" r="31.5"/><path d="M87.6 57.1L99 49.5 87.7 42l7.5-11.3L82 27.9l2.6-13.4-13.4 2.7-2.6-13.4L57 11.4 49.5 0 42 11.3 30.6 3.8 27.9 17l-13.4-2.6 2.7 13.4-13.4 2.6L11.4 42 0 49.5 11.3 57 3.8 68.4 17 71.1l-2.6 13.4 13.4-2.7 2.6 13.4L42 87.6 49.5 99 57 87.7l11.3 7.5L71.1 82l13.4 2.6-2.7-13.4 13.4-2.6L87.6 57zM49.5 80a30.5 30.5 0 1 1 0-61 30.5 30.5 0 0 1 0 61z"/></svg>',
		'd':'<svg viewBox="0 0 99 99"><path d="M25.2 19.6l5.3 10.6 11.7 1.7-8.5 8.3 2 11.6-10.5-5.5-10.4 5.5 2-11.6-8.5-8.3L20 30.2l5.2-10.6zm29.6-3.4l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.5 2.9 1-6-4.3-4.3 6-1 2.8-5.4zM64.8 0A46 46 0 0 1 0 64.4 50.9 50.9 0 1 0 64.6 0z"/></svg>',
		'settings':'<svg viewBox="0 0 99 99"><path d="M19.7 50.74V10.92l-6.4 1.69v38.12a16.1 16.1 0 0 0 0 31.53v4.17l6.4 1.65v-5.82a16.09 16.09 0 0 0 0-31.52zm-3.2 25.34a9.58 9.58 0 1 1 0-19.16 9.58 9.58 0 0 1 0 19.16zm36.2-59.51S52.66 0 52.7 0h-6.4v16.57a16.09 16.09 0 0 0 0 31.53V99h6.4V48.1a16.09 16.09 0 0 0 0-31.53zm-3.2 25.35a9.58 9.58 0 1 1 0-19.17 9.58 9.58 0 0 1 0 19.17zm36.2-1.18V12.62l-6.4-1.7v29.81a16.09 16.09 0 0 0 0 31.53v15.82l6.4-1.68V72.26a16.09 16.09 0 0 0 0-31.52zm-3.2 25.34a9.58 9.58 0 1 1 0-19.16 9.58 9.58 0 0 1 0 19.16z"/></svg>',
		'loadico':'<svg viewBox="0 0 99 99"><path d="M49.5 0A49.5 49.5 0 0199 49.5c0 5.8-1.6 15.8-4.7 19.6a50.2 50.2 0 01-50.2 8.6c19.5 3.4 34.1-12.3 34.1-28.2a28.7 28.7 0 10-57.4 0c0 24.3 33.8 47 70.7 26.1A49.5 49.5 0 1149.5 0z"/><path opacity=".08" fill="#000" d="M44.1 77.7c41.9 5.9 60.6-41.7 35-68C91 18.9 99 33.3 99 49.6c0 5.8-1.6 15.8-4.7 19.6a50.2 50.2 0 01-50.2 8.6z"/></svg>',
		'arrow':'<svg viewBox="0 0 99 99"><path d="M27 78l28-29-28-28C17 10 33-8 45 4l35 37c5 5 5 12 0 17L45 95c-12 12-29-6-18-17z"/></svg>',
		'check':'<svg viewBox="0 0 99 99"><path d="M97 21l-8-9c-3-3-7-3-9 0L38 55 19 36c-2-3-6-3-8 0l-9 9c-3 3-2 7 0 9l23 24 9 9c2 3 6 3 8 0l9-9 46-48c3-3 3-7 0-9z"/></svg>',
		'sort':'<svg viewBox="0 0 99 99"><path d="M56 45L35 25 15 45C8 52-6 40 3 32L29 6c4-3 9-3 12 0l27 26c9 8-4 20-12 13zm-13 9l21 20 20-20c7-7 21 5 12 13L70 93c-4 3-9 3-12 0L31 67c-9-8 4-20 12-13z"/></svg>',
		'refresh':'<svg viewBox="0 0 99 99"><path d="M0 55.7v31l9.2-8.5a49.5 49.5 0 0 0 89.4-22.5H86.1a37.1 37.1 0 0 1-67.7 14l15.3-14H0zM49.5 0C24.3 0 3.5 18.9.4 43.3h12.5a37.1 37.1 0 0 1 68.3-13.1L68.1 43.3H99v-31l-8.9 9A49.4 49.4 0 0 0 49.5 0z"/></svg>',
		'x':'<svg viewBox="0 0 99 99"><path d="M99 77L71 50l28-28L77 0 50 28 22 0 0 22l28 28L0 77l22 22 28-28 27 28"/></svg>',
		'delete':'<svg viewBox="0 0 99 99"><path d="M8 28L7 15h86l-2 13H8zM31 0l-1 10h39L68 0H31zM10 33l9 66h61l9-66H10zm18 56l-3-47h8l3 47h-8zm26 0h-9V42h9v47zm17 0h-8l3-47h8l-3 47z"/></svg>',
	};
	$I['load'] = '<div class="LoadCon C1fl o9 Loader">'+$I['loadico']+'</div>';
	
//Event Binding
window.addEventListener('resize', function(){Resize()});

document.body.addEventListener('change', function(e){
	var id = ['#HeadMenu select', '#TblPagBox', '#AddrField'];
	for(var i = 0; i < id.length; i++){
		var el = e.target.matches(id[i]);
		if(el){
			if(id[i] === '#HeadMenu select'){
				Navigate(document.querySelector(id[i]).value);
			}else if(id[i] === '#TblPagBox'){
				var pge = e.target.value.replace(/\D/g,''),
					typ = e.target.getAttribute('data-func');
				if(typ === 'miner'){
                    MinerPaymentHistory(pge);
				}
				if(typ === 'blocks'){
					dta_Blocks(pge);
				}else if(typ === 'payments'){
					dta_Payments(pge);
				}
			}
		}
	}
}, false);

document.body.addEventListener('input', function(e){
	var id = ['#AddrField'];
	for(var i = 0; i < id.length; i++){
		var el = e.target.matches(id[i]);
		if(el){	
            Dash_reset();
        	Dash_load('input');
		}
	}
}, false);

document.body.addEventListener('click', function(e){
	var id = ['#TogMode','#Timer', '#DashPayBtn', '#PaymentHistoryBtn', '#PaymentHistoryBtnClose', '.nav', '.PagBtn', '.helptitle'];
	for(var i = 0; i < id.length; i++){
		var el = e.target.closest(id[i]);
		if(el){
			if(id[i] === '#TogMode'){
				mde = (mde === 'd') ? 'l' : 'd';
				SwitchMode();
			}else if(id[i] === '#Timer'){
				TimerLoading('on');
			}else if(id[i] === '#DashPayBtn'){
                addr = document.querySelector('#AddrField').value;
                if(addr !== ""){
		            if($Q['cur']['reg'].test(addr)){
                	    MinerPayments();
    				}
    			}
			}else if(id[i] === '#PaymentHistoryBtn'){
				MinerPaymentHistory(1);
			}else if(id[i] === '#PaymentHistoryBtnClose'){
				MinerPayments('back');
			}else if(id[i] === '.nav'){
				Navigate(el.getAttribute('data-tar'));
			}else if(id[i] === '.PagBtn'){
				var f = el.getAttribute('data-func'),
					p = parseInt(el.getAttribute('data-page'));					
				if(f === 'payments'){
					dta_Payments(p);
				}else if(f === 'blocks'){
					dta_Blocks(p);
				}else if(f === 'miner'){
                	MinerPaymentHistory(p);	 
				}
			}else if(id[i] === '.helptitle'){
				var b = el.querySelector('.btnback'), b_cl = 'btnback', c_cl = 'helpcontent', t_cl = 'helpteaser';
				if(b.classList.contains('rot90')){
					c_cl += ' hide';
				}else{
					b_cl += ' rot90';
					t_cl += ' hide';
				}
				b.className = b_cl;
				el.parentNode.querySelector('.helpcontent').className = c_cl;
				el.parentNode.querySelector('.helpteaser').className = t_cl;
			}else{
				return;
			}
			return;
		}
	}
}, false);
document.body.addEventListener('keyup', function(e){
	if(e.target.closest('#TblPagBox')){
		PaginationBoxWidth();
		return;
	}
});
document.getElementById('Timer').onmouseover = function(e){
	$C['TimerRefresh'].classList.remove('hide');
};
document.getElementById('Timer').onmouseout = function(e){
	$C['TimerRefresh'].classList.add('hide');
};

function init(){
	
	//Cache Selectors
	var k = Object.keys($C), i = k.length;
	while(i--){
		$C[k[i]] = document.getElementById(k[i]);
	}
	
	//Populate Icons
	$C['TogMode'].innerHTML = $I['d'];
	$C['TimerRefresh'].innerHTML = $I['refresh'];
	document.getElementById('TimerLoader').innerHTML = $I['load'];
	document.querySelector('#HeadMenu .select-point').innerHTML = $I['arrow'];
	document.getElementById('DashPendingLbl').innerHTML = $$['pay']['DashPending']['lbl'];
	document.getElementById('DashPaidLbl').innerHTML = $$['pay']['DashPaid']['lbl'];
	Dash_btn('loading');
	TimerLoading('on');

	//Load Menu
	var i = 0, mn = '', ft = '';
	for(var m in $$['nav']){
		mn += '<option value="'+m+'">'+$$['nav'][m]+'</option>';
		if(i !== 0) ft += ' &middot; ';
		ft += '<span class="nav" data-tar="'+m+'">'+$$['nav'][m]+'</span>';
		i++;
	}
	document.querySelector('#HeadMenu select').innerHTML = mn;
	document.getElementById('FootR').innerHTML = ft;
	
    addr = document.querySelector('#AddrField').value;

	if(addr.length !== 0){
		$C['AddrField'].value = addr;
		$C['AddrField'].blur();
	}else{
		$C['AddrField'].setAttribute('placeholder', 'Your '+$Q['cur']['nme']+' Address...');
	}
	
	if(mde === 'l' && pref && pref.charAt(0) === 'D'){
		mde = 'd';
		SwitchMode();
	}

	Dash_init();
    Dash_pool_init();
    Dash_Global_init();
    Dash_btn('loaded');
}

let timerStart = Date.now();

function LoadTimer() {
    clearInterval(updateCounter);
    TimerLoading('off');
    timerStart = Date.now();
    updateTimer = $Q.timer;

    updateCounter = setInterval(function () {
        const elapsed = Math.floor((Date.now() - timerStart) / 1000);
        updateTimer = Math.max($Q.timer - elapsed, 0);

        if (updateTimer <= 0) {
            TimerLoading('on');
            clearInterval(updateCounter);
        } else {
            var clr = (mde === 'd') ? $Q['clr']['back-d'] : $Q['clr']['back-l'];
            var grd = 'linear-gradient(' + (-90 + (360 * updateTimer / $Q['timer'])) + 'deg, transparent 50%, #7A7A7A';
            if (updateTimer < ($Q['timer'] / 2)) {
                grd = 'linear-gradient(' + (90 + (360 * updateTimer / $Q['timer'])) + 'deg, transparent 50%, #' + clr;
            }
            $C['TimerPie'].style.backgroundImage = grd + ' 50%),linear-gradient(90deg, #' + clr + ' 50%, transparent 50%)';
            $C['TimerText'].innerHTML = updateTimer;
        }
    }, 1000);

    setTimeout(() => {
        g = document.getElementById('MinerDash');
        if(g !== null){Dash_load();}
        Dash_global_pool_load();            
        window.dispatchEvent(new Event('resize'));
    }, 500);
}

window.addEventListener("focus", () => {
    const elapsed = Math.floor((Date.now() - timerStart) / 1000);
    updateTimer = Math.max($Q.timer - elapsed, 0);
    $C['TimerText'].innerHTML = updateTimer;
});
function TimerLoading(sts){
	var l = document.getElementById('TimerLoader');
	if(sts === 'on'){
		l.classList.remove('hide');
	}else{
		l.classList.add('hide');
	}
}
function Resize(){
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(function(){
		width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		HashTrun();
		var p = document.getElementById('MinerPaymentsPage');
		if(p != null) MinerPaymentHistory(p.value);
	}, 250);
}
function SwitchMode(){
	var $CL = ['C0','C0fl','C0bk','C0st','C3','C3fl','FLD'],
		$clr = {'l':{'f':'454545','b':'efefef'},'d':{'f':'b3b3b3','b':'3b3b3b'}},
		bt = (mde === 'd') ? 'l' : 'd',
		i = $CL.length;
		
	$C['TogMode'].innerHTML = $I[bt];
	while(i--){
		document.querySelectorAll('.'+$CL[i]+bt).forEach(function(x){
			x.classList.add($CL[i]+mde);
			x.classList.remove($CL[i]+bt);
		});
	}
	document.querySelector('meta[name=theme-color]').setAttribute('content', '#'+$clr[mde]['b']);
}

function Navigate(tar){
	$C['Stage'].className = '';
	document.querySelectorAll('.nav').forEach(function(x){
		x.classList.remove('o5');
	});
	setTimeout(function(){
		var n = '', m = 'StageFade', h = '', d = 'LR85 C3l';
		if(tar && ['blocks','payments','help'].indexOf(tar) >= 0){
			n = 'short';
			m += ' short';
			h = '<div class="LR85"><div id="PageTopL" class="C3'+mde+' txtmed"></div><div id="PageTopR" class="right"></div></div>'+
				'<div class="pbar"></div>'+
				'<div id="PageBot" class="LR80 C3'+mde+' txt shim10">'+$I['load']+'</div>';
			d += ' hide';
		}else{
			tar = 'home';
		}
		
		$C['Stage'].className = m;
		$C['Stage'].innerHTML = h;
		$C['Addr'].className = d;
		
		if(tar === 'blocks'){
			dta_Blocks('navigate');
		}else if(tar === 'payments'){
			dta_Payments('navigate');
		}else if(tar === 'help'){
			dta_Help();
		}else{
			Dash_init();
            Dash_reset();			
            Dash_load();
		}

		document.querySelector('#HeadMenu select').value = tar;
		document.querySelector('#FootR .nav[data-tar="'+tar+'"]').classList.add('o5');
	}, 300);
}
//Dash
function Dash_init(){
	var $S = ['SplitL', 'SplitR'],
		ins = '<div id="News" class="hide"><div id="NewsCard" class="LR85 C0bk'+mde+' C3'+mde+' shimtop20"></div></div>'+
		'<div id="MinerPayments"></div>'+
		'<div id="MinerGraph"></div>'+
		'<div id="MinerDash" class="LR85 txtbig C3'+mde+' hide"></div>';

	$C['Stage'].innerHTML = ins;
	
	ins = '';	
	for(var j = 0; j < 2; j++){
		ins += '<div class="'+$S[j]+'">';
		var i = 0;
		for(var k in $$['sts']){
			if((j === 0 && i < 2) || (j === 1 && i >= 2)){
				var d = $$['sts'][k]['def'] || '--';
				ins += '<div class="Spl">'+
					'<div id="'+k+'">'+d+'</div>'+
					'<div class="hbar shim4 o8"></div>'+
					'<div class="C2 txttny">'+$$['sts'][k]['lbl']+'</div>'+
				'</div>';
			}
			i++;
		}
		ins += '</div>';
	}
	document.getElementById('MinerDash').innerHTML = ins;
}

function Dash_load(typ){
	var m = document.getElementById('MinerGraph'),
		l = document.getElementById('WorkerList'),
		g = document.getElementById('MinerDash');

    addr = document.querySelector('#AddrField').value;

	if(addr !== ""){
		if($Q['cur']['reg'].test(addr)){
            setCookie('wa=', addr);

			$C['AddrField'].classList.remove('C4');
            if(typ === 'input'){
			    api('stats').then(async function(){
                    await new Promise(r => setTimeout(r, 1000));
				    if(parseInt($D['hashes']) > 0 ){
				    	g.classList.remove('hide');
				    	document.getElementById('MinerHashes').innerHTML = Num($D['hashes']);
				    	document.getElementById('MinerShares').innerHTML = Num($D['miner_shares']);
                        document.getElementById('DashPending').innerHTML = Num($D['miner_balance']);
                        document.getElementById('MinerWorkerCount').innerHTML = Num($D['worker_count']);                  
                        
                        Graph_Miner();
                    
				    }else{
				    	Dash_reset();
				    	m.innerHTML = '<div class="MinerMsg C3'+mde+'"><div class="txtmed">'+$$['msg']['addr_notfound']['head']+'</div><div class="LR80 txt shim10">'+$$['msg']['addr_notfound']['text']+'</div></div>';
				    }
			    }).catch(function(err){console.log(err)});
            }
            else{
                if(parseInt($D['hashes']) > 0 ){
				    	g.classList.remove('hide');
				    	document.getElementById('MinerHashes').innerHTML = Num($D['hashes']);
				    	document.getElementById('MinerShares').innerHTML = Num($D['miner_shares']);
                        document.getElementById('DashPending').innerHTML = Num($D['miner_balance']);
                        document.getElementById('MinerWorkerCount').innerHTML = Num($D['worker_count']);                  
                        
                        Graph_Miner();
                    
				    }else{
				    	Dash_reset();
				    	m.innerHTML = '<div class="MinerMsg C3'+mde+'"><div class="txtmed">'+$$['msg']['addr_notfound']['head']+'</div><div class="LR80 txt shim10">'+$$['msg']['addr_notfound']['text']+'</div></div>';
				    }
            }

            api('miner').then(async function(){
                await new Promise(r => setTimeout(r, 500));
				if(parseInt($D['hashes']) > 0 ){
                    var total = Rnd(($D['miner'][$D['miner'].length - 1]['total_paid'] / 1000000000000), 4);
                    document.getElementById('DashPaid').innerHTML = total;                    
				}
			}).catch(function(err){console.log(err)});

		}else{
			Dash_reset();
			$C['AddrField'].classList.add('C4');
			m.innerHTML = '<div class="MinerMsg C3'+mde+'"><div class="txtmed">'+$$['msg']['addr_invalid']['head']+'</div><div class="LR80 txt shim10">'+$$['msg']['addr_invalid']['text']+'</div></div>';
		}
	}else{
		Dash_reset();
		m.innerHTML = '<div class="MinerMsg C3'+mde+'"><div class="txtmed">'+$$['msg']['welcome']['head']+'</div><div class="LR80 txt shim10">'+$$['msg']['welcome']['text']+'</div></div>';
	}
}

function Dash_pool_init(){
	var ins = '<div id="PoolGraph"></div>';
	$C['Stage2'].innerHTML = ins;	
}

function Dash_global_pool_load(typ){
        Graph_Pool();
        Graph_Global();
}

function Dash_Global_init(){
	var ins = '<div id="GlobalGraph"></div>';
	$C['Stage3'].innerHTML = ins;	
}

function Dash_reset(){
	Dash_btn('inactive');
	var $R = {
		'MinerGraph':{'v':''},
		'MinerPayments':{'r':'Opened','v':''},
	},
	k = Object.keys($R);
	for(var i = 0; i < k.length; i++){
		var id = k[i], el = document.getElementById(id);
		el.innerHTML = $R[id]['v'];
		if($R[id]['r']) el.classList.remove($R[id]['r']);
	}
	for(var k in $$['pay']){
		var e = document.getElementById(k);
		if(e) e.innerHTML = $$['pay'][k]['def'] || '--';
	}
	for(var k in $$['sts']){
		var e = document.getElementById(k);
		if(e) e.innerHTML = $$['sts'][k]['def'] || '--';
	}
}

function Dash_btn(m){
	var b = $C['DashPayBtn'], c = 'nopoint C2fl o5', h = $I['settings'];
	if(m === 'loading'){
		c = 'nopoint';
		h = $I['load'];	
	}else if(m === 'loaded'){
		c = 'C1fl hov';
	}else if(m === 'closer'){
		c = 'C1fl';
		h = '<div class="Closer hov">'+$I['x']+'</div>';
	}
	b.className = c;
	b.innerHTML = h;
}

function MinerPaymentHistory(pge){
	pge = (pge > 1) ? pge : 1;
	document.getElementById('MinerPayments').className = 'OpenedBig';
	document.getElementById('PaymentHistory').innerHTML = '<div class="LR85"><div id="PaymentHistoryBtnClose" class="BtnElem C0'+mde+' txtmed C1bk C2bk_hov">Close Payment History</div>'+
		'<div id="MinerPaymentsTable" class="C3'+mde+'">'+$I['load']+'</div></div>'+
		'<input type="hidden" id="MinerPaymentsPage" value="'+pge+'">';

		Tbl('MinerPaymentsTable', 'miner', pge, 5);
}

//Other Pages
function dta_Blocks(pge){
    if(pge === 'navigate'){
	    api('blocks').then(async function(){
            await new Promise(r => setTimeout(r, 500));
		    document.getElementById('PageTopL').innerHTML = Num($D['blocks']['blocks'].length)+' Blocks Found ';
		    document.getElementById('PageBot').innerHTML = $I['load'];
		    Tbl('PageBot', 'blocks', 1, 25);
	    }).catch(function(err){console.log(err)});
    }
    else{
        document.getElementById('PageTopL').innerHTML = Num($D['blocks']['blocks'].length)+' Blocks Found ';
		document.getElementById('PageBot').innerHTML = $I['load'];
		Tbl('PageBot', 'blocks', pge, 25);
    }
}
function dta_Payments(pge){
    if(pge === 'navigate'){
	    api('payments').then(async function(){
            await new Promise(r => setTimeout(r, 500));
		    document.getElementById('PageTopL').innerHTML = Num($D['payments'].payments.length)+' Payments';
            document.getElementById('PageBot').innerHTML = $I['load'];		
            Tbl('PageBot', 'payments', 1, 25);		
	    }).catch(function(err){console.log(err)});
    }
    else{
        document.getElementById('PageTopL').innerHTML = Num($D['payments'].payments.length)+' Payments';
        document.getElementById('PageBot').innerHTML = $I['load'];		
        Tbl('PageBot', 'payments', pge, 25);
    }
}
function dta_Help(){
	document.getElementById('PageTopL').innerHTML = $$['hlp']['head'];
	var ins = '<p>'+$$['hlp']['text']+'</p>'+
		'<div class="helpgroup">'+
			'<div class="helptitle txtbig">Step 1 - Install Wallet & Create Address<div class="btnback">'+$I['arrow']+'</div></div>'+
			'<div class="helpteaser">Start here if you need a Monero address and wallet.</div>'+
			'<div class="helpcontent hide">'+
				'<p>The <a href="https://www.getmonero.org/downloads/" target="_blank" class="C1 hov">Official Monero Wallet</a> is recommended. Monero Outreach\'s <a href="https://www.monerooutreach.org/stories/monero_wallet_quickstart.php" class="C1 hov" target="_blank">Wallet Guide</a> has a list of other wallet options including paper wallets.</p>'+
			'</div>'+
		'</div>'+
		'<div class="helpgroup">'+
			'<div class="helptitle txtbig">Step 2 - Install Mining Software<div class="btnback">'+$I['arrow']+'</div></div>'+
			'<div class="helpteaser">Install the software needed to mine Monero.</div>'+
			'<div class="helpcontent hide">'+
				'<p>Select the miner that best suits your hardware and follow their installation instructions. </p>'+
				'<p><table class="txtsmall C3'+mde+'"><tr>'+
						'<a href="https://github.com/xmrig/xmrig/" class="C1 hov" target="_blank">XMRig</a> <br>' +
					'</td>'+
				'</tr></table></p>'+
			'</div>'+
		'</div>'+
		'<div class="helpgroup">'+
			'<div class="helptitle txtbig">Step 3 - Configure Settings<div class="btnback">'+$I['arrow']+'</div></div>'+
			'<div class="helpteaser">Select a pool server and port and configure you miner.</div>'+
			'<div class="helpcontent hide">'+
				'<p>Each mining software will have it\'s own config, but they will all ask for the same information:</p>'+
				'<p><b>Your Monero Address</b><br>Often this will be labeled username, but check the instructions.</p>'+ // You can specify a paymentID by using the following format: <i>address</i>.<i>paymentID</i></p>'+
				'<p><b>Pool Address</b><br>The miner will want a url and a port, like this: pool.xmr.soontm.xyz:4242</p>'+
				'<p><table class="txtsmall C3'+mde+'"><tr>'+
					'<td>'+
						'<p>Port descriptions:</p>'+
						'<ul><li>4242 normal tcp</li><li>4343 SSL/TLS</li></ul>'+
					'</td>'+
				'</tr></table></p>'+
			'</div>'+
		'</div>'+
		'<div class="helpgroup">'+
			'<div class="helptitle txtbig">Step 4 - Start Mining<div class="btnback">'+$I['arrow']+'</div></div>'+
			'<div class="helpteaser">Launch the miner and learn more.</div>'+
			'<div class="helpcontent hide">'+
				'<p>This pool uses PPLNS to determine payouts. It helps to combat pool hopping and ensures a good payout for miners.</p>'+
   				'<p>This pool requires that each miner selects its own block template, this is, the transactions that enter the block.</p>'+
   				'<p>Therefore no transactions are previlegued in any way by the pool side. </p>'+
   				'<p>However the transactions with the highest fee are always, and will always be taken first.</p>'+
   				'<p>When possible templates that don\'t meet highest fee requirements will be rejected.</p>'+
   				'<p>This is, soon. </p>'+				
                '<p>'+Perc('1')+' Pool Fee</p>'+
				'<p>0.33 XMR Payout</p>'+
				'<p>60 Block Confirmation Time</p>'+
   				'<p>Command examples:</p>'+
                '<p> ./xmrig --coin monero -u 44BG2aFzPd69RRX2gFZBpmHRAopafHFfje5LcUkebqkPgNzAi2yqeYwjMVwyifQ1WeRcDGPrBbjiUJPoRDMiLBbrD2DvxJX --tls -o soontm.xyz:4343 --self-select=node.xmr.pt:18081 </p>'+
                '<p> ./xmrig --coin monero -u 44BG2aFzPd69RRX2gFZBpmHRAopafHFfje5LcUkebqkPgNzAi2yqeYwjMVwyifQ1WeRcDGPrBbjiUJPoRDMiLBbrD2DvxJX -o soontm.xyz:4242 --self-select=node.xmr.pt:18081 </p>'+
			'</div>'+
		'</div>';
		
	document.getElementById('PageBot').innerHTML = ins;
}
//Data
var api = function(m, key, xid){
	now = Rnd((new Date()).getTime() / 1000);
	key = key || 0;
	xid = xid || '';
	
	var i = 0,
		url = '',
		start = now - (3600 * GraphLib_Duration());

if(m === 'blocks'){
    return new Promise(function (resolve, reject){
    resolve('start of new Promise');
    fetch('https://pool.xmr.soontm.xyz/blocks',{credentials: "include"}).then(r => r.json()).then(d => {
    $D['blocks'] = d;
    }).catch(() => null);
    });
}

if(m === 'payments'){
    return new Promise(function (resolve, reject){
    resolve('start of new Promise');
    fetch('https://pool.xmr.soontm.xyz/payments',{credentials: "include"}).then(r => r.json()).then(d => {
    $D['payments'] = d;
    }).catch(() => null);
    });
}

if(m === 'miner'){
    return new Promise(function (resolve, reject){
    resolve('start of new Promise');
    fetch('https://pool.xmr.soontm.xyz/miner',{credentials: "include"}).then(r => r.json()).then(d => {
    $D['miner'] = d;
    }).catch(() => null);
    });
}

if(m === 'stats'){
    return new Promise(function (resolve, reject){
    resolve('start of new Promise');
    fetch('https://pool.xmr.soontm.xyz/stats',{credentials: "include"}).then(r => r.json()).then(d => {

    $D['last_block_found'] = d['last_block_found'];
    $D['pool_blocks_found'] = d['pool_blocks_found'];   
    $D['pool_hashrate'] = d['pool_hashrate'];
    $D['pool_plot'].push({'hsh':d['pool_hashrate'],'ts':now});            
    if($D['pool_plot'].length > 100){$D['pool_plot'].shift();}    

    $D['network_difficulty'] = d['network_difficulty'];    
    $D['Globalhashrate'] = d['network_hashrate'];
    $D['Globalplot'].push({'hsh':d['network_hashrate'],'ts':now});            
    if($D['Globalplot'].length > 100){$D['Globalplot'].shift();}

    $D['connected_miners'] = d['connected_miners'];
    $D['worker_count'] = d['worker_count'];
    $D['miner_balance'] = d['miner_balance'];
    $D['miner_shares'] = d['miner_shares'];
    $D['hashes'] = d['miner_hashrate'];

    $D['hash_plot'].push({'hsh':d['miner_hashrate'],'ts':now});
    if($D['hash_plot'].length > 100){$D['hash_plot'].shift();}        
                }).catch(() => null);
    });
    }
};
//DataTable
function Tbl(tar, typ, pge, lim){
	var txt = (width > 900) ? 'txt' : 'txtsmall',
		row = 'ROW0',
		ins = '<div class="WingPanel"><table class="txt"><tr class="txttny">';
	
	for(var k in $$['tbl'][typ]){
		ins += '<td class="'+$$['tbl'][typ][k]['cls']+'">'+$$['tbl'][typ][k]['lbl']+'</td>';
	}
	ins += '</tr>';

	if($D[typ]){
        if(typ === "miner"){
        $D[typ] = $D[typ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));        
		    for(var i = 0; i < lim; i++){
                //until length - 1, because last element holds the "total paid".
                if((i + ((pge - 1)*lim)) < $D['miner'].length - 1){
                    var j = i + ((pge - 1)*lim)			            
                    if($D['miner'][i]){
			    	    row = (i % 2 === 0) ? 'ROW1' : 'ROW0';
			    	    ins += '<tr class="'+row+'">';
			    	    for(var k in $$['tbl']['miner']){
			    	    	var val = '';
			    	    	if($D['miner'] && $D['miner'][j] && $D['miner'][j][k]) val = $D['miner'][j][k];
			    	    	if(k === 'timestamp'){
			    	    		val = Ago(val, 'y');
			    	    	}else if(k === 'height'){
			    	    		val = Num(val);
			    	    	}else if(k === 'reward'){
			    	    		val = Rnd(val / 1000000000000, 8);
			    	    	}else if(k === 'amount'){
			    	    		val = Rnd(val / 1000000000000, 8);
			    	    	}
			    	    	ins += '<td class="'+$$['tbl'][typ][k]['cls']+'">'+val+'</td>';
			    	    }
			    	    ins += '</tr>';
			        }
		        }
	        }   
        }
        else{        
            if(typ === "payments")
            {$D[typ][typ] = $D[typ][typ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));}
		    for(var i = 0; i < lim; i++){
                if((i + ((pge - 1)*lim)) < $D[typ][typ].length){
                    var j = i + ((pge - 1)*lim)			            
                    if($D[typ][typ][i]){
			    	    row = (i % 2 === 0) ? 'ROW1' : 'ROW0';
			    	    ins += '<tr class="'+row+'">';
			    	    for(var k in $$['tbl'][typ]){
			    	    	var val = '';
			    	    	if($D[typ][typ] && $D[typ][typ][j] && $D[typ][typ][j][k]) val = $D[typ][typ][j][k];
			    	    	if(k === 'timestamp'){
			    	    		val = Ago(val, 'y');
			    	    	}else if(k === 'height'){
			    	    		val = Num(val);
			    	    	}else if(k === 'reward'){
			    	    		val = Rnd(val / 1000000000000, 8);
			    	    	}else if(k === 'amount'){
			    	    		val = Rnd(val / 1000000000000, 8);
			    	    	}
			    	    	ins += '<td class="'+$$['tbl'][typ][k]['cls']+'">'+val+'</td>';
			    	    }
			    	    ins += '</tr>';
			        }
		        }
	        }   
        }
    }
	ins += '</table>'+
		'<div id="'+tar+'-WBL" class="WingBtnL rot180 o3 nopoint C2bk C0fl'+mde+'">'+$I['arrow']+'</div>'+
		'<div id="'+tar+'-WBR" class="WingBtnR o3 nopoint C2bk C0fl'+mde+'">'+$I['arrow']+'</div>'+
		'</div>';
		
	document.getElementById(tar).innerHTML = ins;
	if($D[typ]){
		var tr = (typ === 'payments') ? 'tx' : '';
		HashTrun(tr);

        var tot = 0;
        var pgs = 0;
        if(typ === 'payments'){tot = $D['payments']['payments'].length;}
        if(typ === 'blocks'){tot = $D['blocks']['blocks'].length;}
        pgs = Math.ceil(tot / lim);
        if(typ === 'miner'){tot = $D['miner'].length; pgs = Math.ceil(tot / lim);}

		if(tar === 'PageBot'){
			document.getElementById('PageTopR').innerHTML = '<span class="txtmed C3'+mde+'">Page</span><input id="TblPagBox" type="text" class="FrmElem txttny C1bk C0'+mde+'" value="'+pge+'" data-func="'+typ+'" autocomplete="off" data-tot="'+pgs+'"><span class="txtmed C3'+mde+'">of '+Num(pgs)+'</span>';
			PaginationBoxWidth();
		}
        
        if(tot > lim){
			var BL = document.getElementById(tar+'-WBL'),
				BR = document.getElementById(tar+'-WBR');
			
			if(pge > 1){
				BL.className = 'WingBtnL PagBtn rot180 C1bk C0fl'+mde;
				BL.setAttribute('data-page', pge - 1);
				BL.setAttribute('data-func', typ);
			}
			if(pge < pgs){
				BR.className = 'WingBtnR PagBtn C1bk C0fl'+mde;
				BR.setAttribute('data-page', pge + 1);
				BR.setAttribute('data-func', typ);
			}
		}
	}
}
function PaginationBoxWidth(){
	var b = document.getElementById('TblPagBox'),
		val = b.value.replace(/\D/g,''),
		tot = parseInt(b.getAttribute('data-tot')),
		wid = 18;

	if(val > 999){
		wid = (val > 9999) ? 50 : 42;
		if(val > tot) val = tot;
		val = Num(val);
	}else if(val > 99){
		wid = 32;
	}else if(val > 9){
		wid = 24;
	}
	b.style.width = wid+'px';
	b.value = val;
}

//Miner Payments

function MinerPayments(typ){
	typ = typ || '';
	if(parseInt($D['hashes']) > 0){
		var m = document.getElementById('MinerPayments'), n = document.getElementById('NewsBody');
		if(typ !== 'back' && (m.classList.contains('Opened') || m.classList.contains('OpenedBig'))){
			if(n) n.classList.remove('hide');
			m.className = '';
			m.innerHTML = '';
			Dash_btn('loaded');
			return;
		}else{
			if(n) n.classList.add('hide');
			m.className = 'Opened';
			m.innerHTML = '<div class="hbar"></div><div id="MinerPaymentsStage">'+$I['load']+'</div>';
			Dash_btn('closer');
		}
	}else{
		return;
	}

		var eml = ($Q['email']) ? 'EmailTog' : '',
			ins = '';
		
		ins = '<div class="LR50 shimtop20 C0'+mde+' txtmed">'+
		'<div id="PaymentHistory"><div class="LR50">'+
			'<div id="PaymentHistoryBtn" class="BtnElem '+eml+' C0'+mde+' txtmed C1bk C2bk_hov">'+$$['trn']['vwpy']+'</div>';
		
		ins += '</div></div>';
		
		document.getElementById('MinerPaymentsStage').innerHTML = ins;
}

function Graph_Miner(){
	var ins = '',
		height = 150,
		height_pad = 140,
		timefirst = 999999999999999,
		graphhrs = GraphLib_Duration(),
		timestart = now - (3600 * graphhrs),
		padR = 65,
		right_x = width - padR,
		i = 0,
		cnt = $D['hash_plot'].length,
		points = [],
		pts = '',
		avg = 0,
		max = 0,
		yL = 0,
		xR = right_x,
		yR = 0;
    
	i = cnt;
	while(i--){
		avg = avg + $D['hashes'];
		if($D['hash_plot'][i]['hsh'] > max) max = $D['hash_plot'][i]['hsh'];
		if($D['hash_plot'][i]['ts'] < timefirst) timefirst = $D['hash_plot'][i]['ts'];
	}
    
	if(max > 0){
		if(timefirst >= timestart) timestart = timefirst;
		max = max * 1.2;
		avg = avg / cnt;
		
		//Create Points
		for(i = 0; i < cnt; i++){
			var x = Rnd(right_x - (now - $D['hash_plot'][i]['ts']) * (right_x / (now - timestart)), 1),
				y = Rnd(height_pad - ($D['hash_plot'][i]['hsh']) / max * height_pad, 1);
				
			points.push({'x':x, 'y':y, 'tme':$D['hash_plot'][i]['ts'], 'hsh':$D['hash_plot'][i]['hsh']});
			if(i === 0){
				yL = y;
			}else if(i === (cnt - 1)){
				yR = y;	
			}
		}	

		ins = '<svg viewBox="0 0 '+width+' '+height+'" class="chart">'+
			'<defs>'+
				'<linearGradient id="M"><stop offset="0%" stop-color="#'+$Q['clr']['secondary']+'" stop-opacity="0.2" /><stop offset="15%" stop-color="#'+$Q['clr']['secondary']+'" stop-opacity="0.3" /><stop offset="100%" stop-color="#'+$Q['clr']['secondary']+'" stop-opacity="1" /></linearGradient>'+
			'</defs>';
			
		//Grid Lines
		ins += GraphLib_Grid('line', 5, max, 0, height_pad, width, 'C2');
		
		//Miner Hash Line & Fill
		ins += '<path class="C0fl'+mde+'" stroke="url(#M)" stroke-width="2" d="M'+right_x+','+points[(cnt - 1)]['y']+' '+GraphLib_Bezier(points)+'M0,'+yR+' 0,'+(height + 3)+' '+(width + 3)+','+(height + 3)+' '+(width + 3)+','+yL+'" />';
		
		//Miner Hash Lables with Vertical Adjust
		var hsh = HashConv($D['hashes']), hs_y = yL + 2, lb_y = yL + 11;
		if(yL > (height_pad * .8)){
			hs_y = yL;
			lb_y = yL - 17;
		}
		ins += '<text x="'+(right_x + 4)+'" y="'+hs_y+'" class="txtmed C3fl'+mde+'">'+Rnd(hsh['num'], 1, 'txt')+' '+hsh['unit']+'</text>'+
		'<text x="'+(right_x + 4)+'" y="'+lb_y+'" class="txttny C3fl'+mde+' o7">Your Hash</text>';
		
		//Miner Hash Dots
		for (var i = 0; i < points.length; i++){
			if(i !== 0 && points[i]['x'] > 50){
				ins += '<circle cx="'+points[i]['x']+'" cy="'+points[i]['y']+'" r="2" class="C2fl o8" />'+
					'<circle cx="'+points[i]['x']+'" cy="'+points[i]['y']+'" r="4" class="ToolTip C1fl_hov" data-tme="'+points[i]['tme']+'" data-hsh="'+points[i]['hsh']+'" />';
			}
		}

		//Grid Labels
		ins += GraphLib_Grid('lbl', 5, max, 0, height_pad, width, 'C2');
		ins += '<text x="5" y="'+height_pad+'" class="txttny C2fl o9">0</text>';
		
		//Block Tool Tip
		ins += GraphLib_ToolTipSetup();
		ins += '</svg>';
		document.getElementById('MinerGraph').innerHTML = ins;
		GraphLib_ToolTipListener();
	}
}

function Graph_Pool(){
	var ins = '',
		height = 150,
		height_pad = 140,
		timefirst = 999999999999999,
		graphhrs = GraphLib_Duration(),
		timestart = now - (3600 * graphhrs),
		padR = 65,
		right_x = width - padR,
		i = 0,
		cnt = $D['pool_plot'].length,
		points = [],
		pts = '',
		avg = 0,
		max = 0,
		yL = 0,
		xR = right_x,
		yR = 0;
    
	i = cnt;
	while(i--){
		if($D['pool_plot'][i]['hsh'] > max) max = $D['pool_plot'][i]['hsh'];
		if($D['pool_plot'][i]['ts'] < timefirst) timefirst = $D['pool_plot'][i]['ts'];
	}
    
	if(max > 0){
		if(timefirst >= timestart) timestart = timefirst;
		max = max * 1.2;
		avg = avg / cnt;
		
		//Create Points
		for(i = 0; i < cnt; i++){
			var x = Rnd(right_x - (now - $D['pool_plot'][i]['ts']) * (right_x / (now - timestart)), 1),
				y = Rnd(height_pad - ($D['pool_plot'][i]['hsh']) / max * height_pad, 1);
				
			points.push({'x':x, 'y':y, 'tme':$D['pool_plot'][i]['ts'], 'hsh':$D['pool_plot'][i]['hsh']});
			if(i === 0){
				yL = y;
			}else if(i === (cnt - 1)){
				yR = y;	
			}
		}	

		ins = '<svg viewBox="0 0 '+width+' '+height+'" class="chart">'+
			'<defs>'+
				'<linearGradient id="M"><stop offset="0%" stop-color="#'+$Q['clr']['secondary']+'" stop-opacity="0.2" /><stop offset="15%" stop-color="#'+$Q['clr']['secondary']+'" stop-opacity="0.3" /><stop offset="100%" stop-color="#'+$Q['clr']['secondary']+'" stop-opacity="1" /></linearGradient>'+
			'</defs>';
			
		//Grid Lines
		ins += GraphLib_Grid('line', 5, max, 0, height_pad, width, 'C2');
		
		//Pool Hash Line & Fill
		ins += '<path class="C0fl'+mde+'" stroke="url(#M)" stroke-width="2" d="M'+right_x+','+points[(cnt - 1)]['y']+' '+GraphLib_Bezier(points)+'M0,'+yR+' 0,'+(height + 3)+' '+(width + 3)+','+(height + 3)+' '+(width + 3)+','+yL+'" />';

		
		//Miner Hash Lables with Vertical Adjust
		var hsh = HashConv($D['pool_hashrate']), hs_y = yL + 2, lb_y = yL + 11;
		if(yL > (height_pad * .8)){
			hs_y = yL;
			lb_y = yL - 17;
		}
		ins += '<text x="'+(right_x + 4)+'" y="'+hs_y+'" class="txtmed C3fl'+mde+'">'+Rnd(hsh['num'], 1, 'txt')+' '+hsh['unit']+'</text>'+
		'<text x="'+(right_x + 4)+'" y="'+lb_y+'" class="txttny C3fl'+mde+' o7">Pool Hash</text>';
		
		//Miner Hash Dots
		for (var i = 0; i < points.length; i++){
			if(i !== 0 && points[i]['x'] > 50){
				ins += '<circle cx="'+points[i]['x']+'" cy="'+points[i]['y']+'" r="2" class="C2fl o8" />'+
					'<circle cx="'+points[i]['x']+'" cy="'+points[i]['y']+'" r="4" class="ToolTip C1fl_hov" data-tme="'+points[i]['tme']+'" data-hsh="'+points[i]['hsh']+'" />';
			}
		}

		//Grid Labels
		ins += GraphLib_Grid('lbl', 5, max, 0, height_pad, width, 'C2');
		ins += '<text x="5" y="'+height_pad+'" class="txttny C2fl o9">0</text>';
		
		//Block Tool Tip
		ins += GraphLib_ToolTipSetup();
		ins += '</svg>';
		document.getElementById('PoolGraph').innerHTML = ins;
		GraphLib_ToolTipListener();
	}
}

function Graph_Global(){
	var ins = '',
		height = 150,
		height_pad = 140,
		timefirst = 999999999999999,
		graphhrs = GraphLib_Duration(),
		timestart = now - (3600 * graphhrs),
		padR = 65,
		right_x = width - padR,
		i = 0,
		cnt = $D['Globalplot'].length,
		points = [],
		pts = '',
		avg = 0,
		max = 0,
		yL = 0,
		xR = right_x,
		yR = 0;
    
	i = cnt;
	while(i--){
		if($D['Globalplot'][i]['hsh'] > max) max = $D['Globalplot'][i]['hsh'];
		if($D['Globalplot'][i]['ts'] < timefirst) timefirst = $D['Globalplot'][i]['ts'];
	}
    
	if(max > 0){
		if(timefirst >= timestart) timestart = timefirst;
		max = max * 1.2;
		avg = avg / cnt;
		
		//Create Points
		for(i = 0; i < cnt; i++){

			var x = Rnd(right_x - (now - $D['Globalplot'][i]['ts']) * (right_x / (now - timestart)), 1),
				y = Rnd(height_pad - ($D['Globalplot'][i]['hsh']) / max * height_pad, 1);
				
			points.push({'x':x, 'y':y, 'tme':$D['Globalplot'][i]['ts'], 'hsh':$D['Globalplot'][i]['hsh']});
			if(i === 0){
				yL = y;
			}else if(i === (cnt - 1)){
				yR = y;	
			}
		}	

		ins = '<svg viewBox="0 0 '+width+' '+height+'" class="chart">'+
			'<defs>'+
				'<linearGradient id="M"><stop offset="0%" stop-color="#'+$Q['clr']['secondary']+'" stop-opacity="0.2" /><stop offset="15%" stop-color="#'+$Q['clr']['secondary']+'" stop-opacity="0.3" /><stop offset="100%" stop-color="#'+$Q['clr']['secondary']+'" stop-opacity="1" /></linearGradient>'+
			'</defs>';
			
		//Grid Lines
		ins += GraphLib_Grid('line', 5, max, 0, height_pad, width, 'C2');
		
		//Pool Hash Line & Fill
		ins += '<path class="C0fl'+mde+'" stroke="url(#M)" stroke-width="2" d="M'+right_x+','+points[(cnt - 1)]['y']+' '+GraphLib_Bezier(points)+'M0,'+yR+' 0,'+(height + 3)+' '+(width + 3)+','+(height + 3)+' '+(width + 3)+','+yL+'" />';

		
		//Miner Hash Lables with Vertical Adjust
		var hsh = HashConv($D['Globalhashrate']), hs_y = yL + 2, lb_y = yL + 11;
		if(yL > (height_pad * .8)){
			hs_y = yL;
			lb_y = yL - 17;
		}
		ins += '<text x="'+(right_x + 4)+'" y="'+hs_y+'" class="txtmed C3fl'+mde+'">'+Rnd(hsh['num'], 1, 'txt')+' '+hsh['unit']+'</text>'+
		'<text x="'+(right_x + 4)+'" y="'+lb_y+'" class="txttny C3fl'+mde+' o7">Global Hash</text>';
		
		//Miner Hash Dots
		for (var i = 0; i < points.length; i++){
			if(i !== 0 && points[i]['x'] > 50){
				ins += '<circle cx="'+points[i]['x']+'" cy="'+points[i]['y']+'" r="2" class="C2fl o8" />'+
					'<circle cx="'+points[i]['x']+'" cy="'+points[i]['y']+'" r="4" class="ToolTip C1fl_hov" data-tme="'+points[i]['tme']+'" data-hsh="'+points[i]['hsh']+'" />';
			}
		}

		//Grid Labels
		ins += GraphLib_Grid('lbl', 5, max, 0, height_pad, width, 'C2');
		ins += '<text x="5" y="'+height_pad+'" class="txttny C2fl o9">0</text>';
		
		//Block Tool Tip
		ins += GraphLib_ToolTipSetup();
		ins += '</svg>';
		document.getElementById('GlobalGraph').innerHTML = ins;
		//Dash_calc();
		GraphLib_ToolTipListener();
	}
}

function GraphLib_Duration(){
	var h = $Q['graph']['hrs'];
	if(width < 600){
		h = h / 2.5;
	}else if(width < 800){
		h = h / 2;
	}else if(width < 1200){
		h = h / 1.5;
	}
	return h;
}
function GraphLib_Grid(m, num, max, min, h, w, cls){
	var r = '';
	if(max > 0){
		var yrt = (max - min) / num, clss = (cls === 'C2') ? '' : mde;
		for(var y = (num - 1); y >= 1; y--){
			var	ylc = Rnd(h - (yrt * y / ((max - min) / h)), 1);
			if(m === 'line'){
				r += '<line x1="50" y1="'+ylc+'" x2="'+w+'" y2="'+ylc+'" class="line '+cls+'st'+clss+' o8" />';
			}else if(m === 'lbl'){
				var yln = HashConv(yrt * y);
				r += '<text x="5" y="'+(ylc + 3)+'" class="'+cls+'fl'+clss+' txttny">'+yln['num']+' '+yln['unit']+'</text>';
			}
		}
	}
	return r;	
}
function GraphLib_ToolTip(el, sts){
	var svg = el.closest('svg.chart'),
		$R = {'Tip_Val':{'x':0, 'y':999, 'i':''}, 'Tip_Tme':{'x':0, 'y':999, 'i':''}, 'Tip_ValBx':{'x':0, 'y':999, 'w':''}, 'Tip_TmeBx':{'x':0, 'y':999}};
		t_x = parseFloat(el.getAttribute('cx')),
		t_y = parseFloat(el.getAttribute('cy')) + 2,
		tme = parseInt(el.getAttribute('data-tme')),
		t_v = '',
		offset = 0;
		
	if(sts === 'open'){
		if(el.getAttribute('data-eff')){
			t_v = el.getAttribute('data-eff')+'%';
			offset = 9;
		}else if(el.getAttribute('data-hsh')){
			var tv = HashConv(el.getAttribute('data-hsh'));
			t_v = tv['num']+' '+tv['unit'];
		}

		var tmeago = Ago(tme, 'y')+' '+Time(tme),
			v_wid = t_v.length * 6 + offset,
			t_wid = tmeago.length * 5.9 - 3;

		$R = {
			'Tip_Val':{'x':(t_x - (v_wid / 2) - 6), 'y':t_y, 'i':t_v},
			'Tip_ValBx':{'x':(t_x - v_wid - 6), 'y':(t_y - 11), 'w':v_wid},
			'Tip_Tme':{'x':(t_x + 7 + (t_wid / 2)), 'y':t_y, 'i':tmeago},
			'Tip_TmeBx':{'x':(t_x + 7), 'y':(t_y - 11), 'w':t_wid}
		};
	}
	for(var k in $R){
		var e = svg.querySelector('.'+k);

		if(e){
			e.setAttribute('x', $R[k]['x']);
			e.setAttribute('y', $R[k]['y']);
			
			if($R[k]['w']) e.setAttribute('width', $R[k]['w']);
			if($R[k]['i']) e.innerHTML = $R[k]['i'];
		}
	}
}
function GraphLib_ToolTipSetup(){
	return '<rect x="0" y="-999" width="9" height="15" rx="3" class="Tip_ValBx C1st C0fl'+mde+'" />'+
			'<text x="0" y="-999" text-anchor="middle" class="Tip_Val C2fl txttny"></text>'+
			'<rect x="0" y="-999" width="9" height="15" rx="3" class="Tip_TmeBx C1st C0fl'+mde+'" />'+
			'<text x="0" y="-999" text-anchor="middle" class="Tip_Tme C2fl txttny"></text>';
}
function GraphLib_ToolTipListener(){
	var b = document.getElementsByClassName('ToolTip');
	for(i = 0; i < b.length; i++){
		b[i].addEventListener('mouseenter', function(){
			GraphLib_ToolTip(this, 'open');
		}, false);
		b[i].addEventListener('mouseleave', function(){
			GraphLib_ToolTip(this, 'close');
		}, false);
	}
}
function GraphLib_Bezier(p){
	var h = '';
	if(p && p.length > 0){
		var r = [];
		h = 'M'+p[0].x+', '+p[0].y+' ';
		for (var i = 0; i < p.length - 1; i++) {
			var a = [], b = [];
			a.push({x:p[Math.max(i - 1, 0)].x, y:p[Math.max(i - 1, 0)].y});
			a.push({x:p[i].x, y:p[i].y});
			a.push({x:p[i + 1].x, y: p[i + 1].y});
			a.push({x:p[Math.min(i + 2, p.length - 1)].x, y:p[Math.min(i + 2, p.length - 1)].y});
			b.push({x:((-a[0].x + 6 * a[1].x + a[2].x) / 6), y:((-a[0].y + 6 * a[1].y + a[2].y) / 6)});
			b.push({x:((a[1].x + 6 * a[2].x - a[3].x) / 6), y:((a[1].y + 6 * a[2].y - a[3].y) / 6)});
			b.push({x:a[2].x, y:a[2].y});
			r.push(b);
		}
		for(var i = 0; i < r.length; i++){
			h += 'C'+Rnd(r[i][0].x, 1)+','+Rnd(r[i][0].y, 1)+' '+Rnd(r[i][1].x, 1)+','+Rnd(r[i][1].y, 1)+' '+Rnd(r[i][2].x, 1)+','+Rnd(r[i][2].y, 1)+' ';
		}	
	}
    return h;
}

function isEmpty(o){
	return (o && Object.entries(o).length === 0 && o.constructor === Object) ? true : false;
}
function numObj(o){
    return (o && typeof o === 'object' && o !== null) ? Object.keys(o).length : 0;
}
function Ago(tme, lbl){
	var t = now - parseInt(tme), r = 0;
	if(t < 60){
		t = t+' Sec';
	}else if(t <= 3600){
		t = Rnd(t / 60)+' Min';
	}else if(t <= 86400){
		r = Rnd(t / 60 / 60);
		t = r+' Hr';
		if(r > 1) t += 's';
	}else{
		r = Rnd(t / 60 / 60 / 24);
		t = r+' Day';
		if(r > 1) t += 's';
	}
	if(lbl === 'y') t += ' Ago';
	return t;
}
function Time(tme){
	var r = '';
	if(tme > 1){
		r = $L['tme'];
		var date = new Date(tme * 1000),
			hr24 = date.getHours(),
			hr12 = hr24,
			min = '0'+date.getMinutes(),
			ap = 'am';
		
		if(hr12 >= 12){
			hr12 = hr12 - 12;
			ap = ' pm';
		}
		r = r.replace('g', hr12);
		r = r.replace('G', hr24);
		r = r.replace('i', min.substr(-2));
		r = r.replace('A', ap);
	}
	return r;
}
function Perc(n){
	return $L['perc'].replace('9', n);
}
function Num(n){
	n = n || 0;
	return n.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1'+$L['thou']);
}
function NumInput(n){
	n = n || 0;
	if(n.indexOf($L['dec']) !== -1){
		var na = n.split($L['dec']);
		n = na[0].replace(/[^\d]/g, '')+'.'+na[1].replace(/[^\d]/g, '');
	}else{
		n = n.replace(/[^\d]/g, '')+'.0';
	}
	return parseFloat(n);
}
function Rnd(n, dec, m){
	if(dec >= 1){
		var d = Math.pow(10, dec);
		n = Math.round(n * d) / d;
		if(m === 'txt'){
			n = n.toFixed(dec);
			if($L['dec'] !== '.') n = n.replace('.', $L['dec']);
		}
	}else{
		n = Math.round(n);
	}
	return n;
}
function HashTrun(typ){
	document.querySelectorAll('.HashTrun').forEach(function(h){
		var hsh = h.getAttribute('data-hash'),
			exp = (typ === 'tx') ? $Q['explorertx'] : $Q['explorer'],
			txt = hsh,
			fit = Math.floor(h.clientWidth / 7.02 / 2);
			
		if(hsh.length > (fit * 2)) txt = hsh.substring(0, (fit - 1))+'...'+hsh.slice((2 - fit));
		h.innerHTML = '<a href="'+exp+hsh+'" target="_blank" class="C1 hov">'+txt+'</a>';
	});
}
function HashConv(h){
	h = (h > 0) ? h : 0;
	var u = '/s';
	for(var k in $D['hashconv']){
		if(h >= $D['hashconv'][k]){
			h = h / $D['hashconv'][k];
			u = k+u;
			break;
		}
	}
	if(h === 0) u = 'H/s'
	return {'num':Rnd(h, 1), 'unit':u};
}
function UrlVars(){
    var v = [], h, p = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < p.length; i++){
        h = p[i].split('=');
        v.push(h[0]);
        v[h[0]] = h[1];
    }
    return v;
}
function removeElement(id){
    var e = document.getElementById(id);
    if(e) return e.parentNode.removeChild(e);
}
function setCookie(n, v){
    var d = new Date();
	d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
    document.cookie = 'wa='+(v || '')+'; expires='+d.toUTCString()+'; path=/'+'; Domain=soontm.xyz'+'; SameSite=Strict';
}
function getCookie(n){
    var nEQ = cookieprefix+n+'=',
		ca = document.cookie.split(';');
		
    for(var i = 0; i < ca.length; i++){
        var c = ca[i];
        while(c.charAt(0)==' ') c = c.substring(1,c.length);
        if(c.indexOf(nEQ) == 0) return c.substring(nEQ.length,c.length);
    }
    return null;
}
function delCookie(n){   
    document.cookie = n+'=; Max-Age=-99999999;';  
}
