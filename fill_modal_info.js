class FillModalInfo {
    static validate(news_metadata) {
        if(news_metadata["newsOriginUrl"] != undefined ||
            (news_metadata["newsRecordId"] != undefined &&
                news_metadata["newsOriginBasePath"] != undefined)
        ){
            return true;
        }
        return false;
    }

    static fetch(news_metadata){
        if (news_metadata["newsOriginUrl"] != null) {
            news_metadata = this.parse_url(news_metadata)
        }
        this.validate_origin_base_path(news_metadata);
    }

    static parse_url(news_metadata) {
        let url = news_metadata["newsOriginUrl"].split("/")
        news_metadata["newsRecordId"] = url.pop()
        news_metadata["newsOriginBasePath"] = url.join("/")
        return news_metadata
    }

    static validate_origin_base_path(news_metadata){
        $.getJSON(chrome.runtime.getURL("servers.json")).done(function(servers){
            for(var server_name in servers){
                let origin_base_path = news_metadata["newsOriginBasePath"]
                let server = servers[server_name]
                if(origin_base_path == server["url"].concat(server["path"])){
                    if(new Date(server["expiration_date"]) > new Date()){
                        FillModalInfo.request_news_info(news_metadata)
                        return
                    }else{
                        putErrorInfo("Server certificate registration is expired")
                        showModal()
                        return
                    }
                }
            }
            putErrorInfo("The registered server was not found on trusted server list")
            showModal()
        })
    }

    static async request_news_info(news_metadata){
        $.ajax({
            url: [news_metadata["newsOriginBasePath"], news_metadata["newsRecordId"]].join("/"),
            method: "GET",
            statusCode: {
                204: function(){
                        putErrorInfo("The source is trust, but the news is not recorded on it");
                        showModal()
                },
                200: function(news_info){
                    putSuccessInfo(news_info)
                    showModal()
                }
            }
        });
    }
}
