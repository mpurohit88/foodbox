import React, { Component } from 'react';
import moment from 'moment';

import { FormControl, Row, Col } from 'react-bootstrap';

import { saveSchedule, getSchedule } from '../httpClient';
import { getDaysInMonth, getMonth, getTodaysDate } from '../Helper';
import TiffinDropDown from '../Common/tiffinDropDown';
import Schedule from '../Dialog/Schedule';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {showDialog: false, printBill: false, showSchedulerInput: false};

    this.saveShedule = this.saveShedule.bind(this);
    this._getSchedule = this._getSchedule.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.printBill = this.printBill.bind(this);
  }

  printBill = () => {
    // your axios call here
    localStorage.setItem("pageData", "Data Retrieved from axios request")
    // route to new page by changing window.location
    window.open('http://localhost:3000/reciept', "_blank") //to open new page
  }

  setSchedule = (data) => {
    this.setState({schedule: data});
  }

  saveShedule(customerId) {
      const that = this;
      let bill = [];

      if(document.getElementById('BreakFast_Schedule').checked) {
        bill.push({tiffinType: '4', amount: document.getElementById('Amount_BreakFast_Schedule').value, qty: document.getElementById('Quantity_BreakFast_Schedule').value})
      }

      if(document.getElementById('Launch_Schedule').checked) {
        bill.push({tiffinType: '1', amount: document.getElementById('Amount_Launch_Schedule').value, qty: document.getElementById('Quantity_Launch_Schedule').value})
      }

      if(document.getElementById('Dinner_Schedule').checked) {
        bill.push({tiffinType: '2', amount: document.getElementById('Amount_Dinner_Schedule').value, qty: document.getElementById('Quantity_Dinner_Schedule').value})
      }

      const obj = {
        startDate: document.getElementById('StartDate').value,
        endDate: document.getElementById('EndDate').value,
        customerId: this.props.primaryKey,
        // tiffinType: document.getElementById('TiffinType_Schedule').value,
        isWeekend: document.getElementById('Yes').checked,
        bill: bill
    }

    saveSchedule(obj).then(function(schedule) {
        console.log("Schedule.............", schedule);
        that.setState({schedule});
    });
  }
  
  getSnapshotBeforeUpdate(prevProps, prevState) {

    // if(prevProps.customerId !== this.props.customerId) {
    //     this._getSchedule();
    // }

    return false;
  }

  componentDidMount() {
    const { customerId } = this.props.match.params;
    console.log("*************", customerId);
    this.setState({customerId: customerId}, this._getSchedule('', customerId));

    let date = new Date();

    if(document.querySelector("#StartDate")) document.querySelector("#StartDate").valueAsDate = new Date(date.getFullYear(), date.getMonth(), 2);
    if(document.querySelector("#EndDate")) document.querySelector("#EndDate").valueAsDate =  new Date(date.getFullYear(), date.getMonth() + 1, 1);

    // document.getElementById("StartDate").defaultValue = defaultStartDate;

      // this._getSchedule();
  }

  handleClose() {
      this.setState({showDialog: false});
  }

  updateSchedule(index, day, date, id, isNew) {
    let newDate = date.year() + "-" + (date.month() + 1) + "-" + day;
    let tiffin = {};

    this.state.schedule.map(function(data) {
        if(data.day === day){
            if(data.tiffinType === 1) {
                tiffin = {...tiffin, launch: {amount: data.amount, qty: data.qty}}
            }

            if(data.tiffinType === 2) {
                tiffin = {...tiffin, dinner: {amount: data.amount, qty: data.qty}}
            }

            if(data.tiffinType === 4) {
                tiffin = {...tiffin, breakFast: {amount: data.amount, qty: data.qty}}
            }
        }
    });

    this.setState({showDialog: true, index: index, date: newDate, tiffin: tiffin, isNew: isNew || false});
  }

  _getSchedule(date, customerId) {
		const that = this;
		console.log("this.state***********", this.state)

    getSchedule({customerId: customerId, date: date}).then(function(schedule) {
        console.log("Schedule.............", schedule);
        if(schedule.length > 0) {
            that.setState({schedule, showSchedulerInput: false});
        } else {
            that.setState({showSchedulerInput: true});

            let date = new Date();

            if(document.querySelector("#StartDate")) document.querySelector("#StartDate").valueAsDate = new Date(date.getFullYear(), date.getMonth(), 2);
            if(document.querySelector("#EndDate")) document.querySelector("#EndDate").valueAsDate =  new Date(date.getFullYear(), date.getMonth() + 1, 1);
        }
      });
  }

  isDateExistInSchedule(day, month, year) {
    let colorCode = undefined;
    let tiffinType = '';

    this.state.schedule && (this.state.schedule || []).map(function(data, index) {
        if(moment(year + '-' + month + '-' + day).isSame(moment(year + '-' + month + '-' + data.day))) {
            if(data.qty > 0) {
                tiffinType = tiffinType + data.tiffinType;
            }
        }
    });

    // TODO : check if something breaking because of change DAY From Index
    if(tiffinType.indexOf('1') > -1 && tiffinType.indexOf('2') > -1) {
        colorCode = {colorCode: 'both', index: day};
    } else if(tiffinType.indexOf('1') > -1) {
        colorCode = {colorCode: 'launch', index: day};
    } else if(tiffinType.indexOf('2') > -1) {
        colorCode = {colorCode: 'dinner', index: day};
    } else if(tiffinType === '') {
        colorCode = {colorCode: '', index: day}
    }

    return colorCode;
  }

  createCalendar = (date) => {
    const days = getDaysInMonth(date.month(), date.year());

    let table = []
    let td = [];

    let todaysDay = date.startOf('month').get('day');

    for(let i = 1; i < todaysDay; i++)
    {
        td.push(<td></td>)
    }

    todaysDay = 8 - todaysDay;

    for (let i = 1; i <= days; i++) {
        const colorCode = this.isDateExistInSchedule(i, date.month() + 1, date.year());

        if(i%(todaysDay) === 0) {
            todaysDay += 7;
            td.push(<td className={colorCode && colorCode.colorCode} onClick={() => this.updateSchedule(colorCode && colorCode.index, i, date)}>{i}</td>)
            table.push(<tr>{td}</tr>);
            td = [];
        } else {
            td.push(<td className={colorCode && colorCode.colorCode} onClick={() => this.updateSchedule(colorCode && colorCode.index, i, date)}>{i}</td>)
        }
    }

    if(td.length > 0) {
        table.push(<tr>{td}</tr>);
    }

    return table
  }

  render() {
		if(!this.state.schedule) {
			return <div>Please wait, data is loading...</div>
        }
        
        console.log("(((((((((((((", this.state.schedule);

    return (
			<div className='page-center'>
					<label><strong>{this.state.schedule && this.state.schedule[0].name}</strong> Tiffing Schedule</label>
					<hr />
           {
               this.state.showSchedulerInput && <div>
                    <Row className="show-grid">
                        <Col md={6} mdPush={6}>
                        Start Date: <FormControl type='date' name='startDate' id='StartDate' />
                        </Col>
                        <Col md={6} mdpull={6}>
                        End Date: <FormControl type='date' name='endDate' id='EndDate' />
                        </Col>
                    </Row>
                  <TiffinDropDown id="Schedule" tiffin={{breakFast: {amount: 20, qty: 1}, launch: {amount: 40, qty: 1}, dinner: {amount: 40, qty: 1} }}/> &nbsp; &nbsp;<br />
                   <label>Include Weekends:</label> &nbsp;
                   <input type="radio" id="Yes" name="drone" value="yes"
                           checked />
                   <label htmlFor="Yes">Yes</label>&nbsp;
                   <input type="radio" id="No" name="drone" value="no" />
                   <label htmlFor="No">No</label> <br />
                   {/* <label>Amount:</label> &nbsp;
                   <input type='text' name='amount' id='Amount' defaultValue='40' /> */}
                   <input type='button' name='saveSchedule' id='SaveShedule' value='Save' onClick={() => this.saveShedule(this.state.customerId)}/>
               </div>
           } 
            <div className="month"> 
                <ul>
                    <li className="prev">&#10094;</li>
                    <li className="next">&#10095;</li>
                    <li>{getMonth(getTodaysDate().month())}<br /><span>{getTodaysDate().year()}</span></li>
                </ul>
            </div>
            <table className="weekdays">
                <thead>
                <tr>
                    <td>Mo</td>
                    <td>Tu</td>
                    <td>We</td>
                    <td>Th</td>
                    <td>Fr</td>
                    <td>Sa</td>
                    <td>Su</td>
                </tr>
                </thead>
                <tbody  className="days">
                    {this.createCalendar(getTodaysDate())}
                </tbody>
            </table>
            {
                this.state.showDialog && <Schedule role='user' isNew={this.state.isNew} index={this.state.index} _id={this.state.schedule[0].id} tiffin={this.state.tiffin} customerId={this.state.customerId} date={this.state.date} setSchedule={this.setSchedule} handleClose={() => this.handleClose()}/>
            }
          </div>
        )
    }
}

export default Home;