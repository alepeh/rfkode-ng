import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../database.service';
import { store } from '../store';

@Component({
  selector: 'app-sync-detail',
  templateUrl: './sync-detail.component.html',
  styleUrls: ['./sync-detail.component.css']
})
export class SyncDetailComponent implements OnInit {

  title = 'hello-world';
  loading = false;

  constructor(private database : DatabaseService) {
    store.subscribe((state) => {
      const {syncState} = state;
      this.loading = syncState.loading;
    })
   }

  ngOnInit(): void {
  }

}
