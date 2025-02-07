import { LightningElement } from 'lwc';
import noHeader from '@salesforce/resourceUrl/HeaderHide';
import {loadStyle} from "lightning/platformResourceLoader";

export default class ParentSpotifyLWC extends LightningElement {
    connectedCallback() {
        loadStyle(this, noHeader)
            .then(result => {});
    }
}