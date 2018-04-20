import { ipcRenderer } from 'electron';
import { Socket } from 'electron-ipc-socket';
import pify from 'pify';

const socket = Socket('api', ipcRenderer);

socket.open();
socket.send('ready');

export default {
  methods: {
    async remote(method, payload = null) {
      const raw = await pify(socket.send.bind(socket))(
        method,
        JSON.stringify(payload)
      );

      const { error, data } = JSON.parse(raw);

      if (error) {
        throw new Error(error);
      }
      
      return data;
    },
    async notifyLoaded(name) {
      return this.remote('component', name);
    },
  },
};
