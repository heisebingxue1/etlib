/*!require: et.util */
/*
	Ctor: tagger
	tagger adds classes such as browser name, version, country, language to body element, helper properly styling when page display in different browse
*/
!function($){
	// ************
	// * Variables
	// ************
	var KEY_COUNTRY = 'ctr';
	var KEY_LANG = 'lng';
	var KEY_DEBUG = 'debug';
	var KEY_PARTNER = 'p';
	var knownBrowsers = ['msie', 'webkit', 'mozilla', 'opera'];
	var knownOSs = {
		'mac':{},
		'win':{}, 
		'linux':{}, 
		'iphone':{css:'ios iphone'},
		'ipad':{css:'ios ipad'}
	};
	var knownAsianLngs = ['ko', 'ja', 'ch', 'cs' ];
    var knownHtml5Browser = ['msie9', 'mozilla', 'opera', 'webkit'];
	
	// ************
	// * Private Functions
	// ************
	
	function compareKey(key1, key2){
		if (!key1) return false;
		return key1.trim().toUpperCase() == key2.toUpperCase();
	};
	
	// get country, language, partner info from cookie
	function getCookieInfo(){
		var ret = {};
		var cPair = document.cookie.toString().split(';');
		for(var i in cPair){
			
			var kv = cPair[i].split('=');
			
			if (kv.length <= 0) continue;
			
			var key = kv[0].trim();
			if (compareKey(key, KEY_COUNTRY)){
				kv.splice(0,1);
				ret[KEY_COUNTRY] = kv.join('=');
			}
			else if (compareKey(key, KEY_LANG)){
				kv.splice(0,1);
				ret[KEY_LANG] = kv.join('=');
			}
			else if (compareKey(key, KEY_DEBUG)){
				// looking into for debug section
				kv.splice(0,1);
				var value = kv.join('=');
				var debugs = value.split('|');
				for(var i = debugs.length; i--;){
					if (debugs[i].indexOf(':') < 0) continue;
					var debugkv = debugs[i].split(':');
					
					// if it is key value pair
					if (debugkv.length > 1){
						if (compareKey(debugkv[0], KEY_PARTNER)){
							debugkv.splice(0, 1);
							ret[KEY_PARTNER] = debugkv.join(':');
						}
					}
				}
			}
		}
		
		return ret;
		
	};
	
	function isAsianLng(lng){
		for(var l = knownAsianLngs.length; l--;){
			if (knownAsianLngs[l] == lng)
				return true;
		}
		
		return false;
	}
	

	et.util.tagger = {
	
		set: function(className){
			this.target.addClass(className);
			var classes = className.split(' ');
			for(var l = classes.length; l--;){
				this.tags[classes[l]] = true;
			}
		},
		tag: function(options){
			var s = {
				more: false
			};
			
			s = $.extend(s, options);
			
			// members and local variables
			var target = $(document.documentElement);
			this.target = target;
			this.tags = {};
			
			var binfo = $.uaMatch(navigator.userAgent);
			var browser = binfo.browser;
			
			// add basic browser name
			this.set(browser);
			
			// add non-[browser name] class name
			for(var l = knownBrowsers.length; l--;){
				if (browser != knownBrowsers[l]){
					this.set('non-' + knownBrowsers[l]);
				}
			}
			
			// special class name for non ie 6 and 7
			if (browser != 'msie' && binfo.version != 6 && binfo.version != 7)	this.set('non-msie6-msie7');
            
			// class is used for css styling not js handling, so lets use documentMode rather then version.
			if (binfo.browser == 'msie' && document.documentMode) binfo.version = document.documentMode + '';
			
			var major = Math.floor(binfo.version);
			// get major when there is a dot
			if (binfo.version.indexOf('.') >= 0){
				major = Math.floor(binfo.version.substring(0, binfo.version.indexOf('.')));
			}
            
			this.set(browser + major);
            
            // html5 browser tag
            var html5TagSet = false;
            for(var l = knownHtml5Browser.length; l--;){
                if (knownHtml5Browser[l] == browser || 
                    knownHtml5Browser[l] == browser + major){
                    this.set('html5browser');
                    html5TagSet = true;
                    break;
                }
            }
            
            if (!html5TagSet){
                this.set('non-html5browser');
            }
            
            // TODO: detailed html5 feature detect
            
            // TODO: orientation detection
			
			// get OS info
			// Figure out what OS is being used 
			for(var name in knownOSs){
				var oskeyword = name;
				var osinfo = knownOSs[name];
				var cssname = osinfo.css ? osinfo.css: name;
				var re = new RegExp(oskeyword, "i");
				if (re.test(navigator.userAgent)){
					this.set(cssname);
				}
			}
			
			if (s.more){
				// add country info and language info to root element
				var etInfo = getCookieInfo();
				this.set('et_ctr_' + etInfo.ctr);
				this.set('et_lng_' + etInfo.lng);
				if (isAsianLng(etInfo.lng)){
					this.set('et_lng_asian');
				}
				else{
					this.set('et_lng_non_asian');
				}
			}
		}
	};
}(jQuery);