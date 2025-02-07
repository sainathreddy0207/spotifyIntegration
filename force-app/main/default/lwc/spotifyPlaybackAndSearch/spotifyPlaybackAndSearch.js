import { LightningElement,track,wire,api } from 'lwc';
import SpotifySearch from '@salesforce/apex/SpotifyIntegration.searchInSpotify';
import playSpotifySong from '@salesforce/apex/SpotifyIntegration.playSong';
import {publish, MessageContext} from "lightning/messageService";
import ALBUMID_SELECTED from '@salesforce/messageChannel/albumId__c';


export default class SpotifyPlaybackAndSearch extends LightningElement {

    songName;
    displayResult = false;
    @track trackData = {}
    trackUrls = ''
    

    @wire(MessageContext)
    messageContext

    

    
    
    changeHandler(event){
        this.songName = event.target.value;
        console.log('SongNAme', this.songName);
    }

    handleKeyDown(event) {
       
        if (event.key === 'Enter') {  
            
            this.searchSong();
        }
    }
     searchSong(){          
          
            SpotifySearch({ songName: this.songName })
                .then(result => {
                    let response = result;
                    this.displayResult = true;
                    this.trackData = response.tracks.items.map(track =>{
                        console.log('Track ', track);
                        let albumImage = track.album.images[0] ? track.album.images[0].url : null;
                        let aritstName = track.artists.map(artist => artist.name).join(", ");
                        

                        return {
                            ...track, image:albumImage, artistNames : aritstName
                        }
                    });
                    console.log('track data', this.trackData);
                    
                    
                })
                .catch(error => {
                    console.error('Error in response', error);
                });
    }

    
    
    playSelectedSong(event){
        const trackUri = event.target.dataset.id;
        console.log('Testing the button',trackUri);
        playSpotifySong({songUri: trackUri}).then(result=>{
            console.log('Testing the result',result);
            

        }).catch(error=>{
            console.error('Error in response', error);
        })
        

    }
    

    handleAlbumClick(event){
        let selectedalbumId = event.target.dataset.id;
        const albumIdValue = {albumId : selectedalbumId};
        console.log('albumID value', selectedalbumId);
        console.log('albumID object', JSON.stringify(albumIdValue))
        publish(this.messageContext, ALBUMID_SELECTED, albumIdValue);
    }

    

    
}