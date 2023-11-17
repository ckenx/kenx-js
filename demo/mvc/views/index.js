"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function () {
    console.log('View Index');
    return {
        index: function (scope) {
            return "<html>\n                <head>\n                  <title>Hello Socket</title>\n                  <script src=\"/socket.io/socket.io.js\" type=\"text/javascript\"></script>\n                  <script type=\"text/javascript\">\n                    const socket = io()\n                    socket.on('connect', () => console.log('Socket Connected: ', socket.id ) )\n                  </script>\n                </head>\n                <body>\n                  <h1>Hello world!</h1>\n                </body>\n              </html>";
        }
    };
});
