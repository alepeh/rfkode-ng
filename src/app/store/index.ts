import { Subject } from "rxjs";
import { ActionTypes } from "./rfkode.actions";

interface InitialState {
    token: String
}

let state: InitialState = {
    token: '',
}

interface Event {
    type: String;
    payload?: Object;
}

export const store = new Subject<InitialState>();
export const eventDispatcher = new Subject<Event>();

eventDispatcher.subscribe((data: Event) => {
    switch (data.type) {
        case ActionTypes.USER_LOGGED_IN:
            state = {
                token: data.payload as String
            }
            store.next(state);
            break;
    }
});