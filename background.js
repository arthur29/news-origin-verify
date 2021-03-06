'use strict';

chrome.runtime.onInstalled.addListener(function() {
});
var data = null;

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse){
        if(message == "from_popup"){
            sendResponse(data);
        }else if(message.constructor == Object && message["popup_data"]){ // Message comming from content_script
            sendResponse();
            data = message["popup_data"];
            fillNewsPopup(data,sender)
        }
    }
);

function fillNewsPopup(news_metadata, sender){
    if (!FillMetadataInfoScript.validate(news_metadata)){
        console.log("Error: some news metadata is missing")
        return;
    }
    FillMetadataInfoScript.fetch(news_metadata, sender);
}

function putErrorInfo(error_message, sender){
    data = {
        msg: "news_error",
        data: error_message
    }
    chrome.pageAction.setIcon({
        tabId: sender.tab.id,
        path : "images/error-icon-4.png"
    })
}

function putSuccessInfo(news_info, sender){
    data = {
        msg: "news_success",
        data: news_info
    }
    chrome.pageAction.setIcon({
        tabId: sender.tab.id,
        path : "images/successful-icon-10.png"
    })
}

function showPageAction(sender){
    chrome.pageAction.show(sender.tab.id);
}

