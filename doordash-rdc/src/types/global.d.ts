import type Pusher from 'pusher-js';

declare global {
  // eslint-disable-next-line no-var
  var Pusher: typeof Pusher;
}

export {};
