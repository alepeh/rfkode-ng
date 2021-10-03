import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { store } from '../store';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-rfk-nav',
  templateUrl: './rfk-nav.component.html',
  styleUrls: ['./rfk-nav.component.css']
})
export class RfkNavComponent {

  token: String = '';
  schemas: any[] = [];

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, private database : DatabaseService) {
    store.subscribe((state) => {
      const {token} = state;
      this.token = token;
    })
    database.allSchemas().then(schemaDocs => {
      schemaDocs.rows.map(schemaDoc => {
        this.schemas.push(schemaDoc.doc as any);
      })
    })
  }

}
