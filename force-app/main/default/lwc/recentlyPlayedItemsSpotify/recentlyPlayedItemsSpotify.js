import { LightningElement, track,wire } from 'lwc';
import recentlyPlayedSong from '@salesforce/apex/SpotifyIntegration.callSpotifyRecentlyPlayed';
import changeVolume from '@salesforce/apex/SpotifyIntegration.changeVolume';
import playSpotifySong from '@salesforce/apex/SpotifyIntegration.playSong';
import currentPlayingSong from '@salesforce/apex/SpotifyIntegration.getCurrentPlayingSong';
import logo from '@salesforce/resourceUrl/spotifyLogo';
import {publish, MessageContext} from "lightning/messageService";
import SEARCHED_TRACK from '@salesforce/messageChannel/searchedSong__c';

export default class RecentlyPlayedItemsSpotify extends LightningElement {

    @wire(MessageContext)
    messageContext

    spotifyLogo = logo;
    recentSongName = [];
    @track currentPlayingSong ;

    connectedCallback() {
        const logo ='https://cdn.pixabay.com/photo/2016/10/22/00/15/spotify-1759471_1280.jpg';
        
        this.recentlyPlayedSongs();
        this.currentlyPlayingSong();     

        setInterval(()=>{
            this.currentlyPlayingSong();
        },6000);

    }
    changeHandler(event){
        this.songName = event.target.value;
    }

    handleKeyDown(event) {     
        if (event.key === 'Enter') {   
            const searchedtrack = {songName:this.songName };
            publish(this.messageContext, SEARCHED_TRACK, searchedtrack);       
            
        }
    }


    recentlyPlayedSongs() {
        recentlyPlayedSong().then(result => {
            console.log('result of the brfore recent', result.items);
            let response = result;
            let tempdata = response.items.map(item => {
                console.log('testing the image', item.track.album.images[0].url);
                let albumImage = item.track.album.images[0].url;
                let aritstName = item.track.artists.map(artist => artist.name).join(", ");
                console.log('testing the image', albumImage);
                console.log('Artist Name', aritstName);
                console.log('item', item.track);
                return {
                    ...item.track, songimage: albumImage, songartistNames: aritstName
                }
            });
            this.recentSongName = tempdata;





            console.log('result of the recent', tempdata);

        }).catch(error => {
            console.error('Error in response', error);
        });
    }

    playSelectedSong(event) {
        const trackUri = event.target.dataset.id;

        playSpotifySong({ songUri: trackUri }).then(result => {
          

        }).catch(error => {
            console.error('Error in response', error);
        })


    }


    currentlyPlayingSong() {
        currentPlayingSong().then(result => {
            console.log('result checking ', result);
            let song = result.item.album;
            let aritstName = song.artists.map(artist => artist.name).join(", ");
            console.log('Artist Name', aritstName);
            console.log('Song name', song);
            this.currentPlayingSong = {};
            this.currentPlayingSong = {...song,image : song.images[0].url,
                songartistNames : aritstName}
            

            console.log('result of the current recent', JSON.stringify(this.currentPlayingSong));
            

        }).catch(error => {
            console.error('Error in response', error);
        });

    }
    handlevolume(event) {
        let lwcVolume = Number(event.detail.value);
        setTimeout(() => {
            changeVolume({ volume: lwcVolume }).then(result => {
                console.log('Testing the volume result', result);
            }
            ).catch(error => {
                console.error('Error in response', error);
            })
        }, 3000)
    }
}