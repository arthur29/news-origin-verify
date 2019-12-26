class FillPopupInfo {
    static validate(news_metadata) {
        if(news_metadata["newsOriginUrl"] != undefined ||
            (news_metadata["newsRecordId"] != undefined &&
                news_metadata["newsOriginBasePath"] != undefined)
        ){
            return true;
        }
        return false;
    }

    static fetch(news_metadata, sender){
        if (news_metadata["newsOriginUrl"] != null) {
            news_metadata = this.parse_url(news_metadata)
        }
        news_metadata = this.ensure_no_slash_on_end(news_metadata)
        this.validate_origin_base_path(news_metadata, sender);
    }

    static ensure_no_slash_on_end(news_metadata){
        if(typeof(news_metadata["newsOriginUrl"]) == "string" && news_metadata["newsOriginUrl"].substr(-1) == '/'){
            news_metadata["newsOriginUrl"] = news_metadata["newsOriginUrl"].slice(0,-1)
        }

        if(typeof(news_metadata["newsOriginBasePath"]) == "string" && news_metadata["newsOriginBasePath"].substr(-1) == '/'){
            news_metadata["newsOriginBasePath"] = news_metadata["newsOriginBasePath"].slice(0,-1)
        }
        return news_metadata
    }

    static parse_url(news_metadata) {
        let url = news_metadata["newsOriginUrl"].split("/")
        news_metadata["newsRecordId"] = url.pop()
        news_metadata["newsOriginBasePath"] = url.join("/")
        return news_metadata
    }

    static validate_origin_base_path(news_metadata, sender){
        $.getJSON(chrome.runtime.getURL("servers.json")).done(function(servers){
            for(let server_name in servers){

                let origin_base_path = news_metadata["newsOriginBasePath"]
                let server = servers[server_name]
                if(origin_base_path == server["url"].concat(server["path"])){
                    if(new Date(server["expiration_date"]) > new Date()){
                        FillPopupInfo.request_news_info(news_metadata, sender)
                        return
                    }else{
                        putAlertInfo("Server certificate registration is expired", sender)
                        showPageAction(sender)
                        return
                    }
                }
            }
            putErrorInfo("The registered server was not found on trusted server list", sender)
            showPageAction(sender)
        })
    }

    static request_news_info(news_metadata, sender){
        $.ajax({
            url: [news_metadata["newsOriginBasePath"], news_metadata["newsRecordId"]].join("/"),
            method: "GET",
            statusCode: {
                204: function(){
                        putAlertInfo("The source is trust, but the news is not recorded on it", sender);
                        showPageAction(sender)
                },
                200: function(news_info){
                    putSuccessInfo(news_info, sender)
                    showPageAction(sender)
                }
            }
        });
    }
}
