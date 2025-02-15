public class SpotifyIntegration {

  
    private static Map<String, Object> makeHttpRequest(String endpoint, String setMethod, String requestBody) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setMethod(setMethod);
        request.setEndpoint('callout:Spotify' + endpoint);
        if (setMethod == 'PUT' && requestBody != null) {
            request.setHeader('Content-Type', 'application/json');  
            request.setBody(requestBody);
        }
        
        
        try {
            system.debug('Request'+ request);
            HttpResponse response = http.send(request);
            System.debug('Response Status: ' + response.getStatusCode());
            System.debug('Response Body: ' + response.getBody());
            
            if (response.getStatusCode() == 200) {
                return (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            } else if(response.getStatusCode() == 204){
                return new Map<String, Object>{'Sucess' => 'Song is now Streaming in spotify ' + response.getStatusCode()};
            }
            else {
                return new Map<String, Object>{'error' => 'Request failed with status code ' + response.getStatusCode()};
            }
        } catch (Exception ex) {
            System.debug('Error: ' + ex.getMessage());
            return new Map<String, Object>{'error' => ex.getMessage()};
        }
    }
    
   
    @AuraEnabled(cacheable = true)
    public static Map<String, Object> searchInSpotify(String songName) {
        
            String encodedSongName = EncodingUtil.urlEncode(songName, 'UTF-8');
            String endpoint = '/v1/search?q=' + encodedSongName + '&type=track&market=IN&offset=1';
            return makeHttpRequest(endpoint, 'GET', '');
        
    }

   
    @AuraEnabled
    public static Map<String, Object> callSpotifyRecentlyPlayed() {
        String endpoint = '/v1/me/player/recently-played?limit=4&before=' + getTimeBefore60seconds();
        return makeHttpRequest(endpoint,'GET','');
    }

   
    @AuraEnabled
    public static Map<String, Object> getCurrentPlayingSong() {
        String endpoint = '/v1/me/player/currently-playing?market=IN';
        return makeHttpRequest(endpoint,'GET','');
    }
    
    @AuraEnabled(cacheable = true)
    public static Map<String, Object> getDeviceData() {
        String endpoint = '/v1/me/player/devices';
        return makeHttpRequest(endpoint,'GET','');
    }
    
    @AuraEnabled(cacheable = true)
    public static Map<String, Object> changeVolume(Integer volume) {
        String endpoint = '/v1/me/player/volume?volume_percent='+ volume;
        return makeHttpRequest(endpoint,'PUT','');
    }
    
    @AuraEnabled(cacheable = true)
    public static Map<String, Object> getRecommendations() {
        String endpoint = '/v1/recommendations?seed_artists=4NHQUGzhtTLFvgF5SZesLK&seed_genres=classical%2Ccountry&seed_tracks=0c6xIDDpzE81m2q797ordA';
        return makeHttpRequest(endpoint,'GET','');
    }
    
    @AuraEnabled(cacheable = true)
    public static Map<String, Object> playSong(String songUri) {
        Map<String,Object> devicesResponse = getDeviceData();
        List<Object> devices = (List<Object>) devicesResponse.get('devices');
        if(devices?.size()>0){
            String deviceId = (String) ((Map<String,Object>) devices[0]).get('id');
            String endpoint = '/v1/me/player/play?device_id='+deviceId;
            Map<String,Object> body = new Map<String,Object>();
            body.put('uris', new List<String>{songUri});
            String requestBody = JSON.serialize(body);
            System.debug('Body before send'+ requestBody);
       		return makeHttpRequest(endpoint,'PUT',requestBody);
        }else {
            return new Map<String, Object>{'error' => 'No Devices are there'};
        }
        
        
        
    }
    
    @AuraEnabled(cacheable = true)
    public static Map<String, Object> getAlbumData(String albumId){
        if(albumId != null){
            String endpoint = '/v1/albums/'+albumID;
            return makeHttpRequest(endpoint,'GET','');
        }else{
            return new Map<String, Object>{'error' => 'No Album Is are there'};
        }
    }
    
    

    
    public static String getTimeBefore60seconds() {
        DateTime now = System.now();
        Long currentTimestamp = now.getTime();
        Long timeBefore60Seconds = currentTimestamp - (60 * 1000); // 60 seconds
        return String.valueOf(timeBefore60Seconds);
    }
}