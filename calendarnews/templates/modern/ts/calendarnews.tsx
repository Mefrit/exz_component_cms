import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as server from 'server';

export class CalendarNews extends React.Component<any, any>{
    test_message: any;
    path2page: any;
    id_news_list: any;
    constructor(props) {
        super(props);
        this.state = {
            days: [],
            news_days: [],
            sum_elem: 0,
            current_month: new Date().getMonth(),
            current_year: new Date().getFullYear()
        };
        this.path2page = props.path2page;
        this.id_news_list = props.id_news_list
        this.getDataNewsFromServer(new Date().getMonth(), new Date().getFullYear());
    }

    daysInMonth = function (month, year) {
        return 32 - new Date(year, month, 32).getDate();
    };
    onLoadMonth = (status, info) => {
        let calendar = this.createCalendar(info.current_month, info.current_year);
        this.setState({
            days: calendar.cache_days,
            news_days: info.news_days,
            current_year: info.current_year,
            current_month: info.current_month
        });
    }
    createCalendar(month, year) {
        let start_day = new Date(year, month, 1), cache_days: any = [], days_month = this.daysInMonth(month, year), free_days;
        let calendar = { cache_days: [] };
        free_days = start_day.getDay() - 1;
        free_days = free_days == -1 ? 6 : free_days;
        for (let i = 0; i < free_days; i++) {
            cache_days.push("");
        }
        for (let i = start_day.getDate(); i < days_month + 1; i++) {
            cache_days.push(i);
        }
        calendar.cache_days = cache_days;
        return calendar;
    }
    getDataNewsFromServer(month, year) {
        server.getJSON("index.php?action=Date" + "&active_service=calendarnews" + "&month=" +
            month + "&year=" + year + "&id_news_list=" + this.id_news_list, this.onLoadMonth);

    }

    initWeekDay() {
        let cache_week = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
        return cache_week.map(elem => {
            return <Day background_color={this.props.background_color} is_news_day={false} current_date={{}} news={[]} item={elem} />;
        });

    }
    getNewsList() {
        return this.state.news_days.map(elem => {
            return elem
        })
    }
    checkNewsDay(mday) {
        let res: any = { result: false, news: [] };
        this.state.news_days.forEach(element => {
            if (element.mday == mday) {
                res.result = true;
                res.news.push({ id_iblock_item: element.id_iblock_item, title: element.title });
            }
        });
        return res;
    }
    changeMonthForward = (event) => {
        event.preventDefault();
        this.getDataNewsFromServer(this.state.current_month - 1, this.state.current_year);
    }
    changeMonthBack = (event) => {
        event.preventDefault();
        this.getDataNewsFromServer(this.state.current_month + 1, this.state.current_year);
    }
    renderMonth() {
        const style = { backgroundColor: this.props.background_color };
        let cache_month = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
        return <div className="calendarInterface" style={style} >
            <svg onClick={this.changeMonthForward} className="calendarInterface__left" viewBox="0 0 5 9">
                <path d="M0.419,9.000 L0.003,8.606 L4.164,4.500 L0.003,0.394 L0.419,0.000 L4.997,4.500 L0.419,9.000 Z" />
            </svg>
            <div className="calendarInterface__date">
                <span className="calendarInterface__year">{this.state.current_year}</span>
                <span className="calendarInterface__month">{cache_month[this.state.current_month]}</span>
            </div>
            <svg onClick={this.changeMonthBack} className="calendarInterface__right" viewBox="0 0 5 9">
                <path d="M0.419,9.000 L0.003,8.606 L4.164,4.500 L0.003,0.394 L0.419,0.000 L4.997,4.500 L0.419,9.000 Z" />
            </svg>

        </div>
    }
    renderCalendar = () => {
        let cache_days_dom: any[] = [], week_days: any[] = [], is_news_day = false, current_date, news = [], tmp;
        cache_days_dom.push(<tr>{this.initWeekDay()}</tr>);
        for (let i = 0; i < this.state.days.length; i++) {

            if (i % 7 == 0 && i != 0) {
                cache_days_dom.push(<tr>{week_days}</tr>)
                week_days = [];
            }
            tmp = this.checkNewsDay(this.state.days[i])
            if (tmp.result) {
                news = tmp.news
            }
            current_date = { current_month: this.state.current_month + 1, current_year: this.state.current_year };
            week_days.push(<Day
                current_date={current_date}
                is_news_day={tmp.result}
                news={news}
                background_color={this.props.background_color}
                item={this.state.days[i]}
                page_with_news={"." + this.path2page}
            />);
            news = [];
            is_news_day = false;
        }
        cache_days_dom.push(<tr>{week_days}</tr>)

        return <div>{this.renderMonth()} <table className="calendar-body"><tbody>{cache_days_dom}</tbody></table></div>
    }
    render() {
        return this.renderCalendar();
    }
}
class Day extends React.Component<any, any>{
    constructor(props) {
        super(props);
    }
    render() {
        let style = {};
        let is_news_day = this.props.is_news_day, href = "";
        if (is_news_day) {
            href = this.props.page_with_news + "?month=" + this.props.current_date.current_month + "&year=" + this.props.current_date.current_year;
            style = { backgroundColor: this.props.background_color };
        }
        return <td style={style} className={is_news_day ? "news_day" : "day"}>{is_news_day ? <a href={href} target="_blank">{this.props.item}</a> : this.props.item}</td>

    }
}
export class DocumentListRenderer {
    constructor(id_news_list, path2page, background_color) {
        ReactDOM.render(<CalendarNews path2page={path2page} background_color={background_color} id_news_list={id_news_list}
        />, document.getElementById("calendar"));
    }
}
