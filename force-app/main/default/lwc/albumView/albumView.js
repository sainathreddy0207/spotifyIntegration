import { LightningElement , wire} from 'lwc';
import {publish,subscribe, MessageContext} from 'lightning/messageService';
import ALBUMID_SELECTED from '@salesforce/messageChannel/albumId__c';
import albumData from '@salesforce/apex/SpotifyIntegration.getAlbumData';
import playSpotifySong from '@salesforce/apex/SpotifyIntegration.playSong';
export default class AlbumView extends LightningElement {
    albumSubscription;
    selectedalbumId;
    albumSongsData=[];
    albumCover;
    @wire(MessageContext)
    messageContext
    
    connectedCallback(){
        this.subscribeToLMS();
    }

    subscribeToLMS(){
        console.log('Testing it');
        this.albumSubscription = subscribe(this.messageContext, ALBUMID_SELECTED, (message)=>this.handleMessage(message));
    }

    handleMessage(message){
        this.selectedalbumId = message.albumId;
        
        
    }

    

    @wire(albumData,{albumId:'$selectedalbumId' })
    albumhandler({data,error}){
        if(data){
            let tracksData = data.tracks.items;
            console.log('Data recieved from the ',tracksData);
            this.albumCover = data.images[0].url;
            this.albumSongsData = tracksData.map(item=>{
                let artistNames = item.artists.map(artist => artist.name).join(", ");
                return{...item, artist: artistNames}
            })
            console.log('Data recieved from the after ',this.albumSongsData);
           
            console.log(data.images);
        }else{
            console.log(error);
        }

    }

    playSelectedSong(event){
        console.log('Testing the button',event.target);
            const trackUri = event.target.dataset.id;
            console.log('Testing the button',trackUri);
            playSpotifySong({songUri: trackUri}).then(result=>{
                console.log('Testing the result',result);
    
            }).catch(error=>{
                console.error('Error in response', error);
            })
            
    
    }


}