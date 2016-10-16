# TimeDropper-Ex
[![GitHub issues](https://img.shields.io/github/issues/Adam5Wu/TimeDropper-Ex.svg)](https://github.com/Adam5Wu/TimeDropper-Ex/issues)
[![GitHub forks](https://img.shields.io/github/forks/Adam5Wu/TimeDropper-Ex.svg)](https://github.com/Adam5Wu/TimeDropper-Ex/network)
[![License](https://img.shields.io/github/license/Adam5Wu/TimeDropper-Ex.svg)](./LICENSE)
[![Bower version](https://img.shields.io/bower/v/timedropper-ex.svg?maxAge=3600)](https://bower.io/search/)

TimeDropper-Ex is a jQuery plugin for fast visual and interactive time entry.

It is nearly complete rewrite of the original [TimeDropper](https://github.com/felicegattuso/timedropper).

New features:
- Robust internal time keeping logics, accurate to second level
- Improved UI visual experiences and interactive control experiences
	- React to window scrolling and resizing, maintain widget visibility
	- Localized interface with automatic language detection
	- Localized time formatting, based on MomentJS
- Modularized for use with or without input control
	- Fully support event driven inter-operations with other components
		- For interactive date (range) entry, please try [DateRange-Picker-Ex](https://github.com/Adam5Wu/DateRange-Picker-Ex)

## [Documentation & Demo](https://adam5wu.github.io/TimeDropper-Ex/)

## License
This project is released under MIT LICENSE

## Setup for development
* Install node.js
	* [Ubuntu/Mac](https://github.com/creationix/nvm)
	* [Windows](https://nodejs.org/en/download/)
* Update npm to latest version
	```
	npm install -g npm
	```
	
* Install gulp v3.9.1 (global install)
	```
	npm install -g gulp@3.9.1
	```
	
* Clone this project
	```
	git clone https://github.com/Adam5Wu/TimeDropper-Ex.git
	cd DateRange-Picker-Ex
	```
	
* Install local dependencies
	```
	npm install
	```
	
* Build minified sources
	```
	gulp
	```
