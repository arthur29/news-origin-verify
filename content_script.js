$(window).on('focus', function(){
    send_popup_news_info();
});

$(document).ready(function(){
    document.body.innerHTML += modal
    var timer;
    $('[data-type="news"]').mouseenter(function(){
        current_object = $(this)
        timer = setTimeout(function(){
            let news_metadata = getNewsMetadataFromGlobalAttributeData(current_object)
            fillNewsModal(news_metadata)
            positionModal(current_object)
        }, 1000);
    }).mouseleave(function(){
        clearTimeout(timer);
        if(is_modal_visible()) {
            timer = setTimeout(function(){
                hideModal()
            }, 300);
        }
    });
    $('#news-block').mouseenter(function(){
        clearTimeout(timer);
    }).mouseleave(function(){
        clearTimeout(timer);
        timer = setTimeout(function(){
            hideModal()
        }, 300);
    });
    send_popup_news_info();
});

function send_popup_news_info(){
    let news_metadata = getNewsMetadataFromMetaTag()
    chrome.runtime.sendMessage({"popup_data": news_metadata}, function(response) {})
}

function getNewsMetadataFromMetaTag(){
    let news_info = {}
    news_info["newsOriginUrl"] = $("meta[name=news-origin-url]").attr("content")
    news_info["newsOriginBasePath"] = $("meta[name=news-origin-base-path]").attr("content")
    news_info["newsRecordId"] = $("meta[name=news-record-id]").attr("content")
    return news_info;
}

function getNewsMetadataFromGlobalAttributeData(current_object){
    let news_info = {}
    news_info["newsOriginUrl"] = current_object.data("newsOriginUrl")
    news_info["newsOriginBasePath"] = current_object.data("newsOriginBasePath")
    news_info["newsRecordId"] = current_object.data("newsRecordId")
    return news_info
}

function fillNewsModal(news_metadata){
    if (!FillMetadataInfoScript.validate(news_metadata)){
        console.log("Error: some news metadata is missing")
        return;
    }
    FillMetadataInfoScript.fetch(news_metadata);
}

function putErrorInfo(error){
    $("#news-block").html(modalWithoutNews(error));
}

function putSuccessInfo(news_info){
    $("#news-block").html(modalWithNews(news_info));
}
function is_modal_visible(){
    if($("#news-block").css("display") == "block"){
        return true;
    }else{
        return false;
    }
}

function hideModal(){
    $("#news-block").css("display","none")
}

function showModal(){
    $("#news-block").css("display","block")
}

function positionModal(current_object){
    $("#news-block").css("left", leftPosition(current_object))
    $("#news-block").css("top", topPosition(current_object))

}

function leftPosition(element){
    right = element.offset().left + 350
    if (right > $(document).width()){
        return element.offset().left - 345
    }else{
        return element.offset().left - 5
    }
}

function topPosition(element){
    top = element.offset().top - 155
    if (top < 0){
        return element.offset().top + element.height() + 5
    }else{
        return element.offset().top - 155
    }
}

let modal = "\
    <div style='display: none; border: 1px solid; border-color: #AAAAAA; border-radius: 3px; background-color: white;  overflow-y:auto; width: 350px; height: 150px; position: absolute; top: 100px' tabindex=-1 id='news-block'>\
    </div>\
";

function modalWithNews(news_info) {
    return "\
        <a href='"+ news_info["url"] + "' id='news-url'>\
            <h4 id='news-title' style='margin-bottom: 5px; font-weight: bold;'>"+ news_info["title"] + "</h4> \
            <h6 id='news-subtitle' style='margin-bottom: 2px'>"+ news_info["subtitle"] + "</h6> \
            <h6>- <span id='news-author' style='font-size: 10px' >"+ news_info["author"] + "</span> - <span id='news-released-date-time' style='font-size: 10px' >"+ new Date(news_info["publication_date"]).toLocaleString("pt-BR") + "</span></h6>\
            \
            <h6 id='news-publisher'>"+ news_info["publisher"] + "</h6>\
        </a>\
    ";
}

function modalWithoutNews(error){
    return "\
    <h5> This new is not recorded in one trusted source, pay attention at your content </h5>\
    <h6>Error: "+error+"</h6>\
";
}
