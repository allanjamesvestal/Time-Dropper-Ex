// timedropper.js
// author : Felice Gattuso, Zhenyu Wu
// license : MIT
// https://adam5wu.github.io/TimeDropper-Ex/
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery', 'moment'], factory);
	} else if (typeof module === 'object' && module.exports) {
		// CommonJS. Register as a module
		module.exports = factory(require('jquery'), require('moment'));
	} else {
		// Browser globals
		factory(jQuery, moment);
	}
}
	(function ($) {
		'use strict';
		$.TDExLang = $.extend({
				'default': 'en',
				'en': {
					'am': 'AM',
					'pm': 'PM',
					'reset': 'Reset'
				}
			}, $.TDExLang);

		$.fn.timeDropper = function (opt) {
			opt = $.extend({
					inline: false,
					autoStart: false,
					alwaysOpen: false,
					dropTrigger: true,
					watchValueChange: true,
					format: 'hh:mm A',
					language: undefined,
					fetchTime: function () {
						return $(this).val();
					},
					putTime: function (s) {
						if (s != $(this).val())
							$(this).val(s).change();
					},
					autoSwitch: true,
					meridians: true,
					mousewheel: true,
					showLancets: true,
					animation: "drop",
					container: undefined,
					startFrom: "hr",
					handleShake: false,
					stickyMinute: 20,
					stickyHour: 8 * 60
				}, opt);

			if (opt.alwaysOpen) {
				opt.autoStart = true;
				opt.dropTrigger = false;
			}

			var state = {
				anchor: $(this),
				wrapper: undefined,
				el: {},

				locale: 'default',
				localizer: {},
				fblocalizer: {},
				formatter: moment(),
				monthFormat: '??',

				dailing: false,
				handleShake: null,
				followTime: null,
				dailDelay: null,

				selector: null,
				time: 0,
				h_deg: 0,
				m_deg: 0,
				pm: false,
				select_deg: 0,

				init_deg: undefined,
				rad2deg: 180 / Math.PI,
				center: undefined,

				active: false
			};

			// Public APIs
			state.anchor.data('TDEx', {
				show: function (t) {
					statusCheck();
					return start(t);
				},
				hide: function () {
					statusCheck();
					return stop();
				},
				select: function (sel) {
					statusCheck(true);
					switch (sel) {
					case 'hr':
						dailSelector(state.el.time_hr);
						break;
					case 'min':
						dailSelector(state.el.time_min);
						break;
					default:
						dailSelector(null);
					}
				},
				getTime: function () {
					statusCheck(true);
					var
					h = Math.floor(state.time / 3600),
					hs = state.time % 3600,
					m = Math.floor(hs / 60);
					return [state.time, formatTime(h, m, hs % 60)];
				},
				isActive: function () {
					statusCheck();
					return state.active;
				},
				isDailing: function () {
					statusCheck();
					return state.dailing;
				},
				setTime: function (time) {
					resetClock(time);
					dailSelector(null);
					return time;
				},
				setTimeText: function (time) {
					statusCheck(true);

					var t = parseStringTime(time);
					return t ? setClock(t) : t;
				},
				wrapper: function () {
					statusCheck(true);
					return state.wrapper;
				},
				anchor: function () {
					statusCheck();
					return state.anchor;
				},
				destroy: function () {
					statusCheck();

					state.anchor.trigger('TDEx-destroy', {});

					state.anchor.off('click', event_clickDrop);
					state.anchor.data('TDEx', undefined);

					if (state.wrapper)
						state.wrapper.remove();
					state.wrapper = null;
					
					$(document).off('click', event_clickUndrop);
					$(document).off('click', event_clickNoDailSelector);
				}
			});

			if (opt.dropTrigger)
				state.anchor.on('click', event_clickDrop);
			if (opt.autoStart)
				setTimeout(start.bind(this), 0);
			return this;

			function _init() {
				// Initialize locale
				var localizer = ResolveLocalizer(state.locale)
					var fblocale = localizer[0];
				state.fblocalizer = localizer[1];

				var locale = state.locale;
				if (!opt.language) {
					var languages = navigator.languages || navigator.userLanguage ||
						(navigator.language ? [navigator.language] : [navigator.browserLanguage]);
					for (var idx in languages) {
						var lang = languages[idx].toLowerCase();
						if (lang in $.TDExLang) {
							locale = lang;
							break;
						}
					}
				} else if (opt.language in $.TDExLang)
					locale = opt.language;

				localizer = ResolveLocalizer(locale);
				state.locale = localizer[0];
				state.localizer = localizer[1];

				var _locale = state.formatter.locale();
				if (!opt.language || state.formatter.locale(opt.language).locale() !== opt.language) {
					if (state.formatter.locale(state.locale).locale() !== state.locale)
						if (state.formatter.locale(locale).locale() !== locale)
							if (state.formatter.locale(fblocale).locale() !== fblocale)
								state.formatter.locale(_locale);
				}
				// Set formatter to a clean state (bypass daylight saving problem)
				state.formatter.utc().startOf('day');

				state.wrapper = createDom($('.td-clock').length);
				(opt.container || $('body')).append(state.wrapper);

				state.el['lancet'] = state.wrapper.find('.td-lancette');
				state.el['lancet_ptr'] = state.wrapper.find('.td-pointer');
				state.el['lancet_hr'] = state.el.lancet.find('.td-hr');
				state.el['lancet_min'] = state.el.lancet.find('.td-min');
				state.el['hr'] = state.wrapper.find('.td-hr');
				state.el['min'] = state.wrapper.find('.td-min');
				state.el['dail'] = state.wrapper.find('.td-dail');
				state.el['dail_handle'] = state.el.dail.find('.td-handle');
				state.el['dail_rail'] = state.el.dail.find('svg');
				state.el['medirian'] = state.wrapper.find('.td-medirian');
				state.el['medirian_spans'] = state.el.medirian.find('span');
				state.el['medirian_am'] = state.el.medirian.find('.td-am');
				state.el['medirian_pm'] = state.el.medirian.find('.td-pm');
				state.el['medirian_now'] = state.el.medirian.find('.td-now');
				state.el['time'] = state.wrapper.find('.td-time');
				state.el['time_spans'] = state.el.time.find('span');
				state.el['time_hr'] = state.el.time.find('.td-hr');
				state.el['time_min'] = state.el.time.find('.td-min');

				if (!opt.showLancets)
					state.el.lancet.css('display', 'none');
				if (!opt.dropTrigger)
					state.wrapper.addClass('nodrop');

				state.wrapper.attr('unselectable', 'on')
				.css('user-select', 'none')
				.bind('selectstart', function (e) {
					e.preventDefault();
					return false;
				});

				state.el.time_spans.on('click', event_clickDailSelector);
				if (!opt.alwaysOpen)
					state.wrapper.on('click', event_clickNoDailSelector);
				if (opt.meridians) {
					state.el.medirian_am.on('click', event_clickMeridianAMPM);
					state.el.medirian_pm.on('click', event_clickMeridianAMPM);
					state.el.medirian_now.on('click', event_clickMeridianReset);
				}

				state.el.dail_rail.on('touchstart mousedown', event_startRail);
				if (opt.mousewheel)
					state.wrapper.on('mousewheel', event_wheel);
			}

			function statusCheck(initialized) {
				if (!state.wrapper) {
					if (state.wrapper !== undefined)
						throw new Error('Already destroyed');
					if (initialized)
						throw new Error('Not yet initialized');
				}
			}

			function ResolveLocalizer(locale) {
				var localizer = $.TDExLang[locale];
				// Resolve aliases
				while (localizer.constructor === String) {
					locale = localizer;
					localizer = $.TDExLang[localizer];
				}
				return [locale, localizer];
			}

			function localize(t) {
				return state.localizer[t] || state.fblocalizer[t] || '??';
			}

			function displayNumber(n) {
				return n < 10 ? '0' + n : n
			}

			function parseStringTime(str) {
				var val = (str && str.constructor == String) ? str.trim() : undefined;
				if (val) {
					var parsed = moment(val, opt.format, state.formatter.locale(), true);
					val = parsed.isValid() ? parsed.utc().toDate() : undefined;
				}
				return val;
			}

			function formatTime(h, m, s) {
				state.formatter.hour(h).minute(m).second(s);
				return state.formatter.format(opt.format);
			}

			function setClock(t, isNow) {
				if (state.time != t) {
					state.time = t % (24 * 3600);
					if (state.time < 0)
						state.time += 24 * 3600;

					var
					h = Math.floor(state.time / 3600),
					hs = state.time % 3600,
					m = Math.floor(hs / 60),
					m_deg = hs * 360 / 3600,
					h_deg = h * 360 / 12;

					state.h_deg = h_deg % 360 + m_deg / 12;
					state.m_deg = m_deg;
					state.pm = h >= 12;

					state.el.lancet_hr.css('transform', 'rotate(' + state.h_deg + 'deg)');
					state.el.lancet_min.css('transform', 'rotate(' + state.m_deg + 'deg)');
					state.el.lancet_hr.css('-webkit-transform', 'rotate(' + state.h_deg + 'deg)');
					state.el.lancet_min.css('-webkit-transform', 'rotate(' + state.m_deg + 'deg)');

					state.el.time_hr.attr('data-id', h).text(displayNumber(opt.meridians ? (h > 12 ? h - 12 : h) : h));
					state.el.time_min.attr('data-id', m).text(displayNumber(m));

					if (opt.meridians) {
						if (state.pm) {
							state.el.medirian_am.removeClass('td-on');
							state.el.medirian_pm.addClass('td-on');
						} else {
							state.el.medirian_am.addClass('td-on');
							state.el.medirian_pm.removeClass('td-on');
						}
					}

					if (state.selector) {
						if (state.selector.hasClass('td-hr')) {
							state.el.dail.css('transform', 'rotate(' + state.h_deg + 'deg)');
							state.el.dail.css('-webkit-transform', 'rotate(' + state.h_deg + 'deg)');
						} else {
							state.el.dail.css('transform', 'rotate(' + state.m_deg + 'deg)');
							state.el.dail.css('-webkit-transform', 'rotate(' + state.m_deg + 'deg)');
						}
					}

					var strtime = formatTime(h, m, hs % 60);
					opt.putTime.call(state.anchor[0], strtime);
					state.anchor.trigger('TDEx-update', {
						dailing: state.dailing,
						selector: state.selector ? (state.selector.hasClass('td-hr') ? 'hr' : 'min') : null,
						now: isNow,
						time: [state.time, strtime]
					});
				}

				if (!isNow && state.followTime) {
					clearInterval(state.followTime);
					state.followTime = null;
					state.el.medirian_now.addClass('td-on');
				}
			}

			function rotateMin(deg) {
				var
				hs = state.time % 3600,
				newhs = Math.round(deg * 3600 / 360);

				if (opt.stickyMinute > 1) {
					var
					fs = newhs % 60,
					bs = 60 - fs;
					if ((fs < opt.stickyMinute) || (bs < opt.stickyMinute)) {
						newhs = (newhs - fs + (fs < opt.stickyMinute ? 0 : 60)) % 3600;
						deg = newhs * 360 / 3600;
					}
					if (deg == state.m_deg)
						return;
				}

				var
				fwddeg = (deg > state.m_deg) ? (deg - state.m_deg) : (state.m_deg - deg),
				epochhs = (fwddeg <= 180) ? 0 : (deg < state.m_deg ? 3600 : -3600);

				setClock(state.time - hs + newhs + epochhs);
			}

			function rotateHr(deg) {
				var
				pt = state.time % (12 * 3600),
				newt = Math.round(deg * 3600 * 12 / 360);

				if (opt.stickyHour > 1) {
					var
					fs = newt % 3600,
					bs = 3600 - fs;
					if ((fs < opt.stickyHour) || (bs < opt.stickyHour)) {
						newt = (newt - fs + (fs < opt.stickyHour ? 0 : 3600)) % (12 * 3600);
						deg = newt * 360 / (12 * 3600);
					}
					if (deg == state.h_deg)
						return;
				}

				var
				fwddeg = (deg > state.h_deg) ? (deg - state.h_deg) : (state.h_deg - deg),
				epochhs = (fwddeg <= 180) ? 0 : (deg < state.h_deg ? 12 * 3600 : -12 * 3600);

				setClock(state.time - pt + newt + epochhs);
			}

			function dailSelector(comp) {
				state.selector = comp;
				if (state.selector) {
					if (state.selector.hasClass('td-hr')) {
						state.el.hr.addClass('td-on');
						state.el.min.removeClass('td-on');
						state.select_deg = state.h_deg;
					} else {
						state.el.hr.removeClass('td-on');
						state.el.min.addClass('td-on');
						state.select_deg = state.m_deg;
					}
					state.el.dail.addClass('td-n');
					state.el.dail.addClass('active');

					state.el.dail.css('transform', 'rotate(' + state.select_deg + 'deg)');
					state.el.dail.css('-webkit-transform', 'rotate(' + state.select_deg + 'deg)');
				} else {
					state.el.hr.removeClass('td-on');
					state.el.min.removeClass('td-on');
					state.el.dail.removeClass('active');
				}

				state.anchor.trigger('TDEx-selector', {
					selector: state.selector ? (state.selector.hasClass('td-hr') ? 'hr' : 'min') : null
				});
			}

			function event_clickDailSelector(e) {
				dailSelector($(this));

				if (state.dailDelay)
					clearTimeout(state.dailDelay);

				state.dailDelay = setTimeout(function () {
						state.dailDelay = null;
					}, 100);
			}

			function event_clickNoDailSelector(e) {
				if (state.dailDelay == null)
					dailSelector(null);
			}

			function event_clickMeridianAMPM(e) {
				state.anchor.trigger('TDEx-meridian', {
					clicked: state.pm ? 'am' : 'pm'
				});
				setClock(state.pm ? state.time - 12 * 3600 : state.time + 12 * 3600);
			}

			function event_clickMeridianReset(e) {
				state.anchor.trigger('TDEx-meridian', {
					clicked: 'now'
				});
				resetClock(null);
			}

			function event_startRail(e) {
				if (state.selector) {
					state.anchor.trigger('TDEx-dailing', {
						finish: false,
						selector: (state.selector.hasClass('td-hr') ? 'hr' : 'min')
					});

					if (state.handleShake) {
						clearInterval(state.handleShake);
						state.handleShake = null;
					}

					state.el.dail.removeClass('td-n');
					state.el.dail_handle.removeClass('td-bounce');
					state.el.dail_handle.addClass('td-drag');

					state.dailing = true;

					var offset = state.wrapper.offset();
					state.center = {
						y: offset.top + state.wrapper.height() / 2,
						x: offset.left + state.wrapper.width() / 2
					};

					var
					move = (e.type == 'touchstart') ? e.originalEvent.touches[0] : e,
					a = state.center.y - move.pageY,
					b = state.center.x - move.pageX,
					deg = Math.atan2(a, b) * state.rad2deg;

					state.init_deg = (deg < 0) ? 360 + deg : deg;

					$(window).on('touchmove mousemove', event_moveRail);
					$(window).on('touchend mouseup', event_stopRail);
				}
			}

			function event_moveRail(e) {
				var
				move = (e.type == 'touchmove') ? e.originalEvent.touches[0] : e,
				a = state.center.y - move.pageY,
				b = state.center.x - move.pageX,
				deg = Math.atan2(a, b) * state.rad2deg;

				if (deg < 0)
					deg = 360 + deg;

				var newdeg = (deg - state.init_deg) + state.select_deg;

				if (newdeg < 0)
					newdeg = 360 + newdeg;
				else if (newdeg > 360)
					newdeg = newdeg - 360;

				if (state.selector.hasClass('td-hr'))
					rotateHr(newdeg);
				else
					rotateMin(newdeg);
			}

			function event_stopRail(e) {
				state.dailing = false;
				if (state.dailDelay)
					clearTimeout(state.dailDelay);
				state.dailDelay = setTimeout(function () {
						state.dailDelay = null;
					}, 100);

				if (opt.autoSwitch) {
					dailSelector(state.selector.hasClass('td-hr') ? state.el.time_min : state.el.time_hr);
				}
				state.el.dail.addClass('td-n');
				state.el.dail_handle.addClass('td-bounce');
				state.el.dail_handle.removeClass('td-drag');

				$(window).off('touchmove mousemove', event_moveRail);
				$(window).off('touchend mouseup', event_stopRail);

				state.anchor.trigger('TDEx-dailing', {
					finish: true,
					selector: (state.selector.hasClass('td-hr') ? 'hr' : 'min')
				});
			}

			function event_wheel(e) {
				if (state.selector) {
					e.preventDefault();
					e.stopPropagation();

					if (state.handleShake) {
						clearInterval(state.handleShake);
						state.handleShake = null;
					}

					if (!state.dailing) {
						state.el.dail.removeClass('td-n');

						state.select_deg += e.originalEvent.wheelDelta / 120;
						if (state.select_deg < 0)
							state.select_deg = 360 + state.select_deg;
						else if (state.select_deg > 360)
							state.select_deg = state.select_deg - 360;

						if (state.selector.hasClass('td-hr'))
							rotateHr(state.select_deg);
						else
							rotateMin(state.select_deg);
					}
				}
			}

			function resetClock(t) {
				var newt;
				if (t || t === 0) {
					if (state.followTime) {
						clearInterval(state.followTime);
						state.followTime = null;
						state.el.medirian_now.addClass('td-on');
					}

					newt = t instanceof Date ? t.getHours() * 3600 + t.getMinutes() * 60 + t.getSeconds() : t;
				} else {
					if (state.followTime)
						return;

					state.followTime = setInterval(function () {
							now = new Date();
							newt = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
							setClock(newt, true);
						}, 500);
					state.el.medirian_now.removeClass('td-on');

					var now = new Date();
					newt = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
				}

				if (newt != state.time) {
					state.el.lancet_ptr.addClass('td-n');
					setClock(newt, state.followTime !== null);
					state.anchor.trigger('TDEx-reset', {
						sourceTime: t
					});
					setTimeout(function () {
						state.el.lancet_ptr.removeClass('td-n');
					}, 500);
				}
			}

			function calcPosition() {
				var anchorO = state.anchor.offset();
				var anchorW = state.anchor.outerWidth();
				var anchorH = state.anchor.outerHeight();
				anchorO['right'] = anchorO.left + anchorW;
				anchorO['bottom'] = anchorO.top + anchorH;
				var containerO = state.wrapper.offset();
				var containerW = state.wrapper.outerWidth();
				var containerH = state.wrapper.outerHeight();
				containerO['right'] = containerO.left + containerW;
				containerO['bottom'] = containerO.top + containerH;
				var vpO = {
					top: $(window).scrollTop(),
					left: $(window).scrollLeft()
				};
				var vpW = $(window).width();
				var vpH = $(window).height();
				vpO['right'] = vpO.left + vpW;
				vpO['bottom'] = vpO.top + vpH;

				var anchorCenter = Math.round(anchorO.left + (anchorW - containerW) / 2);
				if ((containerO.left == anchorCenter) &&
					(containerO.top >= vpO.top && containerO.bottom <= vpO.bottom) &&
					(containerO.top == anchorO.bottom || containerO.bottom == anchorO.top))
					return false;

				var DropDown = (anchorO.bottom + containerH <= vpO.bottom || anchorO.top - containerH < vpO.top);
				var VDist;
				if (DropDown) {
					var newTop = Math.max(anchorO.bottom, vpO.top);
					state.wrapper.removeClass('drop-up').css({
						top: newTop,
						bottom: 'auto',
						left: anchorCenter
					});
					VDist = newTop - anchorO.bottom;
				} else {
					var bodyH = $('body').outerHeight();
					var newBotTop = Math.min(anchorO.top, vpO.bottom);
					state.wrapper.addClass('drop-up').css({
						top: 'auto',
						bottom: bodyH - newBotTop,
						left: anchorCenter
					});
					VDist = anchorO.top - newBotTop;
				}
				state.wrapper.css({
					opacity: 0.3 + 0.7 / Math.log2(2 + (VDist >> 7))
				});
				return true;
			}

			function event_resizeScroll(e) {
				calcPosition();
			}

			function start(t) {
				if (!state.active) {
					if (!state.wrapper)
						_init();

					state.active = true;

					state.wrapper.addClass('td-show')
					.removeClass('td-' + opt.animation + 'out');
					if (!opt.alwaysOpen)
						state.wrapper.addClass('td-' + opt.animation + 'in');

					if (opt.handleShake) {
						state.handleShake = setInterval(function () {
								state.el.dail_handle.addClass('td-alert');
								setTimeout(function () {
									state.el.dail_handle.removeClass('td-alert');
								}, 1000);
							}, 2000);
					}

					resetClock(t || parseStringTime(opt.fetchTime.call(state.anchor[0])));

					switch (opt.startFrom) {
					case 'hr':
						dailSelector(state.el.time_hr);
						break;
					case 'min':
						dailSelector(state.el.time_min);
						break;
					}

					if (!opt.container) {
						calcPosition();
						$(window).on('resize scroll', event_resizeScroll);
					}

					if (opt.watchValueChange)
						state.anchor.on('input', event_valueChange);

					$(document).on('click', opt.alwaysOpen ? event_clickNoDailSelector : event_clickUndrop);

					state.anchor.trigger('TDEx-show', {});
					return true;
				}
				return false;
			}

			function stop() {
				if (!opt.alwaysOpen && state.active) {
					state.active = false;

					if (state.followTime) {
						clearInterval(state.followTime);
						state.followTime = null;
						state.el.medirian_now.addClass('td-on');
					}

					if (state.handleShake) {
						clearInterval(state.handleShake);
						state.handleShake = null;
					}

					if (!opt.container) {
						$(window).off('resize', event_resizeScroll);
						$(window).off('scroll', event_resizeScroll);
					}

					if (opt.watchValueChange)
						state.anchor.off('input', event_valueChange);

					$(document).off('click', event_clickUndrop);

					setTimeout(function () {
						dailSelector(null);
						state.wrapper.removeClass('td-show')
						state.anchor.trigger('TDEx-hide', {});
					}, 700);

					state.wrapper
					.addClass('td-' + opt.animation + 'out')
					.removeClass('td-' + opt.animation + 'in');
					return true;
				}
				return false;
			}

			function clickContained(evt, container) {
				return container.contains(evt.target) || evt.target == container;
			}

			function event_valueChange(e) {
				clearTimeout(state.valueChange);
				state.valueChange = setTimeout(function () {
						state.valueChange = null;
						var time = parseStringTime(opt.fetchTime.call(state.anchor[0]));
						if (time)
							resetClock(time);
					}, 200);
			}

			function event_clickDrop(e) {
				start();
			}

			function event_clickUndrop(e) {
				if (!clickContained(e, state.anchor[0]) && !clickContained(e, state.wrapper[0]))
					stop();
			}

			// Open tag: content === undefined
			// Open+Close: content.constructor === String
			function tagGen(name, attrs, content) {
				var Ret = '<' + name;
				if (attrs) {
					$.each(attrs, function (attrKey, attrVal) {
						if (attrVal.constructor == Array)
							attrVal = attrVal.reduce(function (t, e) {
									return (t || '') + (e ? ' ' + e : '');
								});
						Ret += ' ' + attrKey + '="' + attrVal + '"';
					});
					if (content !== undefined)
						Ret += (content ? '>' + content + '</' + name : '/');
				}
				return Ret + '>';
			}

			function createDom(index) {
				var html =
					tagGen('div', {
						'class': ['td-clock',
							(opt.inline ? 'inline' : '')],
						id: 'td-clock-' + index
					})
					 + tagGen('div', {
						'class': 'td-clock-wrap'
					})
					 + tagGen('div', {
						'class': 'td-medirian'
					}, tagGen('span', {
							'class': ['td-am', 'td-n2']
						}, localize('am')) + tagGen('span', {
							'class': ['td-pm', 'td-n2']
						}, localize('pm')) + tagGen('span', {
							'class': ['td-now', 'td-n2', 'td-on']
						}, localize('reset')))
					 + tagGen('div', {
						'class': 'td-lancette'
					}, tagGen('div', {
							'class': ['td-tick', 'td-rotate-0']
						}, '')
						 + tagGen('div', {
							'class': ['td-tick', 'td-rotate-30']
						}, '')
						 + tagGen('div', {
							'class': ['td-tick', 'td-rotate-60']
						}, '')
						 + tagGen('div', {
							'class': ['td-tick', 'td-rotate-90']
						}, '')
						 + tagGen('div', {
							'class': ['td-tick', 'td-rotate-120']
						}, '')
						 + tagGen('div', {
							'class': ['td-tick', 'td-rotate-150']
						}, '')
						 + tagGen('div', {
							'class': ['td-tick', 'td-rotate-180']
						}, '')
						 + tagGen('div', {
							'class': ['td-tick', 'td-rotate-210']
						}, '')
						 + tagGen('div', {
							'class': ['td-tick', 'td-rotate-240']
						}, '')
						 + tagGen('div', {
							'class': ['td-tick', 'td-rotate-270']
						}, '')
						 + tagGen('div', {
							'class': ['td-tick', 'td-rotate-300']
						}, '')
						 + tagGen('div', {
							'class': ['td-tick', 'td-rotate-330']
						}, '')
						 + tagGen('div', {
							'class': ['td-pointer', 'td-hr']
						}, '')
						 + tagGen('div', {
							'class': ['td-pointer', 'td-min']
						}, ''))
					 + tagGen('div', {
						'class': 'td-time'
					}, tagGen('span', {
							'class': ['td-hr', 'td-n2']
						}, '')
						 + ':' + tagGen('span', {
							'class': ['td-min', 'td-n2']
						}, ''))
					 + tagGen('div', {
						'class': ['td-dail', 'td-n']
					})
					 + tagGen('div', {
						'class': 'td-handle'
					}, tagGen('svg', {
							xmlns: 'http://www.w3.org/2000/svg',
							'xmlns:xlink': 'http://www.w3.org/1999/xlink',
							'xml:space': 'preserve',
							version: '1.1',
							x: '0px',
							y: '0px',
							viewBox: '0 0 100 35.4',
							'enable-background': 'new 0 0 100 35.4'
						}, tagGen('g', {},
								tagGen('path', {
									fill: 'none',
									'stroke-width': 1.2,
									'stroke-linecap': 'round',
									'stroke-linejoin': 'round',
									'stroke-miterlimit': 10,
									d: 'M98.1,33C85.4,21.5,68.5,14.5,50,14.5S14.6,21.5,1.9,33'
								}, '')
								 + tagGen('line', {
									fill: 'none',
									'stroke-width': 1.2,
									'stroke-linecap': 'round',
									'stroke-linejoin': 'round',
									'stroke-miterlimit': 10,
									x1: 1.9,
									y1: 33,
									x2: 1.9,
									y2: 28.6
								}, '')
								 + tagGen('line', {
									fill: 'none',
									'stroke-width': 1.2,
									'stroke-linecap': 'round',
									'stroke-linejoin': 'round',
									'stroke-miterlimit': 10,
									x1: 1.9,
									y1: 33,
									x2: 6.3,
									y2: 33
								}, '')
								 + tagGen('line', {
									fill: 'none',
									'stroke-width': 1.2,
									'stroke-linecap': 'round',
									'stroke-linejoin': 'round',
									'stroke-miterlimit': 10,
									x1: 98.1,
									y1: 33,
									x2: 93.7,
									y2: 33
								}, '')
								 + tagGen('line', {
									fill: 'none',
									'stroke-width': 1.2,
									'stroke-linecap': 'round',
									'stroke-linejoin': 'round',
									'stroke-miterlimit': 10,
									x1: 98.1,
									y1: 33,
									x2: 98.1,
									y2: 28.6
								}, ''))))
					 + tagGen('/div')
					 + tagGen('/div')
					 + tagGen('/div');

				return $(html);
			}
		};
	}))
