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
				_td_input = $(this),
				_td_dailing = false,
				_td_id = $('.td-clock').length,
				_td_shake = null,
				_td_daildelay = null;

				var
				_td_options = $.extend({

						format : 'hh:mm A',
						autoSwitch : true,
						meridians : true,
						mousewheel : true,
						setCurrentTime : true,
						init_animation : "dropdown",
						showLancets : true,
						dropTrigger : true,
						startFromMinutes : false,
						handleShake : false,
						autoStart : false,
						stickyMinute : 15,
						stickyHour : 5 * 60,

					}, options);

				(_td_options.visualContainer ? _td_options.visualContainer : $('body')).append(
					'<div class="td-clock td-n2" id="td-clock-' + _td_id + '">' +
					'<div class="td-medirian">' +
					'<span class="td-am td-n">AM</span>' +
					'<span class="td-pm td-n">PM</span>' +
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
					'<div class="td-handle td-bounce">' +
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
					'</div>');

				var
				_td_container = $('#td-clock-' + _td_id),
				_td_tags_lancets = _td_container.find('.td-lancette'),
				_td_tags_lancet_hr = _td_tags_lancets.find('.td-hr'),
				_td_tags_lancet_min = _td_tags_lancets.find('.td-min'),
				_td_tags_hr = _td_container.find('.td-hr'),
				_td_tags_min = _td_container.find('.td-min'),
				_td_tags_dail = _td_container.find('.td-dail'),
				_td_tags_dail_handle = _td_tags_dail.find('.td-handle'),
				_td_tags_dail_rail = _td_tags_dail.find('svg'),
				_td_tags_medirian = _td_container.find('.td-medirian'),
				_td_tags_medirian_spans = _td_tags_medirian.find('span'),
				_td_tags_medirian_am = _td_tags_medirian.find('.td-am'),
				_td_tags_medirian_pm = _td_tags_medirian.find('.td-pm'),
				_td_tags_time = _td_container.find('.td-time'),
				_td_tags_time_spans = _td_tags_time.find('span'),
				_td_tags_time_hr = _td_tags_time.find('.td-hr'),
				_td_tags_time_min = _td_tags_time.find('.td-min');

				if (!_td_options.showLancets) {
					_td_tags_lancets.attr('style', "display:none");
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
				_td_settime = function (t) {
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
						} else {
							_td_tags_dail.css('transform', 'rotate(' + _td_m_deg + 'deg)');
						}
					}

					if (_td_options.onUpdate) {
						_td_options.onUpdate(_td_time, _td_formatTime(h, m, hs % 60));
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
						if (fs < _td_options.stickyMinute) {
							newhs -= fs;
						} else if (bs < _td_options.stickyMinute) {
							newhs -= fs - 60;
						}
						if (newhs >= 3600) {
							newhs = 0;
							deg = 0;
						}
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
						if (fs < _td_options.stickyHour) {
							newt -= fs;
						} else if (bs < _td_options.stickyHour) {
							newt -= fs - 3600;
						}
						if (newt >= 12 * 3600) {
							newt = 0;
							deg = 0;
						}
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
						_td_tags_dail.addClass('active');

						_td_tags_dail.css('transform', 'rotate(' + _td_select_deg + 'deg)');
					} else {
						_td_tags_hr.removeClass('td-on');
						_td_tags_min.removeClass('td-on');
						_td_tags_dail.removeClass('active');
					}
				};

				_td_tags_time_spans.click(function (e) {
					e.preventDefault();
					e.stopPropagation();

					_td_select($(this));
				});

				_td_container.click(function (e) {
					if (_td_daildelay == null) {
						_td_select(null);
					}
				});

				if (_td_options.meridians) {
					_td_tags_medirian_spans.click(function (e) {
						_td_settime(_td_pm ? _td_time - 12 * 3600 : _td_time + 12 * 3600);
					});
				}

				_td_tags_dail_rail.on('touchstart mousedown', function (e) {
					if (_td_selector) {
						e.preventDefault();
						e.stopPropagation();

						clearInterval(_td_shake);

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

						$(window).on('touchmove mousemove', function (e) {
							if (_td_dailing) {
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
							}
						});
					}
				});

				$(document).on('touchend mouseup', function (e) {
					if (_td_dailing) {
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
					}
				});

				if (_td_options.mousewheel) {

					_td_container.on('mousewheel', function (e) {
						if (_td_selector) {
							e.preventDefault();
							clearInterval(_td_shake);

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
					});

				}

				var
				_td_start = function (t) {
					_td_container.removeClass('td-fadeout');
					_td_container.addClass('td-show').addClass('td-' + _td_options.init_animation);

					if (!_td_options.visualContainer) {
						_td_container.css({
							'top' : (_td_input.offset().top + _td_input.outerHeight() + (_td_options.dropTrigger ? 0 : 8)),
							'left' : (_td_input.offset().left + (_td_input.outerWidth() / 2)) - (_td_container.outerWidth() / 2)
						});
					}

					if (_td_options.handleShake) {
						_td_shake = setInterval(function () {
								_td_tags_dail_handle.addClass('td-alert');
								setTimeout(function () {
									_td_tags_dail_handle.removeClass('td-alert');
								}, 1000);
							}, 2000);
					}

					if (t == undefined) {
						if (_td_options.fetchTime)
							t = _td_parseTime(_td_options.fetchTime());
					}

					var starttime = t || _td_options.defaultTime ? _td_parseTime(_td_options.defaultTime) : new Date();
					_td_settime(starttime.getHours() * 3600 + starttime.getMinutes() * 60 + starttime.getSeconds());

					_td_select(_td_options.startFromMinutes ? _td_tags_time_min : _td_tags_time_hr);
				},

				_td_stop = function () {
					_td_container.addClass('td-fadeout').removeClass('td-' + _td_options.init_animation);
					_td_event = setTimeout(function () {
							_td_container.removeClass('td-show')
						}, 300);
				};

				if (!_td_options.visualContainer) {
					$(window).on('resize', function () {
						_td_container.css({
							'top' : (_td_input.offset().top + _td_input.outerHeight() + (_td_options.dropTrigger ? 0 : 8)),
							'left' : (_td_input.offset().left + (_td_input.outerWidth() / 2)) - (_td_container.outerWidth() / 2)
						});
					});
				}

				if (_td_options.dropTrigger) {
					_td_input.click(function (e) {
						if (!_td_container.hasClass('td-show')) {
							_td_start();
						} else {
							_td_stop();
						}
					});
				}

				if (_td_options.autoStart) {
					_td_start();
				}

				_td_input.addClass('td-input');

				return {
					show : _td_start,
					hide : _td_stop,
					refocus : function () {
						_td_select(_td_options.startFromMinutes ? _td_tags_time_min : _td_tags_time_hr);
					},
					defocus : function () {
						_td_select(null);
					},
					setTime : function (str) {
						var t = _td_parseTime(str);
						if (t) {
							_td_select(null);
							_td_settime(t.getHours() * 3600 + t.getMinutes() * 60 + t.getSeconds());
						}
						return t;
					},
				};
			}
		});
	}))
