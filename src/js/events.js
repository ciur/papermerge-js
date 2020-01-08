export class DgEvents {

    constructor() {
        this._events = {};
    }

    subscribe(name, handler, context) {
      let event = {handler, context};

      if (this._events[name]) {
        this._events[name].push(event);
      } else {
        this._events[name] = [event];
      }
    }
    // ...args = Rest parameters syntax
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters
    notify(event_name, ...args) {
      let events = this._events[event_name];

      if (events) {
        for (let event of events) {
          event.handler.apply(event.context, args);
        }
      }
    }
}