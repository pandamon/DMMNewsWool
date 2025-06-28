// ==UserScript==
// @name         DMM News Mobile Check Bypass
// @namespace    https://www.bilibili.com/video/BV1GJ411x7h7
// @version      beta-0.0.5
// @description  DMM Point News Mobile Check Bypass
// @author       Pandamon
// @match        *://www.trepy.jp
// @match        *://www.trepy.jp/*
// @match        *://point-news.jp
// @match        *://point-news.jp/*
// @match        *://www.life-n.jp
// @match        *://www.life-n.jp/*
// @match        *://www.news-fan.jp
// @match        *://www.news-fan.jp/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @run-at       document-start
// @grant        unsafeWindow

// ==/UserScript==

(function() {
    'use strict';
    // also need use chrome extension User-Agent Switcher set to Android

    const observer = new MutationObserver(function(mutations){
        mutations.forEach(function(mutation){
            mutation.addedNodes.forEach(function(node){
                if (node.tagName == 'SCRIPT' && node.textContent.includes(`location.href = '/sp/error-disp/?chk=3';`)){
                    node.remove();
                    console.log('page script removed');
                }
            });
        });
    });
    
    observer.observe(document,{
        childList: true,
        subtree: true
    });

    // if observer not work
    Object.defineProperty(unsafeWindow.navigator,"platform",{
        get: function(){
            return "Android";
        }
    })

    Object.defineProperty(unsafeWindow,"orientation",{
        get: function(){
            return 0;
        }
    })

    Object.defineProperty(unsafeWindow,"ontouchstart",{
        get: function(){
            return null;
        }
    })

    Object.defineProperty(unsafeWindow,"ontouchmove",{
        get: function(){
            return null;
        }
    })

    Object.defineProperty(unsafeWindow,"ontouchend",{
        get: function(){
            return null;
        }
    })

})();