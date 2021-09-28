import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { eventDispatcher } from '../store';
import { ActionTypes } from '../store/rfkode.actions';

import { AuthService } from '@auth0/auth0-angular';


@Component({
  selector: 'app-auth-button',
  templateUrl: './auth-button.component.html',
  styleUrls: ['./auth-button.component.css']
})
export class AuthButtonComponent implements OnInit{


  constructor(@Inject(DOCUMENT) public document: Document, public auth: AuthService) {}
  
    ngOnInit() {
      this.auth.getAccessTokenSilently().subscribe(
        (token) => {
          console.dir(token)
          eventDispatcher.next({type: ActionTypes.USER_LOGGED_IN, payload: token})
        }
      )
  }

  

}
