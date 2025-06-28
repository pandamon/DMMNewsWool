// ==UserScript==
// @name         DMM News Wool
// @namespace    https://www.bilibili.com/video/BV1GJ411x7h7
// @version      beta-0.1.0
// @description  One click harvest DMM news wool
// @author       Pandamon
// @match        *://www.trepy.jp/sp/
// @match        *://point-news.jp/sp/
// @match        *://www.life-n.jp/sp/
// @match        *://www.news-fan.jp/sp/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @run-at       document-idle
// @grant        unsafeWindow
// @downloadURL  https://raw.githubusercontent.com/pandamon/DMMNewsWool/refs/heads/main/dmmnewswool.js
// @updateURL    https://raw.githubusercontent.com/pandamon/DMMNewsWool/refs/heads/main/dmmnewswool.js

// ==/UserScript==

(function() {
    'use strict';

    let domparser = new DOMParser();

    // util function

    let extractNumber = function(str){
        return parseInt(str.match(/\d+/)[0]);
    }
    
    let insertNodeBefore = function(beforeNode,createNodeType,createNodeAttribute){
        // return node (div or button ... ) query string
        // createNodeType:"div","button"...
        // insertNodeAttribute example:
        // insertNodeAttribute = {
        //     id:xxx,
        //     innerHTML:xxx,
        //     innerText:xxx,
        //     background:xxx,
        //     color:xxx,
        //     fontSize:xxx
        // }
        let createNode = document.createElement(createNodeType);
        if(createNodeAttribute.id){
            createNode.setAttribute('id',createNodeAttribute.id);
        }
        if(createNodeAttribute.innerHTML){
            createNode.innerHTML = createNodeAttribute.innerHTML;
        }
        if(createNodeAttribute.innerText){
            createNode.innerText = createNodeAttribute.innerText;
        }
        if(createNodeAttribute.background){
            createNode.style.background = createNodeAttribute.background;
        }
        if(createNodeAttribute.color){
            createNode.style.color = createNodeAttribute.color;
        }
        if(createNodeAttribute.fontSize){
            createNode.style.fontSize = createNodeAttribute.fontSize;
        }
        beforeNode.parentElement.insertBefore(createNode,beforeNode);
        return "#"+createNodeAttribute.id;
    }
    
    let createArticleStampBtn = function(articleNode){
        let articleURL = new URL(articleNode.href);
        let article_id = articleURL.searchParams.get("article_id");
        let articleStampBtnAttribute = {
            id:"stampbtn"+article_id,
            innerText:"Stamp "+article_id,
            background:"#008080",
            color:"#fff"
        };
        let queryString = insertNodeBefore(articleNode,"button",articleStampBtnAttribute);
        return queryString;
    }

    let createArticleResultDiv = function(articleNode){
        let articleURL = new URL(articleNode.href);
        let article_id = articleURL.searchParams.get("article_id");
        let articleStampBtnAttribute = {
            id:"result"+article_id,
            innerText:"Result: "
        };
        let queryString = insertNodeBefore(articleNode,"div",articleStampBtnAttribute);
        return queryString;
    }

    let createHarvestAllStampBtn = function(node){
        let harvestAllStampBtnAttribute = {
            id:"btnHarvestAllStamp",
            innerText:"Harvest All Stamp",
            background:"#FFD700",
            color:"#000",
            fontSize:"20px"
        };
        let queryString = insertNodeBefore(node,"button",harvestAllStampBtnAttribute);
        return queryString;
    }

    let createHarvestAllInfoDiv = function(node){
        let harvestAllInfoDivAttribute = {
            id:"divHarvestAllInfo",
            innerText:"Progress: ",
            fontSize:"20px"
        };
        let queryString = insertNodeBefore(node,"div",harvestAllInfoDivAttribute);
        return queryString;
    }

    let showArticleResult = function(queryString,resultString){
        let articleResultDiv = document.querySelector(queryString);
        articleResultDiv.innerText = "Result: "+resultString;
        return;
    }

    let getHtmlText = function(link){
        return new Promise(function(resolve,reject){
            $.ajax({
                type: "GET",
                dataType: "html",
                url: link,
                cache: false,
                success: function(result) {
                    //console.log(result);
                    resolve(result);
                }
            })
        });
    }

    let extractPageNum = function(doc){
        let pageNumNode = doc.querySelector("body > div.title_area > p.article_title > span");
        if(pageNumNode){
            return extractNumber(pageNumNode.innerText);
        } else {
            // default number
            return Math.floor(20+5*Math.random()); 
        }
    }

    let extractBypassedLink = function(doc){
        let bypassedLinkNode = doc.querySelector("body > ul.button_stamp > li > a");
        if(bypassedLinkNode){
            return bypassedLinkNode.href;
        } else {
            return "error";
        }
    }

    let bypassArticle = async function(articleLink){
        // input link, output link
        let articleURL = new URL(articleLink);
        let article_id = articleURL.searchParams.get("article_id");
        let media_id = articleURL.searchParams.get("media_id");
        let firstPage = domparser.parseFromString(await getHtmlText(articleLink), 'text/html');
        let pageNum = extractPageNum(firstPage);
        let lastPageLink = "/sp/article/index/mode/paging/page/"+pageNum+"/article_id/"+article_id;
        let lastPage = domparser.parseFromString(await getHtmlText(lastPageLink), 'text/html');
        let bypassedLink = extractBypassedLink(lastPage);
        // bypassed link example: https://www.trepy.jp/sp/article/page/?article_id=20005310&onetime=4ed858a6b10e246e32d9b4f6d52c8ae7
        let bypassedURL = new URL(bypassedLink);
        let onetime = bypassedURL.searchParams.get("onetime");
        let stampActionLink = "/sp/article/stamp-action/?media_id="+media_id+"&article_id="+article_id+"&onetime="+onetime;
        // stamp action link example: https://www.trepy.jp/sp/article/stamp-action/?media_id=30&article_id=20005306&onetime=3a920800b532de7030fbda3b9c48ac22
        return stampActionLink;
    }

    let imgSrcResult = function(node){
        if(node){
            let matchPoint = node.src.match(/comp_get_point.png/);
            let matchStamp = node.src.match(/comp_get_stamp.png/);
            if(matchPoint){
                return "Point";
            } else if(matchStamp){
                return "Stamp";
            } else {
                return "Error";
            }
        } else {
            return "Error";
        };
    }

    let stampAction = async function(stampActionLink){
        let stampActionPage = domparser.parseFromString(await getHtmlText(stampActionLink), 'text/html');
        let comp_getImg = stampActionPage.querySelector("body > div.content_stamp > div.content_inside > div.comp_get > img");
        let result = imgSrcResult(comp_getImg);
        return result;
    }

    let harvestOneStamp = async function(articleLink){
        let stampActionLink = await bypassArticle(articleLink);
        let stampActionRes = await stampAction(stampActionLink);
        return stampActionRes;
    }

    let harvestAllStamp = async function(articleNodelist,harvestAllInfoQuery){
        let stampCount = 0;
        let pointCount = 0;
        let errorCount = 0;
        let result = "";
        let harvestAllInfo = document.querySelector(harvestAllInfoQuery);
        for(let i = 0;i < articleNodelist.length; i++){
            result = await harvestOneStamp(articleNodelist[i].href);
            if(result == "Point"){
                pointCount++;
            } else if(result == "Stamp"){
                stampCount++;
            } else if(result == "Error"){
                errorCount++;
            }
            harvestAllInfo.innerText = "Progress:"+(i+1)+"/"+articleNodelist.length+" Point:"+pointCount+" Stamp:"+stampCount+" Error:"+errorCount;
        }
        return;
    }

    let articleNodelist = document.querySelectorAll("#pon_article_area > div.pon_article_inner > a");
    if(articleNodelist.length > 0){
        // articleNodelist.forEach(function(node,index,arr){
        //     let stampBtnQuery = createArticleStampBtn(node); //"#stampbtn"+article_id
        //     let articleResultDivQuery = createArticleResultDiv(node); //"#result"+article_id
        //     let stampBtn = document.querySelector(stampBtnQuery);
        //     stampBtn.onclick = async function(){
        //         let result = await harvestOneStamp(node.href);
        //         showArticleResult(articleResultDivQuery,result);
        //     }
        // });
    
        let pon_article_area = document.querySelector("#pon_article_area");
        let harvestAllStampBtnQuery = createHarvestAllStampBtn(pon_article_area);
        let harvestAllInfoQuery = createHarvestAllInfoDiv(pon_article_area);
        document.querySelector(harvestAllInfoQuery).innerText = `Progress: 0/${articleNodelist.length}` // show news amount in this page
        let harvestAllStampBtn = document.querySelector(harvestAllStampBtnQuery);
        harvestAllStampBtn.onclick = async function(){
            await harvestAllStamp(articleNodelist,harvestAllInfoQuery);
        }
    }
})();