const { SerialPort } = require('serialport');

var awty = require('awty');

var Connection = function (options) {
  this.options = options;
  this.debug = this.options.debug;

  this.board = this.options.board;
};

Connection.prototype._init = function (callback) {
  var _this = this;

  // check for port
  if (!_this.options.port) {
    // no port, auto sniff for the correct one
    _this._sniffPort(function (error, port) {
      if (error) {
        var error = new Error('an unexpected error happened when connecting to board: ' + error.toString());
        return callback(error);
      }
      if (port && port.length) {
        // found a port, save it
        _this.options.port = port[0].path;

        _this.debug('found ' + _this.options.board.name + ' on port ' + _this.options.port);

        // set up serialport for it
        _this._setUpSerial(function (error) {
          return callback(error);
        });
      } else {
        // we didn't find the board
        return callback(new Error('no Arduino ' + '\'' + _this.options.board.name + '\'' + ' found.'));
      }
    });
  } else {
    // when a port is manually specified
    _this._setUpSerial(function (error) {
      return callback(error);
    });
  }
};

/**
 * Create new serialport instance for the Arduino board, but do not immediately connect.
 */
Connection.prototype._setUpSerial = function (callback) {
  this.serialPort = new SerialPort({
    path: this.options.port,
    baudRate: this.board.baud,
    autoOpen: false
  });
  return callback(null);
};

/**
 * Finds a list of available USB ports, and matches for the right pid
 * Auto finds the correct port for the chosen Arduino
 *
 * @param {function} callback - function to run upon completion/error
 */
Connection.prototype._sniffPort = function () {
  var _this = this;
  var pidList = _this.board.productId.map(function (id) {
    return parseInt(id, 16);
  });

  return _this._listPorts().then(function (ports) {
    // filter for a match by product id
    return ports.filter(function (p) {
      return pidList.indexOf(parseInt(p._standardPid, 16)) !== -1;
    });
  });
};

/**
 * Sets the DTR/RTS lines to either true or false
 *
 * @param {boolean} bool - value to set DTR and RTS to
 * @param {number} timeout - number in milliseconds to delay after
 * @param {function} callback - function to run upon completion/error
 */
Connection.prototype._setDTR = function (bool, timeout, callback) {
  var _this = this;
  var props = {
    rts: bool,
    dtr: bool
  };

  _this.serialPort.set(props, function (error) {
    if (error) {
      return callback(error);
    }

    setTimeout(function () {
      callback(error);
    }, timeout);
  });
};

/**
 * Checks the list of ports 4 times for a device to show up
 *
 * @param {function} callback - function to run upon completion/error
 */
Connection.prototype._pollForPort = function () {
  var _this = this;

  var poll = awty(function (next) {
    // try to sniff port instead (for port hopping devices)
    _this._sniffPort().then(function (ports) {
      var found = false;
      if (ports.length) {
        // found a port, save it
        _this.options.port = ports[0].path;
        found = true;
      }
      next(found);
    }).catch(function (error) {
      next(false);
      console.error('Error in _sniffPort:', error);
    });
  });

  poll.every(100).ask(15);

  return new Promise(function (resolve, reject) {
    poll(function (foundPort) {
      if (foundPort) {
        _this.debug('found port on', _this.options.port);
        // set up serialport for it
        _this._setUpSerial(function (error) {
          if (error) reject(error);
          else resolve();
        });
      } else {
        // we also could not find the device on auto sniff
        reject(new Error('could not reconnect after resetting board.'));
      }
    });
  });
};

Connection.prototype._pollForOpen = function (callback) {
  var _this = this;

  var poll = awty(function (next) {
    _this.serialPort.open(function (error) {
      // Patch for port/PID changing error ///////////////////////////////////
      if (error) {
        Serialport.list().then(ports => {
          console.log('Looking for new port...');
          for (var curPort of ports) {
            // Iterate through all available ports.
            console.log(
              'Device at:', curPort.path,
              'has PID:', curPort.productId
            );
            for (var curTargetPID of _this.board.productId) {
              // Iterate through all possible PIDs of the target board object.
              let curTargetPID4 = String(curTargetPID.slice(2, 6));
              // Convert 6-character hexidecimal into 4 character hex string.
              let curPortPID = String(curPort.productId).toLowerCase();
              // Force hex string case matching (needed for some OS)
              // console.log('Comparing with PID:', curTargetPID4);
              if (curPortPID === curTargetPID4) {
                // Does PID at the current port match the PID of the target board?
                console.log(
                  'Found device:', _this.board.name,
                  'at port:', curPort.path,
                  'which currently has productID:', curPort.productId
                );
                _this.options.port = curPort.path;
                // Use the current port.
                break;
              }
            }
          }
          _this.serialPort = new Serialport(_this.options.port, {
            baudRate: _this.board.baud,
            autoOpen: false
          });
        });
      }
      // End of patch ////////////////////////////////////////////////////////
      next(!error);
    });
  });

  poll.every(200).ask(10);

  poll(function (isOpen) {
    var error;
    if (!isOpen) {
      error = new Error('could not open board on ' + _this.serialPort.path);
    }

    callback(error);
  });
};

/**
 * Return a list of devices on serial ports. In addition to the output provided
 * by SerialPort.list, it adds a platform independent PID in _pid
 *
 * @param {function} callback - function to run upon completion/error
 */
Connection.prototype._listPorts = function () {
  return SerialPort.list().then(function (ports) {
    return ports.map(function (port) {
      var pid;

      if (port.productId) {
        pid = port.productId;
      } else if (port.pnpId) {
        try {
          pid = '0x' + /PID_\d*/.exec(port.pnpId)[0].substr(4);
        } catch (err) {
          pid = '';
        }
      } else {
        pid = '';
      }

      port._standardPid = pid;
      return port;
    });
  });
};

module.exports = Connection;
