
chrome.runtime.sendMessage("from_popup", function(response) {
    if(response == null){
        console.log("TENTE OUTRA VEZ")
    }else if(response["msg"] == "news_error"){
        $("#news-block").html(modalWithoutNews(response["data"]));
    }else{
        $("#news-block").html(modalWithNews(response["data"]));
    }
});

function putErrorInfo(error_message){
    data = {
        msg: "news_error",
        data: error_message
    }
}

function putSuccessInfo(news_info){
    data = {
        msg: "news_success",
        data: news_info
    }
}

function modalWithNews(news_info) {
    return "\
        <a href='"+ news_info["url"] + "' id='news-url' target='_blank'>\
            <h1 id='news-title' style='margin-bottom: 5px; font-weight: bold;'>"+ news_info["title"] + "</h1> \
            <h3 id='news-subtitle' style='margin-bottom: 2px'>"+ news_info["subtitle"] + "</h3> \
            <h3>- <span id='news-author' style='font-size: 10px' >"+ news_info["author"] + "</span> - <span id='news-released-date-time' style='font-size: 10px' >"+ new Date(news_info["publication_date"]).toLocaleString("pt-BR") + "</span></h3>\
            \
            <h3 id='news-publisher'>"+ news_info["publisher"] + "</h3>\
        </a>\
    ";
}

function modalWithoutNews(error){
    return "\
    <h2> This new is not recorded in one trusted source, pay attention at your content </h2>\
    <h3>Error: "+error+"</h3>\
";
}
