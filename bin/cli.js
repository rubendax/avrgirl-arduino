#!/usr/bin/env node
var Avrgirl = require('../avrgirl-arduino');
var boards = require('../boards');
var parseArgs = require('minimist');
var path = require('path');
var util = require('util');

var args = (process.argv.slice(2));
var argv = parseArgs(args, opts={})
var userAction = argv._[0];
var help = "Usage:\n" +
  "  avrgirl-arduino flash -f <file> -a <arduino name> [-p <port>] [-v]\n" +
  "  avrgirl-arduino boards\n" +
  "  avrgirl-arduino list [--raw]";

function showHelp() {
  console.log(help);
}

var debug = argv.v ? console.log : function() {};

handleInput(userAction, argv);

function handleInput(action, argz) {
  switch (action) {
    case 'flash':
      if (!argz.f || !argz.a) {
        return showHelp();
        process.exit(1);
      }
      else if (!boards.byName[argz.a]) {
        console.error(new Error('Oops! That board is not supported, sorry.'));
        process.exit(1);
      }
      else {
        // run flash function here if all is well
        var options = {};
        options.board = argz.a;
        if (argz.p) { options.port = argz.p; }
        if (argz.v) { options.debug = true; }
        flash(argz.f, options);
      }
      break;
    case 'boards':
      var boardNames = Object.keys( boards.byName ).sort();
      console.log("Supported Boards:\n - " + boardNames.join("\n - ") );
      break;
    case 'list':
      Avrgirl.listPorts(function(err,ports) {
        console.log("Listing Devices:");
        if ( argz.raw ) {
          console.log( ports );
        } else {
          for (var i=0;i<ports.length;i++) {
            var port = ports[i];
            if ( port._standardPid ) {
              console.log(
                util.format(" - port: %s / pid: %s / mfg: %s / board: %s",
                  port.comName,
                  port._standardPid || 'unknown',
                  port.manufacturer || 'unknown',
                  port._boardNames.length > 0 ? port._boardNames.join(', ') : 'unknown'
                )
              );
            }
          }
        }
      });
      break;
    case 'help':
    case undefined:
    default:
      showHelp();
      return process.exit(1);
      break;
  }
}

function flash(file, options) {
  var avrgirl = new Avrgirl(options);
  var filepath = path.resolve(process.cwd(), file);

  avrgirl.flash(filepath, function(error) {
    if (error) {
      console.error(error);
      return process.exit(1);
    } else {
      return process.exit();
    }
  });

}
