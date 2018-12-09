import React, { Component } from 'react';
import moment from 'moment';

import Dialog from 'react-dialog'
import { saveSchedule, getSchedule, updateSchedule } from '../httpClient';
import { getDaysInMonth, getMonth, getTodaysDate } from '../Helper';
import TiffinDropDown from '../Common/tiffinDropDown';
import Schedule from '../Dialog/Schedule';

class DialogBox extends Component {
  constructor(props) {
    super(props);
    this.state = {showDialog: false};

    this.saveShedule = this.saveShedule.bind(this);
    this._getSchedule = this._getSchedule.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  setSchedule = (data) => {
    this.setState({schedule: data});
  }

  saveShedule() {
      const that = this;

      const obj = {
        startDate: document.getElementById('StartDate').value,
        endDate: document.getElementById('EndDate').value,
        customerId: this.props.customerId,
        tiffinType: document.getElementById('TiffinType_Schedule').value,
        isWeekend: document.getElementById('Yes').checked
    }

    saveSchedule(obj).then(function(schedule) {
        console.log("Schedule.............", schedule);
        that.setState({schedule});
    });
  }
  
  getSnapshotBeforeUpdate(prevProps, prevState) {

    if(prevProps.customerId !== this.props.customerId) {
        this._getSchedule();
    }
  }

  componentDidMount() {
      this._getSchedule();
  }

  handleClose() {
      this.setState({showDialog: false});
  }

  updateSchedule(index, day, date) {
    this.setState({showDialog: true, index: index, date: date.year() + "-" + date.month() + "-" + day});
  }

  _getSchedule() {
    const that = this;

    getSchedule(this.props.customerId).then(function(schedule) {
        console.log("Schedule.............", schedule);
        that.setState({schedule});
      });
  }

  isDateExistInSchedule(day, month, year) {
    let colorCode = undefined;

    this.state.schedule && this.state.schedule[0] && (this.state.schedule[0].Date || []).map(function(data, index) {
        if(moment(year + '-' + month + '-' + day).isSame(data.date)) {
            if(data.tiffin) {
                if(data.tiffin.launch && data.tiffin.dinner) {
                    colorCode = {colorCode: 'both', index: index};
                } else if(data.tiffin.launch) {
                    colorCode = {colorCode: 'launch', index: index};
                } else if(data.tiffin.dinner) {
                    colorCode = {colorCode: 'dinner', index: index};
                }
            }
        }
    });

    return colorCode;
  }

  createCalendar = (date) => {
    const days = getDaysInMonth(date.month(), date.year());

    let table = []
    let tr = [];
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

    return (
        <Dialog
            title="Manage Schedule"
            modal={true}
            onClose={this.props.handleClose}
            buttons={
                [{
                    text: "Close",
                    onClick: () => this.props.handleClose()
                }]
            }>
            {/* {this.props.customerId} <br /> */}
            <br />
            Start Date: <input type='date' name='startDate' id='StartDate' /> &nbsp;
            End Date: <input type='date' name='endDate' id='EndDate' /> <br /><br />
            
            <div>

               <TiffinDropDown id="Schedule" /> &nbsp;
                <label>Include Weekends:</label> &nbsp;
                <input type="radio" id="Yes" name="drone" value="yes"
                        checked />
                <label htmlFor="Yes">Yes</label>&nbsp;
                <input type="radio" id="No" name="drone" value="no" />
                <label htmlFor="No">No</label>
            </div>
            <div>
               
            </div><br />
            
            <input type='button' name='saveSchedule' id='SaveShedule' value='Save' onClick={() => this.saveShedule()}/>
            <br /><br />
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
           
            {/* <li><span class="active">10</span></li> */}

            {

                this.state.showDialog && <Schedule index={this.state.index} _id={this.state.schedule[0]._id} customerId={this.state.schedule[0].CustomerId} date={this.state.date} setSchedule={this.setSchedule} handleClose={() => this.handleClose()}/>
            }
        </Dialog>
        )
    }
}

export default DialogBox;