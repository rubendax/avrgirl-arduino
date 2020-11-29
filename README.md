# Fork of [avrgirl-arduino](https://github.com/noopkat/avrgirl-arduino)

#### Forked for a specific custom hardware device - May not work with standard arduino boards. 
#### Please use master branch of [avrgirl-arduino](https://github.com/noopkat/avrgirl-arduino) for latest features and best compatibility.

## What is this?

A NodeJS library for flashing compiled sketch files to Arduino microcontroller boards.

## Changes on this branch
##### Fix for port/PID changing error in ```./lib/connection.js```  
For ATMega**32u4** devices (onboard USB emulation) when connected as USD-HID or USB-MIDI device:
The port name and/or ProductID can *sometimes* change during flashing. This patch attempts to fix the error, which would otherwise occur, by waiting for a new port that shows a **ProductID** which matches that of the target board.

Starting at line 144 in ```./lib/connection.js```:
```javascript
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
              console.log('Comparing with PID:', curTargetPID4);
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
```

## Acknowledgements

**avrgirl-arduino author: [Suz Hinton](https://github.com/noopkat/)**

Credit for a lot of the heavy lifting going on underneath in this library to:
- [Jacob Rosenthal](https://github.com/jacobrosenthal)
- [Ryan Day](https://github.com/soldair)
- [Elijah Insua](https://github.com/tmpvar)

## Contributors

+ [Arek Sredzki](https://github.com/ArekSredzki)
+ [Pawel Szymczykowski](https://github.com/makenai)
+ [Andrew 'AJ' Fisher](https://github.com/ajfisher)
+ [Derek Wheelden](https://github.com/frxnz)
+ [Byron Hulcher](https://github.com/byronhulcher)
+ [Luis Montes](https://github.com/monteslu)
+ [Ryan Braganza](https://github.com/ryanbraganza)
+ [Alvaro Sanchez](https://github.com/alvarosBQ)
+ [Francis Gulotta](https://github.com/reconbot)
+ [Tom Calvo](https://github.com/tocalvo)
+ [Kimio Kosaka](https://github.com/kimio-kosaka)
+ [Sandeep Mistry](https://github.com/sandeepmistry)
+ [Nick Hehr](https://github.com/hipsterbrown)