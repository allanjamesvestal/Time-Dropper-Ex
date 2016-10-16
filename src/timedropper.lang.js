// timedropper.lang.js
// author : Zhenyu Wu
// license : MIT
// https://adam5wu.github.io/TimeDropper-Ex/
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], factory);
	} else if (typeof exports === 'object' && typeof module !== 'undefined') {
		// CommonJS. Register as a module
		module.exports = factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}
	(function ($) {
		'use strict';
		$.TDExLang = $.extend({
				'cn' : 'zh-cn',
				'zh-cn' : //simplified chinese
				{
					'am' : '上午',
					'pm' : '下午',
					'reset' : '重置'
				},
			}, $.TDExLang);
	}));
