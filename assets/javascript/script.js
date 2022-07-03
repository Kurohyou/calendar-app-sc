const DateTime = luxon.DateTime;

(function(){
  const currentDayContainer = document.getElementById('currentDay');
  const timeLine = document.getElementById('timeLine');
  const intervalID = 0;
  //Get local storage of events or initialize the events.
  const storageCalendar = JSON.parse(localStorage.getItem('calendarData'));
  const calendarData = storageCalendar ||
    [...Array(10).keys()]
      .reduce((memo,n) => {
        memo.data[`hour_${n+8}`] = '';
        return memo;
      },{
        storedDay:null,
        data:{}
      });
  const dateLog = {
    day:null,
    hour:null,
    minute:null
  };
  
  const saveData = (event) => {
    const saveHour = event.target.name.replace(/save_/,'');
    const textarea = $(`textarea[name="hour_${saveHour}"]`);
    calendarData.data[`hour_${saveHour}`] = textarea.val();
    localStorage.setItem('calendarData',JSON.stringify(calendarData));
  };
  
  $('.save-button').on('click',saveData);

  const loadData = () => {
    Object.entries(calendarData.data).forEach(([key,value]) => {
      $(`textarea[name="${key}"]`).val(value);
    });
  };

  /**
   * Function that polls the current date once a second and calls helper functions to update various aspects of the interface.
   */
  const syncDate = () => {
    const date = DateTime.now();
    //Updates that need to happen after a minute
    if(date.minute !== dateLog.minute){
      updateTimeLine(date);
    }
    //Updates that need to happen after an hour
    if(date.hour !== dateLog.hour){
      updateHourLight(date);
    }
    //Updates that need to happen after a day
    if(date.day !== dateLog.day){
      updateDateDisplay(date);
    }
    Object
      .keys(dateLog)
      .forEach(k => {
        dateLog[k] = date[k];
      });
    if(!intervalID){
      setInterval(syncDate,1000);
    }
    updateDailyLog();
  };

  /**
   * Function to update the position of the line that indicates the current time
   * @param {DateTime} date - The date object for the current time.
   */
  const updateTimeLine = (date) => {
    const workMinutes = 10 * 60;
    const start = DateTime.local(date.year,date.month,date.day,8,0,0);
    const diff = date.diff(start,'minutes').minutes;
    const percentage = diff / workMinutes * 100 - 100;
    timeLine.style.bottom = `${percentage * -1}%`;
  };

  /**
   * Function to update the hour highlights
   * @param {DateTime} date - The date object for the current time.
   */
  const updateHourLight = (date) => {
    const hour = date.hour;
    const timeBlocks = $(`.time-block:not(.row-${hour})`);
    const currBlock = $(`.time-block.row-${hour}`);
    timeBlocks.removeClass('current-hour');
    currBlock.addClass('current-hour');
  };

  /**
   * Function to update the display of the full date.
   * @param {DateTime} date - The date object for the current time.
   */
  const updateDateDisplay = (date) => {
    currentDayContainer.replaceChildren(date.toLocaleString(DateTime.DATE_HUGE));
  };

  const updateDailyLog = () => {
    if(dateLog.day !== calendarData.storedDay){
      console.log('dateLog',dateLog);
      console.log('storedDay',calendarData.storedDay);
      calendarData.storedDay = dateLog.day;
      Object.keys(calendarData.data).forEach(key => calendarData.data[key] = '');
      localStorage.setItem('calendarData',JSON.stringify(calendarData));
    }
  };
  
  //Begin interface sync
  loadData();
  syncDate();
})();