# Fork of [avrgirl-arduino](https://github.com/noopkat/avrgirl-arduino)

#### Forked for a specific custom hardware device - May not work with standard arduino boards. 
#### Please use master branch of [avrgirl-arduino](https://github.com/noopkat/avrgirl-arduino) for latest features and best compatibility.

## What is this?

A NodeJS library for flashing compiled sketch files to Arduino microcontroller boards.

## Changes on this branch
##### Fix for port/PID changing error in ```./lib/connection.js```  
For ATMega**32u4** devices (onboard USB emulation) when connected as USD-HID or USB-MIDI device:
The port name and/or ProductID can *sometimes* change during flashing. This patch attempts to fix the error, which would otherwise occur, by waiting for a new port that shows a **ProductID** which matches that of the target board.

## Acknowledgements

**avrgirl-arduino author: [Suz Hinton](https://github.com/noopkat/)**

Credit for a lot of the heavy lifting going on underneath in this library to:
- [Jacob Rosenthal](https://github.com/jacobrosenthal)
- Ryan Day](https://github.com/soldair)
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