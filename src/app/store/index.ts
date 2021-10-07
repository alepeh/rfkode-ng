import { Subject } from "rxjs";
import { ActionTypes } from "./rfkode.actions";

interface InitialState {
    token: string,
    syncState: SyncState
}

let state: InitialState = {
    token: '',
    syncState: {
        loading: false,
        error: ''
    }
}

interface Event {
    type: String;
    payload?: Object;
}

interface SyncState {
    loading: boolean,
    error: string
}

export const store = new Subject<InitialState>();
export const eventDispatcher = new Subject<Event>();

eventDispatcher.subscribe((data: Event) => {
    switch (data.type) {
        case ActionTypes.USER_LOGGED_IN:
            state = {
                ...state,
                token: data.payload as string
            }
            store.next(state);
            break;
        case ActionTypes.SYNC_STATE_CHANGED:
            state = {
                ...state,
                syncState: data.payload as SyncState
            }
            store.next(state);
            break;
    }
});