var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "react", "react-dom", "server"], function (require, exports, React, ReactDOM, server) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DocumentListRenderer = exports.CalendarNews = void 0;
    var CalendarNews = (function (_super) {
        __extends(CalendarNews, _super);
        function CalendarNews(props) {
            var _this = _super.call(this, props) || this;
            _this.daysInMonth = function (month, year) {
                return 32 - new Date(year, month, 32).getDate();
            };
            _this.onLoadMonth = function (status, info) {
                var calendar = _this.createCalendar(info.current_month, info.current_year);
                _this.setState({
                    days: calendar.cache_days,
                    news_days: info.news_days,
                    current_year: info.current_year,
                    current_month: info.current_month
                });
            };
            _this.changeMonthForward = function (event) {
                event.preventDefault();
                _this.getDataNewsFromServer(_this.state.current_month - 1, _this.state.current_year);
            };
            _this.changeMonthBack = function (event) {
                event.preventDefault();
                _this.getDataNewsFromServer(_this.state.current_month + 1, _this.state.current_year);
            };
            _this.renderCalendar = function () {
                var cache_days_dom = [], week_days = [], is_news_day = false, current_date, news = [], tmp;
                cache_days_dom.push(React.createElement("tr", null, _this.initWeekDay()));
                for (var i = 0; i < _this.state.days.length; i++) {
                    if (i % 7 == 0 && i != 0) {
                        cache_days_dom.push(React.createElement("tr", null, week_days));
                        week_days = [];
                    }
                    tmp = _this.checkNewsDay(_this.state.days[i]);
                    if (tmp.result) {
                        news = tmp.news;
                    }
                    current_date = { current_month: _this.state.current_month + 1, current_year: _this.state.current_year };
                    week_days.push(React.createElement(Day, { current_date: current_date, is_news_day: tmp.result, news: news, background_color: _this.props.background_color, item: _this.state.days[i], page_with_news: "." + _this.path2page }));
                    news = [];
                    is_news_day = false;
                }
                cache_days_dom.push(React.createElement("tr", null, week_days));
                return React.createElement("div", null,
                    _this.renderMonth(),
                    " ",
                    React.createElement("table", { className: "calendar-body" },
                        React.createElement("tbody", null, cache_days_dom)));
            };
            _this.state = {
                days: [],
                news_days: [],
                sum_elem: 0,
                current_month: new Date().getMonth(),
                current_year: new Date().getFullYear()
            };
            _this.path2page = props.path2page;
            _this.id_news_list = props.id_news_list;
            _this.getDataNewsFromServer(new Date().getMonth(), new Date().getFullYear());
            return _this;
        }
        CalendarNews.prototype.createCalendar = function (month, year) {
            var start_day = new Date(year, month, 1), cache_days = [], days_month = this.daysInMonth(month, year), free_days;
            var calendar = { cache_days: [] };
            free_days = start_day.getDay() - 1;
            free_days = free_days == -1 ? 6 : free_days;
            for (var i = 0; i < free_days; i++) {
                cache_days.push("");
            }
            for (var i = start_day.getDate(); i < days_month + 1; i++) {
                cache_days.push(i);
            }
            calendar.cache_days = cache_days;
            return calendar;
        };
        CalendarNews.prototype.getDataNewsFromServer = function (month, year) {
            server.getJSON("index.php?action=Date" + "&active_service=calendarnews" + "&month=" +
                month + "&year=" + year + "&id_news_list=" + this.id_news_list, this.onLoadMonth);
        };
        CalendarNews.prototype.initWeekDay = function () {
            var _this = this;
            var cache_week = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
            return cache_week.map(function (elem) {
                return React.createElement(Day, { background_color: _this.props.background_color, is_news_day: false, current_date: {}, news: [], item: elem });
            });
        };
        CalendarNews.prototype.getNewsList = function () {
            return this.state.news_days.map(function (elem) {
                return elem;
            });
        };
        CalendarNews.prototype.checkNewsDay = function (mday) {
            var res = { result: false, news: [] };
            this.state.news_days.forEach(function (element) {
                if (element.mday == mday) {
                    res.result = true;
                    res.news.push({ id_iblock_item: element.id_iblock_item, title: element.title });
                }
            });
            return res;
        };
        CalendarNews.prototype.renderMonth = function () {
            var style = { backgroundColor: this.props.background_color };
            var cache_month = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
            return React.createElement("div", { className: "calendarInterface", style: style },
                React.createElement("svg", { onClick: this.changeMonthForward, className: "calendarInterface__left", viewBox: "0 0 5 9" },
                    React.createElement("path", { d: "M0.419,9.000 L0.003,8.606 L4.164,4.500 L0.003,0.394 L0.419,0.000 L4.997,4.500 L0.419,9.000 Z" })),
                React.createElement("div", { className: "calendarInterface__date" },
                    React.createElement("span", { className: "calendarInterface__year" }, this.state.current_year),
                    React.createElement("span", { className: "calendarInterface__month" }, cache_month[this.state.current_month])),
                React.createElement("svg", { onClick: this.changeMonthBack, className: "calendarInterface__right", viewBox: "0 0 5 9" },
                    React.createElement("path", { d: "M0.419,9.000 L0.003,8.606 L4.164,4.500 L0.003,0.394 L0.419,0.000 L4.997,4.500 L0.419,9.000 Z" })));
        };
        CalendarNews.prototype.render = function () {
            return this.renderCalendar();
        };
        return CalendarNews;
    }(React.Component));
    exports.CalendarNews = CalendarNews;
    var Day = (function (_super) {
        __extends(Day, _super);
        function Day(props) {
            return _super.call(this, props) || this;
        }
        Day.prototype.render = function () {
            var style = {};
            var is_news_day = this.props.is_news_day, href = "";
            if (is_news_day) {
                href = this.props.page_with_news + "?month=" + this.props.current_date.current_month + "&year=" + this.props.current_date.current_year;
                style = { backgroundColor: this.props.background_color };
            }
            return React.createElement("td", { style: style, className: is_news_day ? "news_day" : "day" }, is_news_day ? React.createElement("a", { href: href, target: "_blank" }, this.props.item) : this.props.item);
        };
        return Day;
    }(React.Component));
    var DocumentListRenderer = (function () {
        function DocumentListRenderer(id_news_list, path2page, background_color) {
            ReactDOM.render(React.createElement(CalendarNews, { path2page: path2page, background_color: background_color, id_news_list: id_news_list }), document.getElementById("calendar"));
        }
        return DocumentListRenderer;
    }());
    exports.DocumentListRenderer = DocumentListRenderer;
});
