//https://github.com/umdjs/umd/blob/master/templates/jqueryPlugin.js
// Uses CommonJS, AMD or browser globals to create a jQuery plugin.

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], factory);
	} else if (typeof module === 'object' && module.exports) {
		// Node/CommonJS
		module.exports = function (root, jQuery) {
			if (jQuery === undefined) {
				// require('jQuery') returns a factory that requires window to
				// build a jQuery instance, we normalize how we use modules
				// that require this pattern but the window provided is a noop
				// if it's defined (how jquery works)
				if (typeof window !== 'undefined') {
					jQuery = require('jquery');
				} else {
					jQuery = require('jquery')(root);
				}
			}
			factory(jQuery);
			return jQuery;
		};
	} else {
		// Browser globals
		factory(window.jQuery); // || window.Zepto ??
	}
}
	(function ($) {
		$.fn.extend({
			timeDropper : function (options) {
				var
				_td_input = this,
				_td_dailing = false,
				_td_id = $('.td-clock').length,
				_td_shake = null,
				_td_now = null,
				_td_daildelay = null;

				var
				_td_options = $.extend({
						format : 'hh:mm A',
						fetchTime : function () {
							return _td_input.val();
						},
						setTime : function (s) {
							if (s != _td_input.val()) {
								_td_input.val(s);
								_td_input.change();
							}
						},
						autoSwitch : true,
						meridians : true,
						mousewheel : true,
						animation : "drop",
						showLancets : true,
						dropTrigger : true,
						startFrom : "hr",
						handleShake : false,
						autoStart : false,
						stickyMinute : 20,
						stickyHour : 8 * 60
					}, options);

				(_td_options.visualContainer ? _td_options.visualContainer : $('body')).append(
					'<div class="td-clock" id="td-clock-' + _td_id + '">' +
					'<div class="td-clock-wrap">' +
					'<div class="td-medirian">' +
					'<span class="td-am td-n2">AM</span>' +
					'<span class="td-pm td-n2">PM</span>' +
					'<span class="td-now td-n2 td-on">Reset</span>' +
					'</div>' +
					'<div class="td-lancette">' +
					'<div class="td-tick td-rotate-0"></div>' +
					'<div class="td-tick td-rotate-30"></div>' +
					'<div class="td-tick td-rotate-60"></div>' +
					'<div class="td-tick td-rotate-90"></div>' +
					'<div class="td-tick td-rotate-120"></div>' +
					'<div class="td-tick td-rotate-150"></div>' +
					'<div class="td-tick td-rotate-180"></div>' +
					'<div class="td-tick td-rotate-210"></div>' +
					'<div class="td-tick td-rotate-240"></div>' +
					'<div class="td-tick td-rotate-270"></div>' +
					'<div class="td-tick td-rotate-300"></div>' +
					'<div class="td-tick td-rotate-330"></div>' +
					'<div class="td-pointer td-hr"></div>' +
					'<div class="td-pointer td-min"></div>' +
					'</div>' +
					'<div class="td-time">' +
					'<span class="td-hr td-n2"></span>' +
					':' +
					'<span class="td-min td-n2"></span>' +
					'</div>' +
					'<div class="td-dail td-n">' +
					'<div class="td-handle">' +
					'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"' +
					'x="0px" y="0px" viewBox="0 0 100 35.4" enable-background="new 0 0 100 35.4" xml:space="preserve">' +
					'<g>' +
					'<path fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"' +
					'stroke-miterlimit="10" d="M98.1,33C85.4,21.5,68.5,14.5,50,14.5S14.6,21.5,1.9,33"/>' +
					'<line fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"' +
					'stroke-miterlimit="10" x1="1.9" y1="33" x2="1.9" y2="28.6"/>' +
					'<line fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"' +
					'stroke-miterlimit="10" x1="1.9" y1="33" x2="6.3" y2="33"/>' +
					'<line fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"' +
					'stroke-miterlimit="10" x1="98.1" y1="33" x2="93.7" y2="33"/>' +
					'<line fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"' +
					'stroke-miterlimit="10" x1="98.1" y1="33" x2="98.1" y2="28.6"/>' +
					'</g>' +
					'</svg>' +
					'</div>' +
					'</div>' +
					'</div>' +
					'</div>');

				var
				_td_container = $('#td-clock-' + _td_id),
				_td_tags_lancet = _td_container.find('.td-lancette'),
				_td_tags_lancet_ptr = _td_container.find('.td-pointer'),
				_td_tags_lancet_hr = _td_tags_lancet.find('.td-hr'),
				_td_tags_lancet_min = _td_tags_lancet.find('.td-min'),
				_td_tags_hr = _td_container.find('.td-hr'),
				_td_tags_min = _td_container.find('.td-min'),
				_td_tags_dail = _td_container.find('.td-dail'),
				_td_tags_dail_handle = _td_tags_dail.find('.td-handle'),
				_td_tags_dail_rail = _td_tags_dail.find('svg'),
				_td_tags_medirian = _td_container.find('.td-medirian'),
				_td_tags_medirian_spans = _td_tags_medirian.find('span'),
				_td_tags_medirian_am = _td_tags_medirian.find('.td-am'),
				_td_tags_medirian_pm = _td_tags_medirian.find('.td-pm'),
				_td_tags_medirian_now = _td_tags_medirian.find('.td-now'),
				_td_tags_time = _td_container.find('.td-time'),
				_td_tags_time_spans = _td_tags_time.find('span'),
				_td_tags_time_hr = _td_tags_time.find('.td-hr'),
				_td_tags_time_min = _td_tags_time.find('.td-min');

				if (!_td_options.showLancets) {
					_td_tags_lancet.attr('style', "display:none");
				}
				if (!_td_options.dropTrigger) {
					_td_container.addClass('nodrop');
				}

				var
				_td_num = function (n) {
					return n < 10 ? '0' + n : n
				},

				_td_parseTime = function (str) {
					var d = new Date();
					var time = str.match(/^(\d\d)(?::(\d\d))?(?::(\d\d))?\s*(am|pm)?$/i);
					if (!time)
						return undefined;

					d.setHours((parseInt(time[1]) || 0) + (time[4] ? (time[4].toUpperCase() == 'PM' ? 12 : 0) : 0),
						parseInt(time[2]) || 0, parseInt(time[3]) || 0);
					return d;
				},

				_td_formatTime = function (h, m, s) {
					var
					disp_h = h > 12 ? h - 12 : h;
					disp_a = h > 12 ? 'pm' : 'am';
					disp_s = s;

					return _td_options.format
					.replace(/\b(HH)\b/g, _td_num(h))
					.replace(/\b(hh)\b/g, _td_num(disp_h))
					.replace(/\b(mm)\b/g, _td_num(m))
					.replace(/\b(ss)\b/g, _td_num(disp_s))
					.replace(/\b(H)\b/g, h)
					.replace(/\b(h)\b/g, disp_h)
					.replace(/\b(m)\b/g, m)
					.replace(/\b(s)\b/g, disp_s)
					.replace(/\b(A)\b/g, disp_a.toUpperCase())
					.replace(/\b(a)\b/g, disp_a);
				};

				var
				_td_selector = null,
				_td_time = 0,
				_td_h_deg = 0,
				_td_m_deg = 0,
				_td_pm = false,
				_td_select_deg = 0;

				var
				_td_settime = function (t, isNow) {
					if (_td_time == t)
						return;

					_td_time = t % (24 * 3600);
					if (_td_time < 0)
						_td_time += 24 * 3600;

					var
					h = Math.floor(_td_time / 3600),
					hs = _td_time % 3600,
					m = Math.floor(hs / 60),
					m_deg = hs * 360 / 3600,
					h_deg = h * 360 / 12;

					_td_h_deg = h_deg % 360 + m_deg / 12;
					_td_m_deg = m_deg;
					_td_pm = h >= 12;

					_td_tags_lancet_hr.css('transform', 'rotate(' + _td_h_deg + 'deg)');
					_td_tags_lancet_min.css('transform', 'rotate(' + _td_m_deg + 'deg)');
					_td_tags_lancet_hr.css('-webkit-transform', 'rotate(' + _td_h_deg + 'deg)');
					_td_tags_lancet_min.css('-webkit-transform', 'rotate(' + _td_m_deg + 'deg)');

					_td_tags_time_hr.attr('data-id', h).text(_td_num(_td_options.meridians ? (h > 12 ? h - 12 : h) : h));
					_td_tags_time_min.attr('data-id', m).text(_td_num(m));

					if (_td_options.meridians) {
						if (_td_pm) {
							_td_tags_medirian_am.removeClass('td-on');
							_td_tags_medirian_pm.addClass('td-on');
						} else {
							_td_tags_medirian_am.addClass('td-on');
							_td_tags_medirian_pm.removeClass('td-on');
						}
					}

					if (_td_selector) {
						if (_td_selector.hasClass('td-hr')) {
							_td_tags_dail.css('transform', 'rotate(' + _td_h_deg + 'deg)');
							_td_tags_dail.css('-webkit-transform', 'rotate(' + _td_h_deg + 'deg)');
						} else {
							_td_tags_dail.css('transform', 'rotate(' + _td_m_deg + 'deg)');
							_td_tags_dail.css('-webkit-transform', 'rotate(' + _td_m_deg + 'deg)');
						}
					}

					var strtime = _td_formatTime(h, m, hs % 60);
					_td_options.setTime(strtime);
					_td_input.trigger('TDEx-update', {
						dailing : _td_dailing,
						selector : _td_selector ? (_td_selector.hasClass('td-hr') ? 'hr' : 'min') : null,
						now : isNow,
						time : [_td_time, strtime]
					});

					if (!isNow && _td_now) {
						clearInterval(_td_now);
						_td_now = null;
						_td_tags_medirian_now.addClass('td-on');
					}
				},

				_td_rotate_min = function (deg) {
					var
					hs = _td_time % 3600,
					newhs = Math.round(deg * 3600 / 360);

					if (_td_options.stickyMinute > 1) {
						var
						fs = newhs % 60,
						bs = 60 - fs;
						if ((fs < _td_options.stickyMinute) || (bs < _td_options.stickyMinute)) {
							newhs = (newhs - fs + (fs < _td_options.stickyMinute ? 0 : 60)) % 3600;
							deg = newhs * 360 / 3600;
						}
						if (deg == _td_m_deg)
							return;
					}

					var
					fwddeg = (deg > _td_m_deg) ? (deg - _td_m_deg) : (_td_m_deg - deg),
					epochhs = (fwddeg <= 180) ? 0 : (deg < _td_m_deg ? 3600 : -3600);

					_td_settime(_td_time - hs + newhs + epochhs);
				},

				_td_rotate_hr = function (deg) {
					var
					pt = _td_time % (12 * 3600),
					newt = Math.round(deg * 3600 * 12 / 360);

					if (_td_options.stickyHour > 1) {
						var
						fs = newt % 3600,
						bs = 3600 - fs;
						if ((fs < _td_options.stickyHour) || (bs < _td_options.stickyHour)) {
							newt = (newt - fs + (fs < _td_options.stickyHour ? 0 : 3600)) % (12 * 3600);
							deg = newt * 360 / (12 * 3600);
						}
						if (deg == _td_h_deg)
							return;
					}

					var
					fwddeg = (deg > _td_h_deg) ? (deg - _td_h_deg) : (_td_h_deg - deg),
					epochhs = (fwddeg <= 180) ? 0 : (deg < _td_h_deg ? 12 * 3600 : -12 * 3600);

					_td_settime(_td_time - pt + newt + epochhs);
				};

				var
				_td_select = function (comp) {
					_td_selector = comp;
					if (_td_selector) {
						if (_td_selector.hasClass('td-hr')) {
							_td_tags_hr.addClass('td-on');
							_td_tags_min.removeClass('td-on');
							_td_select_deg = _td_h_deg;
						} else {
							_td_tags_hr.removeClass('td-on');
							_td_tags_min.addClass('td-on');
							_td_select_deg = _td_m_deg;
						}
						_td_tags_dail.addClass('td-n');
						_td_tags_dail.addClass('active');

						_td_tags_dail.css('transform', 'rotate(' + _td_select_deg + 'deg)');
						_td_tags_dail.css('-webkit-transform', 'rotate(' + _td_select_deg + 'deg)');
					} else {
						_td_tags_hr.removeClass('td-on');
						_td_tags_min.removeClass('td-on');
						_td_tags_dail.removeClass('active');
					}

					_td_input.trigger('TDEx-selector', {
						selector : _td_selector ? (_td_selector.hasClass('td-hr') ? 'hr' : 'min') : null
					});
				};

				var _td_event_click_select = function (e) {
					e.preventDefault();
					e.stopPropagation();

					_td_select($(this));
				};
				_td_tags_time_spans.on('click', _td_event_click_select);

				var _td_event_click_deselect = function (e) {
					if (_td_daildelay == null) {
						_td_select(null);
					}
				};
				_td_container.on('click', _td_event_click_deselect);

				var _td_event_click_meridian_ampm = function (e) {
					_td_input.trigger('TDEx-meridian', {
						clicked : _td_pm ? 'am' : 'pm'
					});
					_td_settime(_td_pm ? _td_time - 12 * 3600 : _td_time + 12 * 3600);
				};
				var _td_event_click_meridian_now = function (e) {
					_td_input.trigger('TDEx-meridian', {
						clicked : 'now'
					});
					_td_resetclock(null);
				};
				if (_td_options.meridians) {
					_td_tags_medirian_am.on('click', _td_event_click_meridian_ampm);
					_td_tags_medirian_pm.on('click', _td_event_click_meridian_ampm);
					_td_tags_medirian_now.on('click', _td_event_click_meridian_now);
				}

				var
				_td_event_start_rail = function (e) {
					if (_td_selector) {
						e.preventDefault();
						e.stopPropagation();

						_td_input.trigger('TDEx-dailing', {
							finish : false,
							selector : (_td_selector.hasClass('td-hr') ? 'hr' : 'min')
						});

						if (_td_shake) {
							clearInterval(_td_shake);
							_td_shake = null;
						}

						_td_tags_dail.removeClass('td-n');
						_td_tags_dail_handle.removeClass('td-bounce');
						_td_tags_dail_handle.addClass('td-drag');

						_td_dailing = true;

						var offset = _td_container.offset();
						var center = {
							y : offset.top + _td_container.height() / 2,
							x : offset.left + _td_container.width() / 2
						};

						var move = (e.type == 'touchstart') ? e.originalEvent.touches[0] : e;

						var
						rad2deg = 180 / Math.PI,
						a = center.y - move.pageY,
						b = center.x - move.pageX,
						deg = Math.atan2(a, b) * rad2deg;

						_td_init_deg = (deg < 0) ? 360 + deg : deg;

						var _td_event_move_rail = function (e) {
							e.preventDefault();
							e.stopPropagation();

							move = (e.type == 'touchmove') ? e.originalEvent.touches[0] : e;

							a = center.y - move.pageY,
							b = center.x - move.pageX,
							deg = Math.atan2(a, b) * rad2deg;
							if (deg < 0) {
								deg = 360 + deg;
							}

							var newdeg = (deg - _td_init_deg) + _td_select_deg;

							if (newdeg < 0) {
								newdeg = 360 + newdeg;
							}
							if (newdeg > 360) {
								newdeg = newdeg - 360;
							}

							if (_td_selector.hasClass('td-hr')) {
								_td_rotate_hr(newdeg);
							} else {
								_td_rotate_min(newdeg);
							}
						},
						_td_event_stop_rail = function (e) {
							e.preventDefault();
							e.stopPropagation();

							_td_dailing = false;
							_td_daildelay = setTimeout(function () {
									_td_daildelay = null;
								}, 100);

							if (_td_options.autoSwitch) {
								_td_select(_td_selector.hasClass('td-hr') ? _td_tags_time_min : _td_tags_time_hr);
							}
							_td_tags_dail.addClass('td-n');
							_td_tags_dail_handle.addClass('td-bounce');
							_td_tags_dail_handle.removeClass('td-drag');

							$(window).off('touchmove mousemove', _td_event_move_rail);
							$(window).off('touchend mouseup', _td_event_stop_rail);

							_td_input.trigger('TDEx-dailing', {
								finish : true,
								selector : (_td_selector.hasClass('td-hr') ? 'hr' : 'min')
							});
						};

						$(window).on('touchmove mousemove', _td_event_move_rail);
						$(window).on('touchend mouseup', _td_event_stop_rail);
					}
				};
				_td_tags_dail_rail.on('touchstart mousedown', _td_event_start_rail);

				var _td_event_wheel = function (e) {
					if (_td_selector) {
						e.preventDefault();
						e.stopPropagation();

						if (_td_shake) {
							clearInterval(_td_shake);
							_td_shake = null;
						}

						if (!_td_dailing) {
							_td_tags_dail.removeClass('td-n');

							_td_select_deg += e.originalEvent.wheelDelta / 120;
							if (_td_select_deg < 0) {
								_td_select_deg = 360 + _td_select_deg;
							}
							if (_td_select_deg > 360) {
								_td_select_deg = _td_select_deg - 360;
							}

							if (_td_selector.hasClass('td-hr')) {
								_td_rotate_hr(_td_select_deg);
							} else {
								_td_rotate_min(_td_select_deg);
							}
						}
					}
				};
				if (_td_options.mousewheel) {
					_td_container.on('mousewheel', _td_event_wheel);
				}

				var
				_td_resetclock = function (t) {
					var newt;
					if (t) {
						if (_td_now) {
							clearInterval(_td_now);
							_td_now = null;
							_td_tags_medirian_now.addClass('td-on');
						}

						newt = t.getHours() * 3600 + t.getMinutes() * 60 + t.getSeconds();
					} else {
						if (_td_now)
							return;

						_td_now = setInterval(function () {
								now = new Date();
								newt = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
								_td_settime(newt, true);
							}, 500);
						_td_tags_medirian_now.removeClass('td-on');

						var now = new Date();
						newt = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

					}

					if (newt != _td_time) {
						_td_tags_lancet_ptr.addClass('td-n');
						_td_settime(newt, _td_now !== null);
						_td_input.trigger('TDEx-reset', {
							sourceTime : t
						});
						setTimeout(function () {
							_td_tags_lancet_ptr.removeClass('td-n');
						}, 500);
					}
				},
				_td_reposition = function () {
					_td_container.css({
						'top' : (_td_input.offset().top + _td_input.outerHeight() + (_td_options.dropTrigger ? 0 : 8)),
						'left' : (_td_input.offset().left + (_td_input.outerWidth() / 2)) - (_td_container.outerWidth() / 2)
					});
				},
				_td_event_resize = function (e) {
					_td_reposition();
				},
				_td_start = function (t) {
					if (_td_container.hasClass('td-show'))
						return;

					if (!_td_options.visualContainer) {
						_td_reposition();
						$(window).on('resize', _td_event_resize);
					}
					_td_container.addClass('td-show')
					.removeClass('td-' + _td_options.animation + 'out')
					.addClass('td-' + _td_options.animation + 'in');

					if (_td_options.handleShake) {
						_td_shake = setInterval(function () {
								_td_tags_dail_handle.addClass('td-alert');
								setTimeout(function () {
									_td_tags_dail_handle.removeClass('td-alert');
								}, 1000);
							}, 2000);
					}

					_td_resetclock(t || _td_parseTime(_td_options.fetchTime()));

					switch (_td_options.startFrom) {
					case 'hr':
						_td_select(_td_tags_time_hr);
						break;
					case 'min':
						_td_select(_td_tags_time_min);
						break;
					}

					_td_input.trigger('TDEx-show', {});
				},
				_td_stop = function () {
					if (!_td_container.hasClass('td-show'))
						return;

					if (_td_now) {
						clearInterval(_td_now);
						_td_now = null;
						_td_tags_medirian_now.addClass('td-on');
					}
					
					if (_td_shake) {
						clearInterval(_td_shake);
						_td_shake = null;
					}

					_td_input.trigger('TDEx-hide', {
						visible : true
					});

					if (!_td_options.visualContainer) {
						$(window).off('resize', _td_event_resize);
					}
					setTimeout(function () {
						_td_select(null);
						_td_container.removeClass('td-show')
						_td_input.trigger('TDEx-hide', {
							visible : false
						});
					}, 700);
					_td_container
					.addClass('td-' + _td_options.animation + 'out')
					.removeClass('td-' + _td_options.animation + 'in');
				};

				var _td_event_click_drop = function (e) {
					if (!_td_container.hasClass('td-show')) {
						_td_start();
					} else {
						_td_stop();
					}
				};
				if (_td_options.dropTrigger) {
					_td_input.on('click', _td_event_click_drop);
				}
				_td_input.addClass('td-input');

				_td_input.data('TDEx', {
					show : _td_start.bind(this),
					hide : _td_stop.bind(this),
					refocus : function (selector) {
						switch (selector) {
						case 'hr':
							_td_select(_td_tags_time_hr);
							break;
						case 'min':
							_td_select(_td_tags_time_min);
							break;
						}
					},
					defocus : function () {
						_td_select(null);
					},
					getTime : function () {
						var
						h = Math.floor(_td_time / 3600),
						hs = _td_time % 3600,
						m = Math.floor(hs / 60);
						return [_td_time, _td_formatTime(h, m, hs % 60)];
					},
					isDailing : function () {
						return _td_dailing;
					},
					setTime : function (time) {
						if (typeof time == 'string') {
							var t = _td_parseTime(time);
							if (t) {
								_td_resetclock(t);
								_td_select(null);
							}
							return t;
						} else if (time instanceof Date || time === null) {
							_td_resetclock(time);
							_td_select(null);
							return time;
						} else {
							throw new Error("Unrecognized time object - " + time);
						}
					},
					destroy : function () {
						_td_input.trigger('TDEx-destroy', {});

						_td_tags_time_spans.off('click', _td_event_click_select);
						_td_container.off('click', _td_event_click_deselect);
						if (_td_options.meridians) {
							_td_tags_medirian_spans.off('click', _td_event_click_meridian_ampm);
							_td_tags_medirian_spans.off('click', _td_event_click_meridian_now);
						}
						if (_td_options.dropTrigger) {
							_td_input.off('click', _td_event_click_drop);
						}
						_td_tags_dail_rail.off('touchstart mousedown', _td_event_start_rail);
						if (_td_options.mousewheel) {
							_td_container.off('mousewheel', _td_event_wheel);
						}
						_td_container.remove();
					}
				});

				if (_td_options.autoStart) {
					setTimeout(_td_start.bind(this), 0);
				}
				return this;
			}
		});
	}))