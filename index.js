var Calendar = require('calendar');
var Popover  = require('popover');
var moment   = require('moment');
var Emitter  = require('emitter');
var delegate = require('delegate');

var DatePicker = function(options){
    
  this.hide = this.hide.bind(this);

  var el = this.el = options.el;

  // Whenever the element is clicked we shwo the picker
  el.addEventListener('click', this._onClick.bind(this));

  // A calendar view will be rendered inside of a popover
  this.calendar = new Calendar();

  // The returned date format
  this.calendar.format = options.format || el.getAttribute('data-format') || 'DD/MM/YYYY';

  // The calendar is placed in a popover that is attached
  // to the element we've passed in
  this.popover = new Popover({
    el: this.calendar.el,
    target: el,
    position: options.position
  });

  // When a date is selected in the calendar we'll
  // format the date and emit our own event.
  this.calendar.on('select', this._onDateSelect.bind(this), this);

  // Automatically assign the date to an input if there
  // is a data attribute we can use or if the attached field
  // is a text input we can just use this el.
  var target = el.getAttribute('data-target');
  if( el.nodeName === 'input' && el.getAttribute('type') === 'text') {
    this._input = el;
  }
  else if( target ) {
    this._input = document.querySelector(target);
  }

  if( this._input ) {
    this._input.addEventListener('keyup', this._onKeyUp.bind(this));
  }
};

DatePicker.prototype = {

  // Hidden by default
  isVisible: false,

  // Hide the date picker
  hide: function(){
    this.popover.hide();
    this.isVisible = false;
    document.removeEventListener('click', this.hide);
    delegate.unbind(this.calendar.el, 'click', this._onPickerClick, false);
  },
  
  _onPickerClick: function(event){
     event.stopPropagation();
  },

  // Show the date picker
  show: function(){
    document.addEventListener('click', this.hide);

    // When clicking on the calendar itself, we don't want
    // to close it, we so stop the event from bubbling up. This
    // lets the calendar close when clicking outside of the element
    delegate.bind(this.calendar.el, '.picker', 'click', this._onPickerClick);

    // Show the calendar, obviously.
    this.popover.show();
    this.isVisible = true;
  },

  // When a date is selected in the calendar
  _onDateSelect: function(str, date) {
    this.hide();

    // Set the date in a text field if one has been assigned
    if( this._input ) {
      this._input.value = str;
      this.emit('change', str);
    }

    // Trigger an event so anything watching
    // this view can do something with the date selection
    this.emit('select', str, date);
  },

  // When the element is clicked, this could be a text input
  // or any other element that has been assigned as the anchor
  // for the date picker
  _onClick: function(event) {
    event.stopPropagation();

    // if theres entered value in the textfield, call _setValue()
    if(this._input.value){
      this._setValue();
    }

    this.show();
  },

  // On keyup in the input we'll close the picker. Note: if there
  // is no input specified this event won't ever fire.
  _onKeyUp: function() {
    this.hide();
  },

  // Pass the value through to the calendar to select the specific date
  _setValue: function(){
    var fieldValue = moment(this._input.value, "DD/MM/YYYY");
    if (fieldValue.isValid()) {
      this.calendar.select(fieldValue);
    }
  }
});

Emitter(DatePicker.prototype);
module.exports = DatePicker;