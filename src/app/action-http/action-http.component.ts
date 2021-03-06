import { Component, Input, OnInit } from '@angular/core';
import {evaluate} from '../helpers/formula';



@Component({
  selector: 'app-action-http',
  templateUrl: './action-http.component.html',
  styleUrls: ['./action-http.component.css']
})
export class ActionHttpComponent implements OnInit {

  @Input() config : any;
  @Input() data : any;
  responseStatus : string = 'NONE';

  constructor() { }

  ngOnInit(): void {
  }

  submit(){
    this.evaluateOutputBucketName();
    this.responseStatus = 'LOADING';
    fetch(this.config.config.url, {
        method: this.config.config.method,
        mode: "cors",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({payload: this.data, metadata: this.config.metadata})
    }).then((response) => {
        console.log(response);
        this.responseStatus = 'SUCCESS';
    }).catch((err) => {
        console.error(err);
        this.responseStatus = 'ERROR';
    })
}

  evaluateOutputBucketName() {
    //TODO this is only usable for the metadata.output.key property atm.
    if(this.config && this.config.metadata && this.config.metadata.output){
      let key = this.config.metadata.output['key'];
      let replacedKey = evaluate(key, this.data);
      console.log(replacedKey);
      this.config.metadata.output['key'] = replacedKey;
    }
  }

}
