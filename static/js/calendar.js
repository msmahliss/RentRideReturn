/*! bootstrap-calendar - v0.2.4 - 2014-07-01 - https://github.com/Serhioromano/bootstrap-calendar */
"use strict";
Date.prototype.getWeek = function () {
    var t = new Date(this.getFullYear(), 0, 1);
    return Math.ceil(((this.getTime() - t.getTime()) / 864e5 + t.getDay() + 1) / 7)
}, Date.prototype.getMonthFormatted = function () {
    var t = this.getMonth() + 1;
    return 10 > t ? "0" + t : t
}, Date.prototype.getDateFormatted = function () {
    var t = this.getDate();
    return 10 > t ? "0" + t : t
}, String.prototype.format || (String.prototype.format = function () {
    var t = arguments;
    return this.replace(/{(\d+)}/g, function (e, a) {
        return "undefined" != typeof t[a] ? t[a] : e
    })
}), String.prototype.formatNum || (String.prototype.formatNum = function (t) {
    for (var e = "" + this; e.length < t;)e = "0" + e;
    return e
}), function (t) {
    function e(t, e) {
        var a, o, n;
        n = t, a = t.indexOf("?") < 0 ? "?" : "&";
        for (o in e)n += a + o + "=" + encodeURIComponent(e[o]), a = "&";
        return n
    }

    function a(e, a) {
        var o = null != e.options[a] ? e.options[a] : null, n = null != e.locale[a] ? e.locale[a] : null;
        if ("holidays" == a && e.options.merge_holidays) {
            var i = {};
            return t.extend(!0, i, n ? n : d.holidays), o && t.extend(!0, i, o), i
        }
        return null != o ? o : null != n ? n : d[a]
    }

    function o(e, i) {
        var s = [], l = a(e, "holidays");
        for (var d in l)s.push(d + ":" + l[d]);
        if (s.push(i), s = s.join("|"), s in o.cache)return o.cache[s];
        var h = [];
        return t.each(l, function (e, a) {
            var o = null, s = null, l = !1;
            if (t.each(e.split(">"), function (t, a) {
                    var d, h = null;
                    if (d = /^(\d\d)-(\d\d)$/.exec(a))h = new Date(i, parseInt(d[2], 10) - 1, parseInt(d[1], 10)); else if (d = /^(\d\d)-(\d\d)-(\d\d\d\d)$/.exec(a))parseInt(d[3], 10) == i && (h = new Date(i, parseInt(d[2], 10) - 1, parseInt(d[1], 10))); else if (d = /^easter(([+\-])(\d+))?$/.exec(a))h = r(i, d[1] ? parseInt(d[1], 10) : 0); else if (d = /^(\d\d)([+\-])([1-5])\*([0-6])$/.exec(a)) {
                        var p = parseInt(d[1], 10) - 1, c = d[2], u = parseInt(d[3]), m = parseInt(d[4]);
                        switch (c) {
                            case"+":
                                for (var y = new Date(i, p, -6); y.getDay() != m;)y = new Date(y.getFullYear(), y.getMonth(), y.getDate() + 1);
                                h = new Date(y.getFullYear(), y.getMonth(), y.getDate() + 7 * u);
                                break;
                            case"-":
                                for (var y = new Date(i, p + 1, 7); y.getDay() != m;)y = new Date(y.getFullYear(), y.getMonth(), y.getDate() - 1);
                                h = new Date(y.getFullYear(), y.getMonth(), y.getDate() - 7 * u)
                        }
                    }
                    if (!h)return n("Unknown holiday: " + e), l = !0, !1;
                    switch (t) {
                        case 0:
                            o = h;
                            break;
                        case 1:
                            if (h.getTime() <= o.getTime())return n("Unknown holiday: " + e), l = !0, !1;
                            s = h;
                            break;
                        default:
                            return n("Unknown holiday: " + e), l = !0, !1
                    }
                }), !l) {
                var d = [];
                if (s)for (var p = new Date(o.getTime()); p.getTime() <= s.getTime(); p.setDate(p.getDate() + 1))d.push(new Date(p.getTime())); else d.push(o);
                h.push({name: a, days: d})
            }
        }), o.cache[s] = h, o.cache[s]
    }

    function n(e) {
        "object" == t.type(window.console) && "function" == t.type(window.console.warn) && window.console.warn("[Bootstrap-Calendar] " + e)
    }

    function i(e, a) {
        return this.options = t.extend(!0, {
            position: {
                start: new Date,
                end: new Date
            }
        }, l, e), this.setLanguage(this.options.language), this.context = a, a.css("width", this.options.width).addClass("cal-context"), this.view(), this
    }

    function s(e, a, o, n) {
        e.stopPropagation();
        var a = t(a), i = a.closest(".cal-cell"), s = i.closest(".cal-before-eventlist"), r = i.data("cal-row");
        a.fadeOut("fast"), o.slideUp("fast", function () {
            var e = t(".events-list", i);
            o.html(n.options.templates["events-list"]({
                cal: n,
                events: n.getEventsBetween(parseInt(e.data("cal-start")), parseInt(e.data("cal-end")))
            })), s.after(o), n.activecell = t("[data-cal-date]", i).text(), t("#cal-slide-tick").addClass("tick" + r).show(), o.slideDown("fast", function () {
                t("body").one("click", function () {
                    o.slideUp("fast"), n.activecell = 0
                })
            })
        }), setTimeout(function () {
            t("a.event-item").mouseenter(function () {
                t('a[data-event-id="' + t(this).data("event-id") + '"]').closest(".cal-cell1").addClass("day-highlight dh-" + t(this).data("event-class"))
            }), t("a.event-item").mouseleave(function () {
                t("div.cal-cell1").removeClass("day-highlight dh-" + t(this).data("event-class"))
            }), n._update_modal()
        }, 400)
    }

    function r(t, e) {
        var a = t % 19, o = Math.floor(t / 100), n = t % 100, i = Math.floor(o / 4), s = o % 4, r = Math.floor((o + 8) / 25), l = Math.floor((o - r + 1) / 3), d = (19 * a + o - i - l + 15) % 30, h = Math.floor(n / 4), p = n % 4, c = (32 + 2 * s + 2 * h - d - p) % 7, u = Math.floor((a + 11 * d + 22 * c) / 451), m = d + c + 7 * u + 114, y = Math.floor(m / 31) - 1, f = m % 31 + 1;
        return new Date(t, y, f + (e ? e : 0), 0, 0, 0)
    }

    var l = {
        width: "100%",
        view: "month",
        day: "now",
        time_start: "06:00",
        time_end: "22:00",
        time_split: "30",
        events_source: "",
        tmpl_path: "tmpls/",
        tmpl_cache: !0,
        classes: {
            months: {
                inmonth: "cal-day-inmonth",
                outmonth: "cal-day-outmonth",
                saturday: "cal-day-weekend",
                sunday: "cal-day-weekend",
                holidays: "cal-day-holiday",
                today: "cal-day-today"
            },
            week: {
                workday: "cal-day-workday",
                saturday: "cal-day-weekend",
                sunday: "cal-day-weekend",
                holidays: "cal-day-holiday",
                today: "cal-day-today"
            }
        },
        modal: null,
        modal_type: "iframe",
        modal_title: null,
        views: {
            year: {slide_events: 1, enable: 1},
            month: {slide_events: 1, enable: 1},
            week: {enable: 1},
            day: {enable: 1}
        },
        merge_holidays: !1,
        onAfterEventsLoad: function () {
        },
        onBeforeEventsLoad: function (t) {
            t()
        },
        onAfterViewLoad: function () {
        },
        onAfterModalShown: function () {
        },
        onAfterModalHidden: function () {
        },
        events: [],
        templates: {year: "", month: "", week: "", day: ""},
        stop_cycling: !1
    }, d = {
        first_day: 2,
        holidays: {
            "01-01": "New Year's Day",
            "01+3*1": "Birthday of Dr. Martin Luther King, Jr.",
            "02+3*1": "Washington's Birthday",
            "05-1*1": "Memorial Day",
            "04-07": "Independence Day",
            "09+1*1": "Labor Day",
            "10+2*1": "Columbus Day",
            "11-11": "Veterans Day",
            "11+4*4": "Thanksgiving Day",
            "25-12": "Christmas"
        }
    }, h = {
        error_noview: "Calendar: View {0} not found",
        error_dateformat: 'Calendar: Wrong date format {0}. Should be either "now" or "yyyy-mm-dd"',
        error_loadurl: "Calendar: Event URL is not set",
        error_where: 'Calendar: Wrong navigation direction {0}. Can be only "next" or "prev" or "today"',
        error_timedevide: "Calendar: Time split parameter should divide 60 without decimals. Something like 10, 15, 30",
        no_events_in_day: "No events in this day.",
        title_year: "{0}",
        title_month: "{0} {1}",
        title_week: "week {0} of {1}",
        title_day: "{0} {1} {2}, {3}",
        week: "Week {0}",
        all_day: "All day",
        time: "Time",
        events: "Events",
        before_time: "Ends before timeline",
        after_time: "Starts after timeline",
        m0: "January",
        m1: "February",
        m2: "March",
        m3: "April",
        m4: "May",
        m5: "June",
        m6: "July",
        m7: "August",
        m8: "September",
        m9: "October",
        m10: "November",
        m11: "December",
        ms0: "Jan",
        ms1: "Feb",
        ms2: "Mar",
        ms3: "Apr",
        ms4: "May",
        ms5: "Jun",
        ms6: "Jul",
        ms7: "Aug",
        ms8: "Sep",
        ms9: "Oct",
        ms10: "Nov",
        ms11: "Dec",
        d0: "Sunday",
        d1: "Monday",
        d2: "Tuesday",
        d3: "Wednesday",
        d4: "Thursday",
        d5: "Friday",
        d6: "Saturday"
    }, p = "";
    try {
        "object" == t.type(window.jstz) && "function" == t.type(jstz.determine) && (p = jstz.determine().name(), "string" !== t.type(p) && (p = ""))
    } catch (c) {
    }
    o.cache = {}, i.prototype.setOptions = function (e) {
        t.extend(this.options, e), "language"in e && this.setLanguage(e.language), "modal"in e && this._update_modal()
    }, i.prototype.setLanguage = function (e) {
        window.calendar_languages && e in window.calendar_languages ? (this.locale = t.extend(!0, {}, h, calendar_languages[e]), this.options.language = e) : (this.locale = h, delete this.options.language)
    }, i.prototype._render = function () {
        this.context.html(""), this._loadTemplate(this.options.view), this.stop_cycling = !1;
        var t = {};
        t.cal = this, t.day = 1, t.days_name = 1 == a(this, "first_day") ? [this.locale.d1, this.locale.d2, this.locale.d3, this.locale.d4, this.locale.d5, this.locale.d6, this.locale.d0] : [this.locale.d0, this.locale.d1, this.locale.d2, this.locale.d3, this.locale.d4, this.locale.d5, this.locale.d6];
        var e = parseInt(this.options.position.start.getTime()), o = parseInt(this.options.position.end.getTime());
        switch (t.events = this.getEventsBetween(e, o), this.options.view) {
            case"month":
                break;
            case"week":
                this._calculate_hour_minutes(t);
                break;
            case"day":
                this._calculate_hour_minutes(t)
        }
        t.start = new Date(this.options.position.start.getTime()), t.lang = this.locale, this.context.append(this.options.templates[this.options.view](t)), this._update()
    }, i.prototype._calculate_hour_minutes = function (e) {
        var a = this, o = parseInt(this.options.time_split), i = 60 / o, s = Math.min(i, 1);
        (i >= 1 && i % 1 != 0 || 1 > i && 1440 / o % 1 != 0) && t.error(this.locale.error_timedevide);
        var r = this.options.time_start.split(":"), l = this.options.time_end.split(":");
        e.hours = (parseInt(l[0]) - parseInt(r[0])) * s;
        var d = e.hours * i - parseInt(r[1]) / o, h = 6e4 * o, p = new Date(this.options.position.start.getTime());
        p.setHours(r[0]), p.setMinutes(r[1]);
        var c = new Date(this.options.position.end.getTime());
        c.setHours(l[0]), c.setMinutes(l[1]), e.all_day = [], e.by_hour = [], e.after_time = [], e.before_time = [], t.each(e.events, function (t, o) {
            var i = new Date(parseInt(o.start)), s = new Date(parseInt(o.end));
            if (o.start_hour = i.getHours().toString().formatNum(2) + ":" + i.getMinutes().toString().formatNum(2), o.end_hour = s.getHours().toString().formatNum(2) + ":" + s.getMinutes().toString().formatNum(2), o.start < p.getTime() && (n(1), o.start_hour = i.getDate() + " " + a.locale["ms" + i.getMonth()] + " " + o.start_hour), o.end > c.getTime() && (n(1), o.end_hour = s.getDate() + " " + a.locale["ms" + s.getMonth()] + " " + o.end_hour), o.start < p.getTime() && o.end > c.getTime())return void e.all_day.push(o);
            if (o.end < p.getTime())return void e.before_time.push(o);
            if (o.start > c.getTime())return void e.after_time.push(o);
            var r = p.getTime() - o.start;
            o.top = r >= 0 ? 0 : Math.abs(r) / h;
            var l = Math.abs(d - o.top), u = (o.end - o.start) / h;
            r >= 0 && (u = (o.end - p.getTime()) / h), o.lines = u, u > l && (o.lines = l), e.by_hour.push(o)
        })
    }, i.prototype._hour_min = function (t) {
        var e = this.options.time_start.split(":"), a = parseInt(this.options.time_split), o = 60 / a;
        return 0 == t ? o - parseInt(e[1]) / a : o
    }, i.prototype._hour = function (t, e) {
        var a = this.options.time_start.split(":"), o = parseInt(this.options.time_split), n = "" + (parseInt(a[0]) + t * Math.max(o / 60, 1)), i = "" + (o * e + (0 == t ? parseInt(a[1]) : 0));
        return n.formatNum(2) + ":" + i.formatNum(2)
    }, i.prototype._week = function () {
        this._loadTemplate("week-days");
        var e = {}, o = parseInt(this.options.position.start.getTime()), n = parseInt(this.options.position.end.getTime()), i = [], s = this, r = a(this, "first_day");
        return t.each(this.getEventsBetween(o, n), function (t, e) {
            e.start_day = new Date(parseInt(e.start)).getDay(), 1 == r && (e.start_day = (e.start_day + 6) % 7), e.days = e.end - e.start <= 864e5 ? 1 : (e.end - e.start) / 864e5, e.start < o && (e.days = e.days - (o - e.start) / 864e5, e.start_day = 0), e.days = Math.ceil(e.days), e.start_day + e.days > 7 && (e.days = 7 - e.start_day), i.push(e)
        }), e.events = i, e.cal = this, s.options.templates["week-days"](e)
    }, i.prototype._month = function (t) {
        this._loadTemplate("year-month");
        var e = {cal: this}, a = t + 1;
        e.data_day = this.options.position.start.getFullYear() + "-" + (10 > a ? "0" + a : a) + "-01", e.month_name = this.locale["m" + t];
        var o = new Date(this.options.position.start.getFullYear(), t, 1, 0, 0, 0);
        return e.start = parseInt(o.getTime()), e.end = parseInt(new Date(this.options.position.start.getFullYear(), t + 1, 1, 0, 0, 0).getTime()), e.events = this.getEventsBetween(e.start, e.end), this.options.templates["year-month"](e)
    }, i.prototype._day = function (e, o) {
        this._loadTemplate("month-day");
        var n = {
            tooltip: "",
            cal: this
        }, i = this.options.classes.months.outmonth, s = this.options.position.start.getDay();
        2 == a(this, "first_day") ? s++ : s = 0 == s ? 7 : s, o = o - s + 1;
        var r = new Date(this.options.position.start.getFullYear(), this.options.position.start.getMonth(), o, 0, 0, 0);
        o > 0 && (i = this.options.classes.months.inmonth);
        var l = new Date(this.options.position.end.getTime() - 1).getDate();
        if (o + 1 > l && (this.stop_cycling = !0), o > l && (o -= l, i = this.options.classes.months.outmonth), i = t.trim(i + " " + this._getDayClass("months", r)), 0 >= o) {
            var d = new Date(this.options.position.start.getFullYear(), this.options.position.start.getMonth(), 0).getDate();
            o = d - Math.abs(o), i += " cal-month-first-row"
        }
        var h = this._getHoliday(r);
        return h !== !1 && (n.tooltip = h), n.data_day = r.getFullYear() + "-" + r.getMonthFormatted() + "-" + (10 > o ? "0" + o : o), n.cls = i, n.day = o, n.start = parseInt(r.getTime()), n.end = parseInt(n.start + 864e5), n.events = this.getEventsBetween(n.start, n.end), this.options.templates["month-day"](n)
    }, i.prototype._getHoliday = function (e) {
        var a = !1;
        return t.each(o(this, e.getFullYear()), function () {
            var o = !1;
            return t.each(this.days, function () {
                return this.toDateString() == e.toDateString() ? (o = !0, !1) : void 0
            }), o ? (a = this.name, !1) : void 0
        }), a
    }, i.prototype._getHolidayName = function (t) {
        var e = this._getHoliday(t);
        return e === !1 ? "" : e
    }, i.prototype._getDayClass = function (t, e) {
        var a = this, o = function (e, o) {
            var n;
            n = a.options.classes && t in a.options.classes && e in a.options.classes[t] ? a.options.classes[t][e] : "", "string" == typeof n && n.length && o.push(n)
        }, n = [];
        e.toDateString() == (new Date).toDateString() && o("today", n);
        var i = this._getHoliday(e);
        switch (i !== !1 && o("holidays", n), e.getDay()) {
            case 0:
                o("sunday", n);
                break;
            case 6:
                o("saturday", n)
        }
        return o(e.toDateString(), n), n.join(" ")
    }, i.prototype.view = function (t) {
        if (t) {
            if (!this.options.views[t].enable)return;
            this.options.view = t
        }
        this._init_position(), this._loadEvents(), this._render(), this.options.onAfterViewLoad.call(this, this.options.view)
    }, i.prototype.navigate = function (e, a) {
        var o = t.extend({}, this.options.position);
        if ("next" == e)switch (this.options.view) {
            case"year":
                o.start.setFullYear(this.options.position.start.getFullYear() + 1);
                break;
            case"month":
                o.start.setMonth(this.options.position.start.getMonth() + 1);
                break;
            case"week":
                o.start.setDate(this.options.position.start.getDate() + 7);
                break;
            case"day":
                o.start.setDate(this.options.position.start.getDate() + 1)
        } else if ("prev" == e)switch (this.options.view) {
            case"year":
                o.start.setFullYear(this.options.position.start.getFullYear() - 1);
                break;
            case"month":
                o.start.setMonth(this.options.position.start.getMonth() - 1);
                break;
            case"week":
                o.start.setDate(this.options.position.start.getDate() - 7);
                break;
            case"day":
                o.start.setDate(this.options.position.start.getDate() - 1)
        } else"today" == e ? o.start.setTime((new Date).getTime()) : t.error(this.locale.error_where.format(e));
        this.options.day = o.start.getFullYear() + "-" + o.start.getMonthFormatted() + "-" + o.start.getDateFormatted(), this.view(), _.isFunction(a) && a()
    }, i.prototype._init_position = function () {
        var e, o, n;
        if ("now" == this.options.day) {
            var i = new Date;
            e = i.getFullYear(), o = i.getMonth(), n = i.getDate()
        } else if (this.options.day.match(/^\d{4}-\d{2}-\d{2}$/g)) {
            var s = this.options.day.split("-");
            e = parseInt(s[0], 10), o = parseInt(s[1], 10) - 1, n = parseInt(s[2], 10)
        } else t.error(this.locale.error_dateformat.format(this.options.day));
        switch (this.options.view) {
            case"year":
                this.options.position.start.setTime(new Date(e, 0, 1).getTime()), this.options.position.end.setTime(new Date(e + 1, 0, 1).getTime());
                break;
            case"month":
                this.options.position.start.setTime(new Date(e, o, 1).getTime()), this.options.position.end.setTime(new Date(e, o + 1, 1).getTime());
                break;
            case"day":
                this.options.position.start.setTime(new Date(e, o, n).getTime()), this.options.position.end.setTime(new Date(e, o, n + 1).getTime());
                break;
            case"week":
                var r, l = new Date(e, o, n);
                r = 1 == a(this, "first_day") ? l.getDate() - (l.getDay() + 6) % 7 : l.getDate() - l.getDay(), this.options.position.start.setTime(new Date(e, o, r).getTime()), this.options.position.end.setTime(new Date(e, o, r + 7).getTime());
                break;
            default:
                t.error(this.locale.error_noview.format(this.options.view))
        }
        return this
    }, i.prototype.getTitle = function () {
        var t = this.options.position.start;
        switch (this.options.view) {
            case"year":
                return this.locale.title_year.format(t.getFullYear());
            case"month":
                return this.locale.title_month.format(this.locale["m" + t.getMonth()], t.getFullYear());
            case"week":
                return this.locale.title_week.format(t.getWeek(), t.getFullYear());
            case"day":
                return this.locale.title_day.format(this.locale["d" + t.getDay()], t.getDate(), this.locale["m" + t.getMonth()], t.getFullYear())
        }
    }, i.prototype.isToday = function () {
        var t = (new Date).getTime();
        return t > this.options.position.start && t < this.options.position.end
    }, i.prototype.getStartDate = function () {
        return this.options.position.start
    }, i.prototype.getEndDate = function () {
        return this.options.position.end
    }, i.prototype._loadEvents = function () {
        var a = this, o = null;
        "events_source"in this.options && "" !== this.options.events_source ? o = this.options.events_source : "events_url"in this.options && (o = this.options.events_url, n("The events_url option is DEPRECATED and it will be REMOVED in near future. Please use events_source instead."));
        var i;
        switch (t.type(o)) {
            case"function":
                i = function () {
                    return o(a.options.position.start, a.options.position.end, p)
                };
                break;
            case"array":
                i = function () {
                    return [].concat(o)
                };
                break;
            case"string":
                o.length && (i = function () {
                    var n = [], i = {from: a.options.position.start.getTime(), to: a.options.position.end.getTime()};
                    return p.length && (i.browser_timezone = p), t.ajax({
                        url: e(o, i),
                        dataType: "json",
                        type: "GET",
                        async: !1
                    }).done(function (e) {
                        e.success || t.error(e.error), e.result && (n = e.result)
                    }), n
                })
        }
        i || t.error(this.locale.error_loadurl), this.options.onBeforeEventsLoad.call(this, function () {
            a.options.events = i(), a.options.events.sort(function (t, e) {
                var a;
                return a = t.start - e.start, 0 == a && (a = t.end - e.end), a
            }), a.options.onAfterEventsLoad.call(a, a.options.events)
        })
    }, i.prototype._templatePath = function (t) {
        return "function" == typeof this.options.tmpl_path ? this.options.tmpl_path(t) : this.options.tmpl_path + t + ".html"
    }, i.prototype._loadTemplate = function (e) {
        if (!this.options.templates[e]) {
            var a = this;
            t.ajax({
                url: a._templatePath(e),
                dataType: "html",
                type: "GET",
                async: !1,
                cache: this.options.tmpl_cache
            }).done(function (t) {
                a.options.templates[e] = _.template(t)
            })
        }
    }, i.prototype._update = function () {
        //var e = this;
        //t('*[data-toggle="tooltip"]').tooltip({container: "body"}), t("*[data-cal-date]").click(function () {
            //var a = t(this).data("cal-view");
            //e.options.day = t(this).data("cal-date"), e.view(a)
        //}), t(".cal-cell").dblclick(function () {
            //var a = t("[data-cal-date]", this).data("cal-view");
            //e.options.day = t("[data-cal-date]", this).data("cal-date"), e.view(a)
       // }), this["_update_" + this.options.view](), this._update_modal()
    }, i.prototype._update_modal = function () {
        var e = this;
        if (t("a[data-event-id]", this.context).unbind("click"), e.options.modal) {
            var a = t(e.options.modal);
            if (a.length) {
                var o = null;
                "iframe" == e.options.modal_type && (o = t(document.createElement("iframe")).attr({
                    width: "100%",
                    frameborder: "0"
                })), t("a[data-event-id]", this.context).on("click", function (n) {
                    n.preventDefault(), n.stopPropagation();
                    var i = t(this).attr("href"), s = t(this).data("event-id"), n = _.find(e.options.events, function (t) {
                        return t.id == s
                    });
                    "iframe" == e.options.modal_type && (o.attr("src", i), t(".modal-body", a).html(o)), (!a.data("handled.bootstrap-calendar") || a.data("handled.bootstrap-calendar") && a.data("handled.event-id") != n.id) && a.off("show.bs.modal").off("shown.bs.modal").off("hidden.bs.modal").on("show.bs.modal", function () {
                        var o = t(this).find(".modal-body");
                        switch (e.options.modal_type) {
                            case"iframe":
                                var s = o.height() - parseInt(o.css("padding-top"), 10) - parseInt(o.css("padding-bottom"), 10);
                                t(this).find("iframe").height(Math.max(s, 50));
                                break;
                            case"ajax":
                                t.ajax({
                                    url: i, dataType: "html", async: !1, success: function (t) {
                                        o.html(t)
                                    }
                                });
                                break;
                            case"template":
                                e._loadTemplate("modal"), o.html(e.options.templates.modal({event: n, calendar: e}))
                        }
                        _.isFunction(e.options.modal_title) && a.find("h3").html(e.options.modal_title(n))
                    }).on("shown.bs.modal", function () {
                        e.options.onAfterModalShown.call(e, e.options.events)
                    }).on("hidden.bs.modal", function () {
                        e.options.onAfterModalHidden.call(e, e.options.events)
                    }).data("handled.bootstrap-calendar", !0).data("handled.event-id", n.id), a.modal("show")
                })
            }
        }
    }, i.prototype._update_day = function () {
        t("#cal-day-panel").height(t("#cal-day-panel-hour").height())
    }, i.prototype._update_week = function () {
    }, i.prototype._update_year = function () {
        this._update_month_year()
    }, i.prototype._update_month = function () {
        this._update_month_year();
        var e = this, a = t(document.createElement("div")).attr("id", "cal-week-box"), o = this.options.position.start.getFullYear() + "-" + this.options.position.start.getMonthFormatted() + "-";
        t(".cal-month-box .cal-row-fluid").on("mouseenter", function () {
            var n = new Date(e.options.position.start), i = t(".cal-cell1:first-child .cal-month-day", this), s = i.hasClass("cal-month-first-row") ? 1 : t("[data-cal-date]", i).text();
            n.setDate(parseInt(s)), s = 10 > s ? "0" + s : s
        }).on("mouseleave", function () {
            a.hide()
        }), a.click(function () {
            e.options.day = t(this).data("cal-week"), e.view("week")
        })
    }, i.prototype._update_month_year = function () {
        if (this.options.views[this.options.view].slide_events) {
            //var e = this, a = t(document.createElement("div")).attr("id", "cal-day-tick").html('<i class="icon-chevron-down glyphicon glyphicon-chevron-down"></i>');
            //t(".cal-month-day, .cal-year-box .span3").on("mouseenter", function () {
            //    0 != t(".events-list", this).length && t(this).children("[data-cal-date]").text() != e.activecell && a.show().appendTo(this)
            //}).on("mouseleave", function () {
            //    a.hide()
           // }).on("click", function (n) {
            //    0 != t(".events-list", this).length && t(this).children("[data-cal-date]").text() != e.activecell && s(n, a, o, e)
            //});
            //var o = t(document.createElement("div")).attr("id", "cal-slide-box");
            //o.hide().click(function (t) {
            //    t.stopPropagation()
            //}), this._loadTemplate("events-list"), a.click(function (a) {
            //    s(a, t(this), o, e)
            //})
        }
    }, i.prototype.getEventsBetween = function (e, a) {
        var o = [];
        return t.each(this.options.events, function () {
            if (null == this.start)return !0;
            var t = this.end || this.start;
            parseInt(this.start) < a && parseInt(t) >= e && o.push(this)
        }), o
    }, t.fn.calendar = function (t) {
        return new i(t, this)
    }
}(jQuery);